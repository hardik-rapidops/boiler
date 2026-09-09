import type { Page } from '@playwright/test';
import { test } from '../../src/fixtures/roleFixture';
import { SitesPage } from '../../src/pages/sites/sitesPage';
import { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import type { AvailableDataService } from '../../src/services/data/availableDataService';
import type { TestContext } from '../../src/context/testContext';
import { buildUpdatedSiteData } from '../../src/test-data/testDataFactory';
import type { RuntimeSiteRecord } from '../../src/types/site';
import type { RoleKey } from '../../src/types/roles';
import { logger } from '../../src/utils/logger';

type AuthenticatedPageForRole = (roleKey: RoleKey) => Promise<Page>;
type CreatorRole = 'pkAdmin' | 'pkTech' | 'pkRep';

type UpdateScenario = {
  siteOwnerRole: CreatorRole;
  actingRole: RoleKey;
  requiresAssignment: boolean;
};

async function requireCurrentSite(
  siteOwnerRole: CreatorRole,
  actingRole: RoleKey,
  runtimeData: typeof RuntimeDataManager,
  availableData: AvailableDataService,
  testContext: TestContext
): Promise<RuntimeSiteRecord> {
  const site = runtimeData.requireCreatedSites().sites[siteOwnerRole];
  if (!site?.id || !site.name) {
    throw new Error(`Runtime site data is missing for ${siteOwnerRole}. Execute site-creation test first.`);
  }

  logger.system('Resolving current site for update', {
    module: 'SiteUpdate',
    siteOwnerRole,
    actingRole,
    siteName: site.name,
    siteId: site.id,
    contextSiteName: testContext.getCurrentSiteName()
  });

  const currentSite = await availableData.getAvailableSiteForRoleById(actingRole, site.id);
  if (!currentSite) {
    throw new Error(`Site ${site.id} is not available for ${actingRole}. Verify Site creation and assignment before Site Update.`);
  }

  const reconciledSite: RuntimeSiteRecord = {
    ...site,
    ...currentSite,
    createdBy: site.createdBy,
    invitedUsers: site.invitedUsers,
    assignedUsers: site.assignedUsers
  };
  // Always update runtime data to reflect current API state (not just when name changes)
  // This ensures subsequent tests see the latest site details even if this site was updated by a previous test
  runtimeData.upsertSite(siteOwnerRole, reconciledSite);
  return reconciledSite;
}

async function updateSiteAndVerify(
  scenario: UpdateScenario,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  availableData: AvailableDataService,
  testContext: TestContext
): Promise<void> {
  const currentSite = await requireCurrentSite(
    scenario.siteOwnerRole,
    scenario.actingRole,
    runtimeData,
    availableData,
    testContext
  );
  if (scenario.requiresAssignment) {
    runtimeData.requireInvitedUser(scenario.siteOwnerRole, scenario.actingRole);
  }

  const updatedSite = buildUpdatedSiteData(currentSite);
  const updatePage = await authenticatedPageForRole(scenario.actingRole);
  const sitesPage = new SitesPage(updatePage);

  // Log the site being updated for debugging
  logger.system('Updating site details', {
    module: 'SiteUpdate',
    currentSiteName: currentSite.name,
    currentSiteId: currentSite.id,
    updatedSiteName: updatedSite.name,
    siteOwnerRole: scenario.siteOwnerRole,
    actingRole: scenario.actingRole
  });

  // Open site by ID to avoid ambiguity when user has multiple sites
  if (!currentSite.id) {
    throw new Error(`Site ID is missing for ${currentSite.name}. Cannot update site without ID.`);
  }
  await sitesPage.openSiteById(currentSite.id, currentSite.name);

  // Verify we opened the correct site before editing
  await sitesPage.verifyCurrentSiteId(currentSite.id);

  await sitesPage.openSiteEditMode();
  await sitesPage.verifySiteFieldsEnabled();
  await sitesPage.updateSiteDetails(updatedSite);
  await sitesPage.saveSiteUpdate();
  await sitesPage.verifyUpdateSuccess();
  runtimeData.updateSite(scenario.siteOwnerRole, updatedSite);

  // Note: Site names don't actually change (backend limitation per testDataFactory.ts:49),
  // so we don't need to call testContext.updateCurrentSiteName() here.
  // If backend supports name changes in the future, uncomment the line below:
  // if (updatedSite.name !== currentSite.name) {
  //   testContext.updateCurrentSiteName(updatedSite.name);
  // }

  const verificationPage = await authenticatedPageForRole(scenario.actingRole);
  const verificationSitesPage = new SitesPage(verificationPage);
  await verificationSitesPage.verifyUpdatedSiteSearchable(updatedSite.name);
  await verificationSitesPage.openSiteFromSearch(updatedSite.name);
  await verificationSitesPage.verifySiteDetails(updatedSite);

}

test.describe('Site Management - Site Update', () => {

  test.describe('Users update Sites created by themselves', () => {
    // test('Verify When PKAdmin updates the PKAdmin-created Site then updated details are searchable', async ({
    //   authenticatedPageForRole,
    //   runtimeData,
    //   availableData
    // }) => {
    //   await updateSiteAndVerify(
    //     { siteOwnerRole: 'pkAdmin', actingRole: 'pkAdmin', requiresAssignment: false },
    //     authenticatedPageForRole,
    //     runtimeData,
    //     availableData
    //   );
    // });

    // test('Verify When PKTech updates the PKTech-created Site then updated details are searchable', async ({
    //   authenticatedPageForRole,
    //   runtimeData,
    //   availableData
    // }) => {
    //   await updateSiteAndVerify(
    //     { siteOwnerRole: 'pkTech', actingRole: 'pkTech', requiresAssignment: false },
    //     authenticatedPageForRole,
    //     runtimeData,
    //     availableData
    //   );
    // });

  //   test('Verify When PKRep updates the PKRep-created Site then updated details are searchable', async ({
  //     authenticatedPageForRole,
  //     runtimeData,
  //     availableData
  //   }) => {
  //     await updateSiteAndVerify(
  //       { siteOwnerRole: 'pkRep', actingRole: 'pkRep', requiresAssignment: false },
  //       authenticatedPageForRole,
  //       runtimeData,
  //       availableData
  //     );
  //   });
  });

  test.describe('Assigned user Site Update permissions', () => {
    test('Verify When Site Manager updates the assigned PKAdmin Site then updated details are searchable', async ({
      authenticatedPageForRole,
      runtimeData,
      availableData,
      testContext
    }) => {
      await updateSiteAndVerify(
        { siteOwnerRole: 'pkAdmin', actingRole: 'siteManager', requiresAssignment: true },
        authenticatedPageForRole,
        runtimeData,
        availableData,
        testContext
      );
    });

    test('Verify When Site Supervisor updates the assigned PKTech Site then updated details are searchable', async ({
      authenticatedPageForRole,
      runtimeData,
      availableData,
      testContext
    }) => {
      await updateSiteAndVerify(
        { siteOwnerRole: 'pkTech', actingRole: 'siteSupervisor', requiresAssignment: true },
        authenticatedPageForRole,
        runtimeData,
        availableData,
        testContext
      );
    });

    test('Verify When Site User opens the assigned PKRep Site then Site details cannot be updated', async ({
      authenticatedPageForRole,
      runtimeData,
      availableData,
      testContext
    }) => {
      const site = await requireCurrentSite('pkRep', 'siteUser', runtimeData, availableData, testContext);
      runtimeData.requireInvitedUser('pkRep', 'siteUser');

      const page = await authenticatedPageForRole('siteUser');
      const sitesPage = new SitesPage(page);

      // Open site by ID to avoid ambiguity when user has multiple sites
      if (!site.id) {
        throw new Error(`Site ID is missing for ${site.name}. Cannot verify site without ID.`);
      }
      await sitesPage.openSiteById(site.id, site.name);
      await sitesPage.verifyCurrentSiteId(site.id);
      await sitesPage.verifySiteFieldsDisabledOrReadOnly();
      await sitesPage.verifyBoilerAlertsNotificationOptionHidden();
      await sitesPage.verifySaveButtonStateDoesNotGrantUpdateAccess();
    });
  });
});
