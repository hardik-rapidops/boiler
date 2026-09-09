import type { RuntimeBoilerExpectedInfo, RuntimeSimulatorUpdatePayload } from '../types/site';
import {
  boilerSettingsTypeLabel,
  getBoilerSettingsByType,
  getBoilerTypeFromSoftwareVersion,
  loadBoilerSettingsConfig,
  type BoilerSettingsData,
  type BoilerSettingsType
} from './settingsDataHelper';

export type BoilerSettingCategory =
  | 'errorCode'
  | 'stateCode'
  | 'statusCode'
  | 'userTitle'
  | 'relayText'
  | 'activeModeDemand';

export type BoilerPayloadSettings = {
  boilerType: BoilerSettingsType;
  settings: BoilerSettingsData;
};

const categoryConfig: Record<BoilerSettingCategory, { collection: keyof BoilerSettingsData; numberKey: string; nameKey: string }> = {
  errorCode: { collection: 'errorCodes', numberKey: 'Error Number', nameKey: 'Error Name' },
  stateCode: { collection: 'stateCodes', numberKey: 'Number', nameKey: 'Name' },
  statusCode: { collection: 'statusCodes', numberKey: 'Number', nameKey: 'Name' },
  userTitle: { collection: 'userTitles', numberKey: 'Number', nameKey: 'Title Name' },
  relayText: { collection: 'relayText', numberKey: 'Number', nameKey: 'Name' },
  activeModeDemand: { collection: 'activeModeDemand', numberKey: 'Number', nameKey: 'Name' }
};

export function resolveBoilerSetting(
  boilerType: BoilerSettingsType,
  category: BoilerSettingCategory,
  code: string | number,
  relay?: 'A' | 'B' | 'C' | 'D'
): string {
  return resolveSettingFromSnapshot(boilerType, getBoilerSettingsByType(boilerType), category, code, relay);
}

export function getSettingsForBoilerPayload(payload: RuntimeSimulatorUpdatePayload): BoilerPayloadSettings {
  const boilerType = getBoilerTypeFromSoftwareVersion(payload.data.software);
  const settings = structuredClone(getBoilerSettingsByType(boilerType));
  return { boilerType, settings };
}

export function getStatusLabelForBoilerPayload(payload: RuntimeSimulatorUpdatePayload): string {
  const { boilerType, settings } = getSettingsForBoilerPayload(payload);
  return resolveSettingFromSnapshot(
    boilerType,
    settings,
    'statusCode',
    requiredNumber(payload, 'status')
  );
}

export function getStateLabelForBoilerPayload(payload: RuntimeSimulatorUpdatePayload): string {
  const { boilerType, settings } = getSettingsForBoilerPayload(payload);
  return resolveSettingFromSnapshot(
    boilerType,
    settings,
    'stateCode',
    requiredNumber(payload, 'state')
  );
}

export function getErrorNameForBoilerPayload(payload: RuntimeSimulatorUpdatePayload): string {
  const { boilerType, settings } = getSettingsForBoilerPayload(payload);
  return resolveSettingFromSnapshot(
    boilerType,
    settings,
    'errorCode',
    requiredNumber(payload, 'errorcode')
  );
}

function resolveSettingFromSnapshot(
  boilerType: BoilerSettingsType,
  settings: BoilerSettingsData,
  category: BoilerSettingCategory,
  code: string | number,
  relay?: 'A' | 'B' | 'C' | 'D'
): string {
  const override = loadBoilerSettingsConfig().displayOverrides?.[boilerType]?.[category]?.[String(code)];
  if (override) {
    return override;
  }

  const config = categoryConfig[category];
  const rows = settings[config.collection];
  const expectedCode = String(code);
  const row = rows.find(
    (candidate) =>
      candidate[config.numberKey] === expectedCode &&
      (category !== 'relayText' || !relay || candidate.Relay?.toUpperCase() === relay)
  );
  const value = row?.[config.nameKey]?.trim();
  if (!value) {
    const relayContext = relay ? ` for Relay ${relay}` : '';
    throw new Error(`Boiler setting ${category} code ${expectedCode}${relayContext} is missing for ${boilerType}.`);
  }
  return value;
}

export function resolveExpectedBoilerInfo(payload: RuntimeSimulatorUpdatePayload): RuntimeBoilerExpectedInfo {
  const { boilerType, settings } = getSettingsForBoilerPayload(payload);
  const relayFields = [
    ['relayassignmenta', 'A'],
    ['relayassignmentb', 'B'],
    ['relayassignmentc', 'C'],
    ['relayassignmentd', 'D']
  ] as const;

  return {
    mode: getModeFromCascade(requiredNumber(payload, 'cascade')),
    state: resolveSettingFromSnapshot(boilerType, settings, 'stateCode', requiredNumber(payload, 'state')),
    status: resolveSettingFromSnapshot(boilerType, settings, 'statusCode', requiredNumber(payload, 'status')),
    brand: boilerSettingsTypeLabel(boilerType),
    errorName: resolveSettingFromSnapshot(boilerType, settings, 'errorCode', requiredNumber(payload, 'errorcode')),
    relayAssignments: relayFields.map(([field, relay]) =>
      resolveSettingFromSnapshot(boilerType, settings, 'relayText', requiredNumber(payload, field), relay)
    ),
    activeModeDemand:
      payload.data.activedemand === undefined
        ? undefined
        : resolveSettingFromSnapshot(boilerType, settings, 'activeModeDemand', requiredNumber(payload, 'activedemand'))
  };
}

export function getModeFromCascade(cascade: number): string {
  const modes: Record<number, string> = {
    0: 'Standalone',
    1: 'Cascade Master',
    2: 'Cascade Member'
  };
  const mode = modes[cascade];
  if (!mode) throw new Error(`Unsupported Boiler cascade value: ${cascade}`);
  return mode;
}

function requiredNumber(payload: RuntimeSimulatorUpdatePayload, field: string): number {
  const value = payload.data[field];
  if (typeof value !== 'number') {
    throw new Error(`Simulator update payload field ${field} must be numeric for Boiler Info validation.`);
  }
  return value;
}
