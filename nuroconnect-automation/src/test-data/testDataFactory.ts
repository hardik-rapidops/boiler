import type { RoleKey } from '../types/roles';
import type { InvitationData, SiteData } from '../types/site';
import { randomEmail, randomZip, uniqueSuffix } from '../utils/random';
import {
  getConfiguredBrand,
  getConfiguredCascade,
  getConfiguredErrorType,
  getConfiguredSetpointWriteFlags,
  getBoilerSettingsBySoftwareVersion,
  getBoilerTypeFromSoftwareVersion,
  getConfiguredUpdateSettings
} from './settingsDataHelper';
import { loadBoilerUpdatePayloadReference } from './boilerUpdatePayloadReference';

const siteNamePrefixes: Partial<Record<RoleKey, string>> = {
  pkAdmin: 'PKA',
  pkTech: 'PKTE',
  pkRep: 'PKR'
};

export function buildSiteData(createdBy: RoleKey): SiteData {
  const suffix = uniqueSuffix();
  const prefix = siteNamePrefixes[createdBy] ?? 'SITE';
  return {
    name: `${prefix}${suffix}`,
    description: `Automation site ${suffix}`,
    address: `${Math.floor(100 + Math.random() * 899)} Automation Way`,
    city: `City${suffix}`,
    state: `State${suffix}`,
    province: `Province${suffix}`,
    zip: randomZip(),
    fuel: '$0',
    createdBy
  };
}

export function buildInvitationData(role: RoleKey): InvitationData {
  return {
    role,
    email: randomEmail()
  };
}

export function buildUpdatedSiteData(site: SiteData): SiteData {
  const updatedSite = buildSiteData(site.createdBy);
  return {
    ...updatedSite,
    id: site.id,
    name: site.name, // Preserve original name - backend does not support site name updates
    description: `Updated ${updatedSite.description}`
  };
}

export type BoilerType = 'standard' | 'condensing';

export type BoilerTestData = {
  description: string;
  boilerType: BoilerType;
};

export type SimulatorRegistrationData = {
  sola: string;
  nuro: string;
  base_url: string;
};

export type SimulatorUpdateData = {
  base_url: string;
  key: string;
  data: Record<string, string | number | boolean> & {
    sola: string;
    nuro: string;
    activedemand: number;
    state: number;
    status: number;
    errorcode: number;
    software: string;
    relayassignmenta: number;
    relayassignmentb: number;
    relayassignmentc: number;
    relayassignmentd: number;
  };
};

export type BuildUpdatePayloadOptions = {
  baseUrl: string;
  uniqueKey: string;
  sola: string;
  nuro: string;
  software: string;
  selectedSettings?: Partial<ReturnType<typeof getConfiguredUpdateSettings>>;
  extraData?: Record<string, string | number | boolean>;
  cascade?: number;
};

export function buildBoilerData(boilerType: BoilerType = 'standard'): BoilerTestData {
  return {
    description: `Automation boiler ${uniqueSuffix()}`,
    boilerType
  };
}

export function generateUniqueSola(): string {
  return `${Math.floor(10000000 + Math.random() * 89999999)}`;
}

export function generateUniqueNuro(): string {
  const hex = '0123456789ABCDEF';
  const segments = Array.from({ length: 3 }, () =>
    Array.from({ length: 2 }, () => hex[Math.floor(Math.random() * hex.length)]).join('')
  );
  return ['00', '0D', 'E1', ...segments].join(':');
}

export function buildSimulatorRegistrationData(baseUrl: string): SimulatorRegistrationData {
  return {
    sola: generateUniqueSola(),
    nuro: generateUniqueNuro(),
    base_url: baseUrl
  };
}

export function buildSimulatorUpdateData(
  baseUrl: string,
  uniqueKey: string,
  nuro: string,
  sola: string,
  software: string,
  extraData?: Record<string, string | number | boolean>
): SimulatorUpdateData {
  return buildUpdatePayload({ baseUrl, uniqueKey, nuro, sola, software, extraData });
}

export function buildUpdatePayload(options: BuildUpdatePayloadOptions): SimulatorUpdateData {
  const boilerType = getBoilerTypeFromSoftwareVersion(options.software);
  const boilerSettings = getBoilerSettingsBySoftwareVersion(options.software);
  const selectedSettings = {
    ...getConfiguredUpdateSettings(),
    ...options.selectedSettings
  };
  const relayAssignments = selectedSettings.relayAssignments.map((relayNumber) =>
    settingNumber(
      findSettingByNumber(boilerSettings.relayText, relayNumber),
      ['Number']
    )
  );

  return {
    base_url: options.baseUrl,
    key: options.uniqueKey,
    data: {
      ...loadBoilerUpdatePayloadReference(),
      ...options.extraData,
      sola: options.sola,
      nuro: options.nuro,
      activedemand: settingNumber(
        findSettingByNumber(boilerSettings.activeModeDemand, selectedSettings.activeModeDemand),
        ['Number']
      ),
      state: settingNumber(findSettingByNumber(boilerSettings.stateCodes, selectedSettings.stateCode), ['Number']),
      status: settingNumber(findSettingByNumber(boilerSettings.statusCodes, selectedSettings.statusCode), ['Number']),
      errorcode: settingNumber(findSettingByNumber(boilerSettings.errorCodes, selectedSettings.errorCode), [
        'Error Number',
        'Number'
      ]),
      errortype: getConfiguredErrorType(boilerType),
      software: options.software,
      brand: getConfiguredBrand(boilerType),
      cascade: options.cascade ?? getConfiguredCascade(boilerType),
      ...getConfiguredSetpointWriteFlags(boilerType),
      relayassignmenta: relayAssignments[0],
      relayassignmentb: relayAssignments[1],
      relayassignmentc: relayAssignments[2],
      relayassignmentd: relayAssignments[3]
    }
  };
}

function findSettingByNumber(rows: Array<Record<string, string>>, expectedNumber: string): Record<string, string> {
  const row = rows.find((setting) => Object.values(setting).some((value) => value === expectedNumber));
  if (!row) {
    throw new Error(`Configured setting number ${expectedNumber} was not found in Boiler settings data.`);
  }
  return row;
}

function settingNumber(row: Record<string, string>, preferredKeys: string[]): number {
  const rawValue = preferredKeys.map((key) => row[key]).find(Boolean) ?? Object.values(row)[0];
  const value = Number(rawValue);
  if (Number.isNaN(value)) {
    throw new Error(`Setting value ${rawValue} cannot be converted to a number.`);
  }
  return value;
}
