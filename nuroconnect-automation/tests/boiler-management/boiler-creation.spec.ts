import { test, expect } from '../../src/fixtures/roleFixture';
import type { Locator, Page } from '@playwright/test';
import { testEnvironment } from '../../src/config/environment';
import { BoilersPage } from '../../src/pages/boilers/boilersPage';
import { SitesPage } from '../../src/pages/sites/sitesPage';
import { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import { SettingsExportService } from '../../src/services/settings/settingsExportService';
import { SimulatorService } from '../../src/services/simulator/simulatorService';
import {
  buildBoilerData,
  buildSimulatorRegistrationData,
  buildSimulatorUpdateData
} from '../../src/test-data/testDataFactory';
import {
  boilerSettingsTypeLabel,
  getConfiguredSetpointWriteFlags,
  getBoilerTypeFromSoftwareVersion,
  getScenarioSoftwareVersion,
  type BoilerSettingsType
} from '../../src/test-data/settingsDataHelper';
import type { RoleKey } from '../../src/types/roles';
import type { RuntimeBoilerRecord, RuntimeSiteRecord } from '../../src/types/site';
import type { AvailableDataService } from '../../src/services/data/availableDataService';
import type { TestContext } from '../../src/context/testContext';
import { logger } from '../../src/utils/logger';
import {
  loadTemperatureSensorReference,
  loadSetpointReference,
  setpointPayloadData,
  temperatureSensorPayloadData
} from '../../src/test-data/boilerInfoReferenceData';

type BoilerSiteOwnerRole = 'pkAdmin' | 'pkTech' | 'pkRep';
type BoilerAssignedRole = 'siteManager' | 'siteSupervisor' | 'siteUser';
type BoilerCreatorRole = BoilerSiteOwnerRole | BoilerAssignedRole;
type BoilerSiteRecord = RuntimeSiteRecord & { id: string };

const temperatureSensorUpdateData = temperatureSensorPayloadData(loadTemperatureSensorReference());
const setpointUpdateData = setpointPayloadData(loadSetpointReference());
const boilerInfoUpdateData = { ...temperatureSensorUpdateData, ...setpointUpdateData };

function verifyTemperatureSensorUpdateData(payloadData: Record<string, string | number | boolean>): void {
  for (const [propertyKey, rawValue] of Object.entries(temperatureSensorUpdateData)) {
    expect(payloadData[propertyKey], `${propertyKey} should use the Boiler Info reference raw value`).toBe(rawValue);
  }
}

function verifySetpointUpdateData(payloadData: Record<string, string | number | boolean>): void {
  const boilerType = getBoilerTypeFromSoftwareVersion(String(payloadData.software));
  const expectedFlags = getConfiguredSetpointWriteFlags(boilerType);
  for (const [propertyKey, rawValue] of Object.entries(setpointUpdateData)) {
    expect(payloadData[propertyKey], `${propertyKey} should use the Setpoint reference raw value`).toBe(rawValue);
  }
  for (const [flag, expectedValue] of Object.entries(expectedFlags)) {
    expect(payloadData[flag], `${flag} should match ${boilerSettingsTypeLabel(boilerType)} configuration`).toBe(expectedValue);
  }
}

const boilerRoleDisplayName: Record<BoilerCreatorRole, string> = {
  pkAdmin: 'PKAdmin',
  pkTech: 'PKTech',
  pkRep: 'PKRep',
  siteManager: 'Site Manager',
  siteSupervisor: 'Site Supervisor',
  siteUser: 'Site User'
};

/**
 * Role-to-site-owner mapping for boiler creation.
 * Defines which site each role should create/verify boilers under.
 *
 * Business Rules:
 * - PKAdmin, PKTech, PKRep create boilers under their own created sites
 * - SiteManager creates under PKAdmin's site (assigned via invitation)
 * - SiteSupervisor creates under PKTech's site (assigned via invitation)
 * - SiteUser verifies (read-only) under PKRep's site (assigned via invitation)
 */
const ROLE_TO_SITE_OWNER_MAP: Record<BoilerCreatorRole, BoilerSiteOwnerRole> = {
  pkAdmin: 'pkAdmin',
  pkTech: 'pkTech',
  pkRep: 'pkRep',
  siteManager: 'pkAdmin',       // Uses PKAdmin's site
  siteSupervisor: 'pkTech',     // Uses PKTech's site
  siteUser: 'pkRep'             // Verifies boilers under PKRep's site
};

/**
 * Resolve which site to use for boiler creation from RuntimeDataManager.
 *
 * Reads from persisted runtime data (survives across process boundaries).
 * Fails loudly if the expected site is missing (no silent fallback).
 */
function resolveSiteForBoiler(
  role: BoilerCreatorRole,
  runtimeData: typeof RuntimeDataManager
): RuntimeSiteRecord & { id: string } {
  const siteOwnerRole = ROLE_TO_SITE_OWNER_MAP[role];
  const runtime = runtimeData.requireCreatedSites();
  const targetSite = runtime.sites[siteOwnerRole];

  if (!targetSite?.id || !targetSite.name) {
    throw new Error(
      `CONFIGURATION ERROR: Site data missing for ${siteOwnerRole}.\n` +
      `Expected: ${siteOwnerRole} should have created a site before ${role} creates a boiler.\n` +
      `This indicates the site-creation tests did not run or failed.\n` +
      `DO NOT run boiler-creation tests standalone - run the full e2e sequence via run-ordered-flow.js`
    );
  }

  logger.system('Resolved site for boiler creation from RuntimeDataManager', {
    module: 'BoilerCreation',
    role,
    siteOwnerRole,
    siteName: targetSite.name,
    siteId: targetSite.id
  });

  return targetSite as RuntimeSiteRecord & { id: string };
}

async function createBoilerForRole(
  role: BoilerCreatorRole,
  siteOwnerRole: BoilerSiteOwnerRole,
  authenticatedPageForRole: (roleKey: RoleKey) => Promise<import('@playwright/test').Page>,
  runtimeData: typeof RuntimeDataManager,
  simulatorService: SimulatorService,
  testContext: TestContext,
  availableData?: AvailableDataService
): Promise<void> {
  const boilerData = buildBoilerData();
  const registrationPayload = buildSimulatorRegistrationData(testEnvironment.baseUrl);
  const registration = await simulatorService.registerSimulator(registrationPayload);
  const updatePayload = buildSimulatorUpdateData(
    testEnvironment.baseUrl,
    registration.uniqueKey,
    registrationPayload.nuro,
    registrationPayload.sola,
    getScenarioSoftwareVersion(role),
    boilerInfoUpdateData
  );
  verifyTemperatureSensorUpdateData(updatePayload.data);
  verifySetpointUpdateData(updatePayload.data);
  const simulatorUpdate = await simulatorService.updateSimulator(updatePayload);
  assertBoilerSettingsTypeFromSoftware(updatePayload.data.software, simulatorUpdate.boilerSettingsType);

  // Resolve which site to use from RuntimeDataManager (persists across processes)
  const targetSite = resolveSiteForBoiler(role, runtimeData);

  const page = await authenticatedPageForRole(role);
  const boilersPage = new BoilersPage(page);

  await boilersPage.navigateToBoilers();
  await boilersPage.clickAddNewBoiler();
  await boilersPage.enterBoilerCode(registration.code);
  await boilersPage.clickAddBoiler();
  await boilersPage.verifyBoilerInfoPage();
  await boilersPage.verifyAutoPopulatedName(registrationPayload.nuro);
  await boilersPage.verifyDeviceInfo({
    sola: registrationPayload.sola,
    nuro: registrationPayload.nuro
  });
  await boilersPage.verifyDeviceInfoReadOnly();
  await boilersPage.enterDescription(boilerData.description);

  // Select the target site by ID (not by name to avoid ambiguity)
  const selectedSiteName = await boilersPage.selectSiteIfAvailable(targetSite.name);

  if (!selectedSiteName) {
    // Target site not available in dropdown - FAIL LOUDLY
    throw new Error(
      `SITE SELECTION FAILED: Site "${targetSite.name}" (ID: ${targetSite.id}) not available in dropdown for ${role}.\n` +
      `This indicates either:\n` +
      `1. The site was not created successfully (check site-creation logs)\n` +
      `2. The site is not visible to ${role} (check permissions/assignments)\n` +
      `3. UI/API issue preventing site from appearing in dropdown\n` +
      `DO NOT silently fall back to a different site - this would create wrong-site bugs.`
    );
  }

  // Verify we actually selected the correct site by ID
  const selectedSiteId = await boilersPage.getSelectedSiteId();
  if (selectedSiteId && selectedSiteId !== targetSite.id) {
    throw new Error(
      `SITE SELECTION MISMATCH: Selected site ID "${selectedSiteId}" does not match expected ID "${targetSite.id}".\n` +
      `Expected site: ${targetSite.name} (${targetSite.id})\n` +
      `This indicates a UI selection bug or site name collision.`
    );
  }

  logger.step(`${boilerRoleDisplayName[role]} Boiler Creation selected Site: ${selectedSiteName}`, {
    module: 'BoilerCreation',
    role,
    siteName: selectedSiteName,
    siteId: targetSite.id,
    verified: true
  });

  await boilersPage.saveBoiler();
  await boilersPage.verifySaveSuccess();
  await boilersPage.searchBoiler(registrationPayload.nuro);

  logger.step(`${boilerRoleDisplayName[role]} Boiler visibility verification Site: ${targetSite.name}`, {
    module: 'BoilerCreation',
    role,
    siteName: targetSite.name,
    siteId: targetSite.id
  });

  await boilersPage.verifyCreatedBoilerSearchResult(registrationPayload.nuro, targetSite.name);
  await boilersPage.verifyBoilerTypeInSearchResult(
    registrationPayload.nuro,
    boilerSettingsTypeLabel(simulatorUpdate.boilerSettingsType)
  );

  const boilerId = await boilersPage.getBoilerIdFromResult(registrationPayload.nuro);

  // Add boiler number to test context for future site-deletion tracking
  testContext.addBoilerNumber(registrationPayload.nuro);

  runtimeData.upsertBoiler({
    id: boilerId,
    name: registrationPayload.nuro,
    description: boilerData.description,
    siteId: targetSite.id,
    siteName: targetSite.name,
    createdBy: role,
    boilerType: boilerData.boilerType,
    boilerSettingsType: simulatorUpdate.boilerSettingsType,
    softwareVersion: updatePayload.data.software,
    sola: registrationPayload.sola,
    nuro: registrationPayload.nuro,
    code: registration.code,
    uniqueKey: registration.uniqueKey,
    latestUpdatePayload: updatePayload
  });

  expect(boilerId, `created Boiler ID should be captured for ${role}`).toBeTruthy();
}

async function createBoilerForOwnSite(
  role: BoilerSiteOwnerRole,
  authenticatedPageForRole: (roleKey: RoleKey) => Promise<import('@playwright/test').Page>,
  runtimeData: typeof RuntimeDataManager,
  simulatorService: SimulatorService,
  testContext: TestContext,
  availableData: AvailableDataService
): Promise<void> {
  await createBoilerForRole(role, role, authenticatedPageForRole, runtimeData, simulatorService, testContext, availableData);
}

async function createBoilerForAssignedSite(
  role: BoilerAssignedRole,
  siteOwnerRole: BoilerSiteOwnerRole,
  authenticatedPageForRole: (roleKey: RoleKey) => Promise<import('@playwright/test').Page>,
  runtimeData: typeof RuntimeDataManager,
  simulatorService: SimulatorService,
  testContext: TestContext,
  availableData: AvailableDataService
): Promise<void> {
  await createBoilerForRole(role, siteOwnerRole, authenticatedPageForRole, runtimeData, simulatorService, testContext, availableData);
}

function requireBoilerForSite(site: RuntimeSiteRecord, runtimeData: typeof RuntimeDataManager): RuntimeBoilerRecord {
  const boiler = findBoilerForSite(site, runtimeData);
  if (!boiler) {
    throw new Error(`Runtime Boiler data is missing for Site ${site.name}. Execute Boiler Creation owner tests first.`);
  }
  return boiler;
}

function findBoilerForSite(
  site: RuntimeSiteRecord,
  runtimeData: typeof RuntimeDataManager
): RuntimeBoilerRecord | undefined {
  return Object.values(runtimeData.requireBoilers()).find((record) => record.siteId === site.id);
}

async function verifyAssignedBoilerInfoReadOnly(
  authenticatedPageForRole: (roleKey: RoleKey) => Promise<Page>,
  runtimeData: typeof RuntimeDataManager,
  simulatorService: SimulatorService,
  testContext: TestContext,
  availableData: AvailableDataService
): Promise<void> {
  // Resolve site using RuntimeDataManager (SiteUser verifies boilers under PKRep's site)
  const targetSite = resolveSiteForBoiler('siteUser', runtimeData);

  const page = await authenticatedPageForRole('siteUser');
  const boilersPage = new BoilersPage(page);

  await boilersPage.navigateToBoilers();
  const openedAddBoilerInfo = await openSiteUserAddBoilerInfoIfAvailable(page, boilersPage, simulatorService);
  if (openedAddBoilerInfo) {
    await verifySiteUserBoilerInfoReadOnly(page);
    await verifySiteUserCannotSaveBoiler(page);
    return;
  }

  // Find the boiler created under PKRep's site
  const boiler = findBoilerForSite(targetSite, runtimeData);

  if (!boiler) {
    throw new Error(
      `No boiler found for SiteUser read-only validation.\n` +
      `Expected: A boiler should exist under PKRep's site (${targetSite.name}, ID: ${targetSite.id}).\n` +
      `This indicates boiler-creation tests for PKRep did not run or failed.`
    );
  }

  logger.system('SiteUser verifying boiler read-only under PKRep site', {
    module: 'BoilerCreation',
    siteName: targetSite.name,
    siteId: targetSite.id,
    boilerName: boiler.name,
    boilerId: boiler.id
  });

  await boilersPage.searchBoiler(boiler.name);
  await boilersPage.verifyCreatedBoilerSearchResult(boiler.name, targetSite.name);
  await boilersPage.openBoilerFromSearch(boiler.name);

  await boilersPage.verifySelectedSite(targetSite.name);
  await verifySiteUserBoilerInfoReadOnly(page);
  await verifySiteUserCannotSaveBoiler(page);
}

async function openSiteUserAddBoilerInfoIfAvailable(
  page: Page,
  boilersPage: BoilersPage,
  simulatorService: SimulatorService
): Promise<boolean> {
  const addBoilerControl = page
    .getByTestId('boiler-create')
    .or(page.locator('a, button, md-button').filter({ hasText: /^add a new boiler$/i }))
    .or(page.locator('md-button.btn-fix-bottom, button.btn-fix-bottom, a.btn-fix-bottom'))
    .first();

  if (!(await addBoilerControl.isVisible().catch(() => false))) {
    await expect(addBoilerControl).toBeHidden();
    return false;
  }

  if (await isReadonlyOrDisabled(addBoilerControl)) {
    return false;
  }

  const registrationPayload = buildSimulatorRegistrationData(testEnvironment.baseUrl);
  const registration = await simulatorService.registerSimulator(registrationPayload);
  const updatePayload = buildSimulatorUpdateData(
    testEnvironment.baseUrl,
    registration.uniqueKey,
    registrationPayload.nuro,
    registrationPayload.sola,
    getScenarioSoftwareVersion('siteUser'),
    boilerInfoUpdateData
  );
  verifyTemperatureSensorUpdateData(updatePayload.data);
  verifySetpointUpdateData(updatePayload.data);
  const simulatorUpdate = await simulatorService.updateSimulator(updatePayload);
  assertBoilerSettingsTypeFromSoftware(updatePayload.data.software, simulatorUpdate.boilerSettingsType);

  await boilersPage.clickAddNewBoiler();
  await boilersPage.enterBoilerCode(registration.code);
  await boilersPage.clickAddBoiler();
  await boilersPage.verifyBoilerInfoPage();
  await boilersPage.verifyAutoPopulatedName(registrationPayload.nuro);
  await boilersPage.verifyDeviceInfo({
    sola: registrationPayload.sola,
    nuro: registrationPayload.nuro
  });

  return true;
}

async function verifySiteUserBoilerInfoReadOnly(page: Page): Promise<void> {
  const fields = [
    page.getByTestId('boiler-name').or(page.locator('input[ng-model="vm.boiler.name"]')).or(page.getByLabel(/^name$/i)).first(),
    page
      .getByTestId('boiler-description')
      .or(page.locator('input[ng-model="vm.boiler.description"]'))
      .or(page.getByLabel(/^description$/i))
      .first(),
    page
      .getByTestId('boiler-site')
      .or(page.locator('md-select[ng-model="vm.selectedSiteId"], md-select[ng-model="vm.boiler.siteId"], md-select[ng-model="vm.boiler.site"]'))
      .or(page.getByLabel(/^site$/i))
      .first(),
    page
      .getByTestId('boiler-sola')
      .or(page.locator('input[ng-model*="sola" i]'))
      .or(page.getByLabel(/sola/i))
      .first(),
    page
      .getByTestId('boiler-nuro')
      .or(page.locator('input[ng-model*="nuro" i]'))
      .or(page.getByLabel(/nuro/i))
      .first()
  ];

  for (const field of fields) {
    if (await field.isVisible().catch(() => false)) {
      await expect
        .poll(() => isReadonlyOrDisabled(field), {
          message: 'Site User Boiler information field should be read-only or disabled'
        })
        .toBe(true);
    }
  }
}

async function verifySiteUserCannotSaveBoiler(page: Page): Promise<void> {
  const saveButton = page
    .getByTestId('boiler-save')
    .or(page.getByRole('button', { name: /^save$/i }))
    .or(page.locator('button, md-button').filter({ hasText: /^save$/i }))
    .first();

  await expect(saveButton).toBeHidden();
}

async function isReadonlyOrDisabled(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => {
    const control = element as HTMLInputElement;
    return (
      control.disabled ||
      control.readOnly ||
      element.getAttribute('aria-disabled') === 'true' ||
      element.hasAttribute('disabled') ||
      element.classList.contains('md-disabled')
    );
  });
}

function assertBoilerSettingsTypeFromSoftware(softwareVersion: string, actualBoilerType: BoilerSettingsType): void {
  const expectedBoilerType = getBoilerTypeFromSoftwareVersion(softwareVersion);
  expect(actualBoilerType, `Software ${softwareVersion} should resolve to ${boilerSettingsTypeLabel(expectedBoilerType)}`).toBe(
    expectedBoilerType
  );
}

test.describe('Boiler Management - Boiler Creation', () => {

  test.beforeAll(() => {
    SettingsExportService.exportBoilerSettings();
  });

  test('Verify PKAdmin can create a boiler and that it is visible under the correct site', async ({
    authenticatedPageForRole,
    runtimeData,
    availableData,
    testContext,
    request
  }) => {
    await createBoilerForOwnSite('pkAdmin', authenticatedPageForRole, runtimeData, new SimulatorService(request), testContext, availableData);
  });

  test('Verify PKTech can create a boiler and that it is visible under the correct site', async ({
    authenticatedPageForRole,
    runtimeData,
    availableData,
    testContext,
    request
  }) => {
    await createBoilerForOwnSite('pkTech', authenticatedPageForRole, runtimeData, new SimulatorService(request), testContext, availableData);
  });

  test('Verify PKRep can create a boiler and that it is visible under the correct site', async ({
    authenticatedPageForRole,
    runtimeData,
    availableData,
    testContext,
    request
  }) => {
    await createBoilerForOwnSite('pkRep', authenticatedPageForRole, runtimeData, new SimulatorService(request), testContext, availableData);
  });

  test('Verify Site Manager can create a boiler for a site assigned by another user and that the boiler is visible under the correct site', async ({
    authenticatedPageForRole,
    runtimeData,
    availableData,
    testContext,
    request
  }) => {
    await createBoilerForAssignedSite(
      'siteManager',
      'pkAdmin',
      authenticatedPageForRole,
      runtimeData,
      new SimulatorService(request),
      testContext,
      availableData
    );
  });

  test('Verify Site supervisor can create a boiler for a site assigned by another user and that the boiler is visible under the correct site', async ({
    authenticatedPageForRole,
    runtimeData,
    availableData,
    testContext,
    request
  }) => {
    await createBoilerForAssignedSite(
      'siteSupervisor',
      'pkTech',
      authenticatedPageForRole,
      runtimeData,
      new SimulatorService(request),
      testContext,
      availableData
    );
  });

  test('Verify that the Boiler information is displayed in read-only mode when a Site User opens a boiler from a site assigned by another user', async ({
    authenticatedPageForRole,
    runtimeData,
    availableData,
    testContext,
    request
  }) => {
    await verifyAssignedBoilerInfoReadOnly(
      authenticatedPageForRole,
      runtimeData,
      new SimulatorService(request),
      testContext,
      availableData
    );
  });
});
