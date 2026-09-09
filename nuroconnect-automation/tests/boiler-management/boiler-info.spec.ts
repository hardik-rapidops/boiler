import type { APIRequestContext, Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures/roleFixture';
import { testEnvironment } from '../../src/config/environment';
import { BoilerInfoPage } from '../../src/pages/boilers/boilerInfoPage';
import { BoilersPage } from '../../src/pages/boilers/boilersPage';
import { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import { SimulatorService } from '../../src/services/simulator/simulatorService';
import type { AvailableDataService } from '../../src/services/data/availableDataService';
import type { TestContext } from '../../src/context/testContext';
import { logger } from '../../src/utils/logger';
import {
  analogSignalExpectedFromPayload,
  analogSignalPayloadData,
  getExpectedBoilerColorFromErrorType,
  loadAnalogSignalReference,
  loadStateStatusErrorReference,
  loadTemperatureSensorReference,
  loadSetpointReference,
  setpointExpectedFromPayload,
  setpointPayloadData,
  stateStatusErrorPayloadData,
  temperatureSensorExpectedFromPayload,
  temperatureSensorPayloadData
} from '../../src/test-data/boilerInfoReferenceData';
import {
  getErrorNameForBoilerPayload,
  getSettingsForBoilerPayload,
  getStateLabelForBoilerPayload,
  getStatusLabelForBoilerPayload,
  resolveExpectedBoilerInfo
} from '../../src/test-data/boilerSettingsResolver';
import { buildUpdatePayload } from '../../src/test-data/testDataFactory';
import {
  getBoilerTypeFromSoftwareVersion,
  boilerSettingsTypeLabel,
  getConfiguredErrorType,
  getConfiguredSetpointWriteFlags,
  loadBoilerSettingsConfig,
  type BoilerSettingsType
} from '../../src/test-data/settingsDataHelper';
import type { RoleKey } from '../../src/types/roles';
import type {
  RuntimeBoilerExpectedInfo,
  RuntimeBoilerRecord,
  RuntimeSimulatorUpdatePayload
} from '../../src/types/site';

type AuthenticatedPageForRole = (roleKey: RoleKey) => Promise<Page>;
type OpenBoilerInfoResult = {
  boiler: RuntimeBoilerRecord;
  boilersPage: BoilersPage;
  boilerInfoPage: BoilerInfoPage;
  expectedInfo: RuntimeBoilerExpectedInfo;
  updatePayload: RuntimeSimulatorUpdatePayload;
};

type SearchBoilerInfoResult = OpenBoilerInfoResult & {
  payloadBrand: string;
};

const configuredBoilerTypes = Object.entries(loadBoilerSettingsConfig().boilerTypes);
const temperatureSensors = loadTemperatureSensorReference();
const setpointProperties = loadSetpointReference();
const analogSignalProperties = loadAnalogSignalReference();
const stateStatusErrorProperties = loadStateStatusErrorReference();
const colorLogicTestTitles: Record<string, string> = {
  weilMcLain:
    'Verify the Boiler is displayed with a red background when errortype is 1 for a Weil-McLain Boiler.',
  pattersonKelley:
    'Verify the Boiler is displayed with a yellow background when errortype is 2 for a Patterson-Kelley Boiler.'
};

async function updateAndSearchBoilerInfo(
  boilerSettingsType: BoilerSettingsType,
  expectedBrand: string,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  availableData: AvailableDataService,
  request: APIRequestContext,
  testContext: TestContext,
  extraData?: Record<string, number>,
  reuseLatestPayload = false
): Promise<SearchBoilerInfoResult> {
  logger.system('Resolving boiler for info test', {
    module: 'BoilerInfo',
    boilerSettingsType,
    expectedBrand,
    contextSiteName: testContext.getCurrentSiteName(),
    contextBoilerNumbers: testContext.getBoilerNumbers()
  });

  let boiler = await runtimeData.getBoilerDataOrFallback(availableData, boilerSettingsType);
  const currentApiBoiler = await availableData.getAvailableBoilerByNuro(boiler.nuro);
  if (!currentApiBoiler) {
    const fallbackBoiler = await availableData.getLatestAvailableBoilerByType(boilerSettingsType);
    if (!fallbackBoiler) throw new Error('No Boiler found. Please create a Boiler before executing this test.');
    boiler = fallbackBoiler;
    runtimeData.upsertBoiler(boiler);
  }
  if (!boiler.softwareVersion) {
    throw new Error(`Software version is missing for Boiler ${boiler.nuro}. Execute boiler-creation test first.`);
  }

  const softwareBoilerType = getBoilerTypeFromSoftwareVersion(boiler.softwareVersion);
  if (boiler.boilerSettingsType !== boilerSettingsType || softwareBoilerType !== boilerSettingsType) {
    throw new Error(
      `Boiler type mismatch for ${boiler.nuro}: expected ${boilerSettingsType}, ` +
        `runtime=${boiler.boilerSettingsType ?? 'missing'}, software=${softwareBoilerType}.`
    );
  }

  const payloadFor = (record: RuntimeBoilerRecord) =>
    buildUpdatePayload({
      baseUrl: testEnvironment.baseUrl,
      uniqueKey: record.uniqueKey,
      sola: record.sola,
      nuro: record.nuro,
      software: record.softwareVersion as string,
      extraData
    });
  let updatePayload: ReturnType<typeof buildUpdatePayload>;
  if (reuseLatestPayload) {
    if (!boiler.latestUpdatePayload) {
      throw new Error(`Latest Boiler Info payload is missing for ${boiler.nuro}. Execute the preceding Boiler Info scenario first.`);
    }
    updatePayload = { ...boiler.latestUpdatePayload, base_url: testEnvironment.baseUrl } as ReturnType<
      typeof buildUpdatePayload
    >;
  } else {
    updatePayload = payloadFor(boiler);
    try {
      await new SimulatorService(request).updateSimulator(updatePayload);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('401')) throw error;
      const fallbackBoiler = await availableData.getLatestAvailableBoilerByType(boilerSettingsType);
      if (!fallbackBoiler) throw new Error('No Boiler found. Please create a Boiler before executing this test.');
      boiler = fallbackBoiler;
      runtimeData.upsertBoiler(boiler);
      if (!boiler.softwareVersion || !boiler.uniqueKey || !boiler.sola || !boiler.latestUpdatePayload) {
        throw new Error('No Boiler found. Please create a Boiler before executing this test.');
      }
      updatePayload = {
        ...boiler.latestUpdatePayload,
        base_url: testEnvironment.baseUrl
      } as ReturnType<typeof buildUpdatePayload>;
    }
  }

  const expectedInfo = resolveExpectedBoilerInfo(updatePayload);
  if (expectedInfo.brand !== expectedBrand) {
    throw new Error(
      `Boiler brand mapping mismatch for ${boiler.nuro}: expected ${expectedBrand}, resolved ${expectedInfo.brand}.`
    );
  }
  runtimeData.updateBoilerInfoValidation(boiler.id, updatePayload, expectedInfo);

  const page = await authenticatedPageForRole('pkAdmin');
  const boilersPage = new BoilersPage(page);
  const boilerInfoPage = new BoilerInfoPage(page);
  await boilersPage.searchBoiler(boiler.nuro);
  await boilersPage.verifyBoilerInSearchResult(boiler.nuro);
  const payloadBoilerType = getSettingsForBoilerPayload(updatePayload).boilerType;
  const payloadBrand = boilerSettingsTypeLabel(payloadBoilerType);

  return { boiler, boilersPage, boilerInfoPage, expectedInfo, updatePayload, payloadBrand };
}

async function updateAndOpenBoilerInfo(
  boilerSettingsType: BoilerSettingsType,
  expectedBrand: string,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  availableData: AvailableDataService,
  request: APIRequestContext,
  testContext: TestContext,
  extraData?: Record<string, number>,
  reuseLatestPayload = false
): Promise<OpenBoilerInfoResult> {
  const result = await updateAndSearchBoilerInfo(
    boilerSettingsType,
    expectedBrand,
    authenticatedPageForRole,
    runtimeData,
    availableData,
    request,
    testContext,
    extraData,
    reuseLatestPayload
  );
  await result.boilersPage.openBoilerDetailsFromSearch(result.boiler.nuro, result.payloadBrand);
  await result.boilerInfoPage.openBoilerInfo(result.boiler.nuro);
  return result;
}

test.describe('Boiler Management - Boiler Info', () => {
  for (const [configuredType, boilerTypeConfig] of configuredBoilerTypes) {
    const boilerSettingsType = configuredType as BoilerSettingsType;

    test.describe(`${boilerTypeConfig.displayName} Boiler Info`, () => {

      test(`Verify When PKAdmin searches a ${boilerTypeConfig.displayName} Boiler by Nuro Number then Boiler Info matches the latest simulator update`, async ({
        authenticatedPageForRole,
        runtimeData,
        availableData,
        request,
        testContext
      }) => {
        const sensorPayload = temperatureSensorPayloadData(temperatureSensors);
        const { boiler, boilerInfoPage, expectedInfo, updatePayload } = await updateAndOpenBoilerInfo(
          boilerSettingsType,
          boilerTypeConfig.displayName,
          authenticatedPageForRole,
          runtimeData,
          availableData,
          request,
          testContext,
          sensorPayload
        );

        await boilerInfoPage.verifyNuroNumber(boiler.nuro);
        await boilerInfoPage.verifyBoilerSite(boiler.siteName);
        await boilerInfoPage.verifyBoilerMode(expectedInfo.mode);
        await boilerInfoPage.verifyBoilerState(expectedInfo.state);
        await boilerInfoPage.verifyBoilerStatus(getStatusLabelForBoilerPayload(updatePayload));
        await boilerInfoPage.verifyBoilerBrand(expectedInfo.brand);
        await boilerInfoPage.verifyUpdatedTimeFormat();
        await boilerInfoPage.verifyModelPlaceholderOnly();
        await boilerInfoPage.verifyDeviceInfoReadOnlyIfApplicable();
      });

      test(`Verify When PKAdmin opens a ${boilerTypeConfig.displayName} Boiler then Temperature Sensors display read-only reference values`, async ({
        authenticatedPageForRole,
        runtimeData,
        availableData,
        request,
        testContext
      }) => {
        const sensorPayload = temperatureSensorPayloadData(temperatureSensors);
        const { boilerInfoPage, updatePayload } = await updateAndOpenBoilerInfo(
          boilerSettingsType,
          boilerTypeConfig.displayName,
          authenticatedPageForRole,
          runtimeData,
          availableData,
          request,
          testContext,
          sensorPayload
        );

        const expectedSensors = temperatureSensorExpectedFromPayload(temperatureSensors, updatePayload.data);
        for (const sensor of expectedSensors) {
          expect(
            updatePayload.data[sensor.payloadPropertyKey],
            `${sensor.propertyKey} should use decimal raw data`
          ).toBe(sensor.rawValue);
        }
        await boilerInfoPage.verifyReadOnlyBoilerInfoValues(expectedSensors);
        await boilerInfoPage.verifyNoTemperatureSensorEditActions(expectedSensors);
      });

      test(`Verify When PKAdmin opens a ${boilerTypeConfig.displayName} Boiler then Analog Signal Properties display read-only reference values`, async ({
        authenticatedPageForRole,
        runtimeData,
        availableData,
        request,
        testContext
      }) => {
        const analogSignalPayload = analogSignalPayloadData(analogSignalProperties);
        const { boilerInfoPage, updatePayload } = await updateAndOpenBoilerInfo(
          boilerSettingsType,
          boilerTypeConfig.displayName,
          authenticatedPageForRole,
          runtimeData,
          availableData,
          request,
          testContext,
          analogSignalPayload
        );

        const expectedAnalogSignalFields = analogSignalExpectedFromPayload(analogSignalProperties, updatePayload.data);
        for (const field of expectedAnalogSignalFields) {
          expect(
            updatePayload.data[field.payloadPropertyKey],
            `${field.propertyKey} should use decimal raw data`
          ).toBe(field.rawValue);
        }
        await boilerInfoPage.verifyReadOnlyBoilerInfoValues(expectedAnalogSignalFields);
        await boilerInfoPage.verifyNoReadOnlyInfoEditActions(expectedAnalogSignalFields);
      });

      test(`Verify When PKAdmin opens a ${boilerTypeConfig.displayName} Boiler then State Status Error Properties display read-only reference values`, async ({
        authenticatedPageForRole,
        runtimeData,
        availableData,
        request,
        testContext
      }) => {
        const stateStatusErrorPayload = stateStatusErrorPayloadData(stateStatusErrorProperties);
        const { boilerInfoPage, expectedInfo, updatePayload } = await updateAndOpenBoilerInfo(
          boilerSettingsType,
          boilerTypeConfig.displayName,
          authenticatedPageForRole,
          runtimeData,
          availableData,
          request,
          testContext,
          stateStatusErrorPayload
        );

        for (const field of stateStatusErrorProperties) {
          const expectedRawValue =
            field.payloadPropertyKey === 'errortype'
              ? getConfiguredErrorType(boilerSettingsType)
              : field.rawValue;
          expect(
            updatePayload.data[field.payloadPropertyKey],
            `${field.propertyKey} should use decimal raw data`
          ).toBe(expectedRawValue);
        }
        await boilerInfoPage.verifyBoilerState(getStateLabelForBoilerPayload(updatePayload));
        await boilerInfoPage.verifyBoilerStatus(getStatusLabelForBoilerPayload(updatePayload));
        if (Number(updatePayload.data.errortype) === 0) {
          await boilerInfoPage.verifyErrorCodeBannerHidden();
        } else {
          await boilerInfoPage.verifyErrorCodeBanner(
            Number(updatePayload.data.errorcode),
            getErrorNameForBoilerPayload(updatePayload)
          );
        }
        await boilerInfoPage.verifyDeviceInfoReadOnlyIfApplicable();
      });

      test(`Verify When PKAdmin opens a ${boilerTypeConfig.displayName} Boiler then Setpoint Properties follow configured write permissions`, async ({
        authenticatedPageForRole,
        runtimeData,
        availableData,
        request,
        testContext
      }) => {
        const setpointData = setpointPayloadData(setpointProperties);
        const { boilerInfoPage, updatePayload } = await updateAndOpenBoilerInfo(
          boilerSettingsType,
          boilerTypeConfig.displayName,
          authenticatedPageForRole,
          runtimeData,
          availableData,
          request,
          testContext,
          setpointData
        );

        const payloadType = getBoilerTypeFromSoftwareVersion(updatePayload.data.software);
        const expectedFlags = getConfiguredSetpointWriteFlags(payloadType);
        const expectedSetpoints = setpointExpectedFromPayload(setpointProperties, updatePayload.data);
        for (const field of expectedSetpoints) {
          expect(updatePayload.data[field.writeFlag]).toBe(expectedFlags[field.writeFlag]);
        }
        const writable = Object.values(expectedFlags).every(Boolean);
        await boilerInfoPage.verifySetpointProperties(expectedSetpoints, writable);
      });
    });
  }

  test.describe('Boiler Background Color Logic', () => {
    for (const [configuredType, boilerTypeConfig] of configuredBoilerTypes) {
      const boilerSettingsType = configuredType as BoilerSettingsType;

      test(colorLogicTestTitles[boilerSettingsType] ?? `Verify the Boiler background color matches Error Type color logic for a ${boilerTypeConfig.displayName} Boiler.`, async ({
        authenticatedPageForRole,
        runtimeData,
        availableData,
        request,
        testContext
      }) => {
        const expectedErrorType = getConfiguredErrorType(boilerSettingsType);
        const colorRule = getExpectedBoilerColorFromErrorType(expectedErrorType, boilerSettingsType);
        const { boiler, boilersPage, boilerInfoPage, updatePayload, payloadBrand } = await updateAndSearchBoilerInfo(
          boilerSettingsType,
          boilerTypeConfig.displayName,
          authenticatedPageForRole,
          runtimeData,
          availableData,
          request,
          testContext,
          { errortype: expectedErrorType }
        );

        expect(updatePayload.data.errortype, `${boilerTypeConfig.displayName} should use configured errortype`).toBe(
          expectedErrorType
        );
        await boilersPage.verifyBoilerBackgroundColor(boiler.nuro, colorRule.backgroundColor, colorRule.cssClass);
        await boilersPage.openBoilerDetailsFromSearch(boiler.nuro, payloadBrand);
        await boilerInfoPage.openBoilerInfo(boiler.nuro);
      });
    }
  });
});
