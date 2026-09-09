import fs from 'node:fs';
import path from 'node:path';
import type { RoleKey } from '../types/roles';

export type BoilerSettingsType = string;

export type BoilerSettingsData = {
  errorCodes: Array<Record<string, string>>;
  stateCodes: Array<Record<string, string>>;
  statusCodes: Array<Record<string, string>>;
  userTitles: Array<Record<string, string>>;
  serviceReps: Array<Record<string, string>>;
  relayText: Array<Record<string, string>>;
  activeModeDemand: Array<Record<string, string>>;
};

export type BoilerSettingsDataFile = Record<string, BoilerSettingsData>;

export type BoilerSettingsConfig = {
  softwareVersionPrefixes: Record<string, BoilerSettingsType>;
  boilerTypes: Record<
    BoilerSettingsType,
    {
      displayName: string;
      settingsIndex: string;
      updateData: {
        cascade: number;
        brand: number;
        errortype: number;
        setpointWriteFlags: SetpointWriteFlags;
      };
    }
  >;
  scenarioSoftwareVersions: Record<RoleKey, string>;
  updateSettings: {
    errorCode: string;
    stateCode: string;
    statusCode: string;
    activeModeDemand: string;
    relayAssignments: string[];
  };
  displayOverrides?: Record<BoilerSettingsType, Record<string, Record<string, string>>>;
};

export type SetpointWriteFlags = {
  chsetpointwrite: boolean;
  dhwsetpointwrite: boolean;
  dhwtanksetpointwrite: boolean;
};

const boilerSettingsDataPath = path.resolve(process.cwd(), 'test-data/settings/boiler-settings-data.json');
const boilerSettingsConfigPath = path.resolve(process.cwd(), 'test-data/settings/boiler-settings-config.json');
const exportedSettingsDir = path.resolve(process.cwd(), 'exports/settings');

const tabKeyByName: Record<string, keyof BoilerSettingsData> = {
  'Error Codes': 'errorCodes',
  'State codes': 'stateCodes',
  'Status codes': 'statusCodes',
  'User title': 'userTitles',
  'Service reps': 'serviceReps',
  'Relay text': 'relayText',
  'Active Mode Demand': 'activeModeDemand'
};

const fallbackHeaders: Partial<Record<keyof BoilerSettingsData, string[]>> = {
  errorCodes: ['Error Number', 'Error Name', 'Description'],
  stateCodes: ['Number', 'Name'],
  statusCodes: ['Number', 'Name'],
  userTitles: ['Number', 'Title Name'],
  relayText: ['Relay', 'Number', 'Name'],
  activeModeDemand: ['Number', 'Name']
};

export function loadBoilerSettingsConfig(): BoilerSettingsConfig {
  if (!fs.existsSync(boilerSettingsConfigPath)) {
    throw new Error(`Boiler settings config file is missing at ${boilerSettingsConfigPath}`);
  }

  return JSON.parse(fs.readFileSync(boilerSettingsConfigPath, 'utf-8')) as BoilerSettingsConfig;
}

export function loadBoilerSettingsData(): BoilerSettingsDataFile {
  if (!fs.existsSync(boilerSettingsDataPath)) {
    throw new Error(
      `Boiler settings data file is missing at ${boilerSettingsDataPath}. Run npm run export:boiler-settings:dev first.`
    );
  }

  const settings = JSON.parse(fs.readFileSync(boilerSettingsDataPath, 'utf-8')) as BoilerSettingsDataFile;
  return repairInvalidBoilerSettings(settings);
}

export function getBoilerSettingsByType(boilerType: BoilerSettingsType): BoilerSettingsData {
  const settings = loadBoilerSettingsData()[boilerType];
  if (!settings) {
    throw new Error(`Boiler settings are missing for configured Boiler type: ${boilerType}`);
  }
  return settings;
}

export function getBoilerTypeFromSoftwareVersion(softwareVersion: string): BoilerSettingsType {
  const mapping = loadBoilerSettingsConfig().softwareVersionPrefixes;
  const matchedPrefix = Object.keys(mapping).find((prefix) =>
    softwareVersion.toUpperCase().startsWith(prefix.toUpperCase())
  );
  if (matchedPrefix) {
    return mapping[matchedPrefix];
  }

  throw new Error(`Unsupported Boiler software version prefix: ${softwareVersion}`);
}

export function getBoilerSettingsBySoftwareVersion(softwareVersion: string): BoilerSettingsData {
  return getBoilerSettingsByType(getBoilerTypeFromSoftwareVersion(softwareVersion));
}

export function boilerSettingsTypeLabel(boilerType: BoilerSettingsType): string {
  return loadBoilerSettingsConfig().boilerTypes[boilerType]?.displayName ?? boilerType;
}

export function getScenarioSoftwareVersion(roleKey: RoleKey): string {
  const software = loadBoilerSettingsConfig().scenarioSoftwareVersions[roleKey];
  if (!software) {
    throw new Error(`Scenario software version is not configured for role: ${roleKey}`);
  }
  return software;
}

export function getConfiguredUpdateSettings() {
  return loadBoilerSettingsConfig().updateSettings;
}

export function getConfiguredCascade(boilerType: BoilerSettingsType): number {
  const cascade = loadBoilerSettingsConfig().boilerTypes[boilerType]?.updateData?.cascade;
  if (!Number.isInteger(cascade) || cascade < 0 || cascade > 2) {
    throw new Error(`Cascade must be configured as 0, 1, or 2 for Boiler type: ${boilerType}`);
  }
  return cascade;
}

export function getConfiguredBrand(boilerType: BoilerSettingsType): number {
  const brand = loadBoilerSettingsConfig().boilerTypes[boilerType]?.updateData?.brand;
  if (!Number.isInteger(brand) || brand < 0) {
    throw new Error(`Brand must be configured as a non-negative integer for Boiler type: ${boilerType}`);
  }
  return brand;
}

export function getConfiguredErrorType(boilerType: BoilerSettingsType): number {
  const errortype = loadBoilerSettingsConfig().boilerTypes[boilerType]?.updateData?.errortype;
  if (!Number.isInteger(errortype) || errortype < 0) {
    throw new Error(`Error type must be configured as a non-negative integer for Boiler type: ${boilerType}`);
  }
  return errortype;
}

export function getConfiguredSetpointWriteFlags(boilerType: BoilerSettingsType): SetpointWriteFlags {
  const flags = loadBoilerSettingsConfig().boilerTypes[boilerType]?.updateData?.setpointWriteFlags;
  if (!flags || Object.values(flags).some((value) => typeof value !== 'boolean')) {
    throw new Error(`Setpoint write flags must be configured for Boiler type: ${boilerType}`);
  }
  return { ...flags };
}

function repairInvalidBoilerSettings(settings: BoilerSettingsDataFile): BoilerSettingsDataFile {
  const config = loadBoilerSettingsConfig();
  let repaired = false;
  const repairedSettings: BoilerSettingsDataFile = { ...settings };

  for (const [boilerType, boilerTypeConfig] of Object.entries(config.boilerTypes)) {
    const currentSettings = repairedSettings[boilerType];
    if (currentSettings && isValidBoilerSettings(currentSettings)) continue;

    const fallbackSettings = loadExportedBoilerSettings(boilerTypeConfig.displayName);
    if (!fallbackSettings || !isValidBoilerSettings(fallbackSettings)) continue;

    repairedSettings[boilerType] = fallbackSettings;
    repaired = true;
  }

  return repairedSettings;
}

function isValidBoilerSettings(settings: BoilerSettingsData): boolean {
  return (
    hasNumberedRows(settings.errorCodes, ['Error Number', 'Number']) &&
    hasNumberedRows(settings.stateCodes, ['Number']) &&
    hasNumberedRows(settings.statusCodes, ['Number']) &&
    hasNumberedRows(settings.relayText, ['Number']) &&
    hasNumberedRows(settings.activeModeDemand, ['Number'])
  );
}

function hasNumberedRows(rows: Array<Record<string, string>> | undefined, numberKeys: string[]): boolean {
  return Boolean(
    rows?.some((row) => numberKeys.some((key) => row[key] !== undefined && !Number.isNaN(Number(row[key]))))
  );
}

function loadExportedBoilerSettings(displayName: string): BoilerSettingsData | undefined {
  if (!fs.existsSync(exportedSettingsDir)) return undefined;

  const normalizedDisplayName = normalizeFileName(displayName);
  const matchingFile = fs
    .readdirSync(exportedSettingsDir)
    .filter((file) => file.toLowerCase().endsWith('.json'))
    .find((file) => normalizeFileName(file).includes(normalizedDisplayName));

  if (!matchingFile) return undefined;

  const raw = fs.readFileSync(path.join(exportedSettingsDir, matchingFile), 'utf-8').replace(/^\uFEFF/, '');
  const exportData = JSON.parse(raw) as { settingsTabs?: Array<{ tab: string; tables?: Array<{ rows?: unknown[] }> }> };
  if (!Array.isArray(exportData.settingsTabs)) return undefined;

  return exportData.settingsTabs.reduce<BoilerSettingsData>(
    (acc, tabData) => {
      const key = tabKeyByName[tabData.tab];
      if (!key) return acc;
      acc[key] = normalizeExportedRows(key, tabData.tables?.[0]?.rows ?? []);
      return acc;
    },
    {
      errorCodes: [],
      stateCodes: [],
      statusCodes: [],
      userTitles: [],
      serviceReps: [],
      relayText: [],
      activeModeDemand: []
    }
  );
}

function normalizeExportedRows(key: keyof BoilerSettingsData, rows: unknown[]): Array<Record<string, string>> {
  const headers = fallbackHeaders[key];
  if (!headers) return [];

  return rows
    .filter((row): row is unknown[] => Array.isArray(row))
    .filter((row) => !isHeaderRow(row, headers))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, String(row[index] ?? '').trim()]))
    )
    .filter((row) => Object.values(row).some(Boolean));
}

function isHeaderRow(row: unknown[], headers: string[]): boolean {
  return headers.every((header, index) => String(row[index] ?? '').trim() === header);
}

function normalizeFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
