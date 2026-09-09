import type { RoleKey } from './roles';

export type SiteData = {
  id?: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  province: string;
  zip: string;
  fuel: string;
  createdBy: RoleKey;
};

export type InvitationData = {
  email: string;
  role: RoleKey;
};

export type RuntimeSiteRecord = SiteData & {
  invitedUsers: InvitationData[];
  assignedUsers: RoleKey[];
};

export type RuntimeData = {
  createdAt: string;
  sites: Partial<Record<RoleKey, RuntimeSiteRecord>>;
  boilers: Record<string, RuntimeBoilerRecord>;
};

export type RuntimeBoilerRecord = {
  id: string;
  name: string;
  description: string;
  siteId: string;
  siteName: string;
  createdBy: RoleKey;
  boilerType: string;
  boilerSettingsType?: string;
  softwareVersion?: string;
  sola: string;
  nuro: string;
  code: string;
  uniqueKey: string;
  latestUpdatePayload?: RuntimeSimulatorUpdatePayload;
  expectedInfo?: RuntimeBoilerExpectedInfo;
};

export type RuntimeSimulatorUpdatePayload = {
  base_url: string;
  key: string;
  data: Record<string, string | number | boolean> & {
    sola: string;
    nuro: string;
    software: string;
  };
};

export type RuntimeBoilerExpectedInfo = {
  mode?: string;
  state: string;
  status: string;
  brand: string;
  errorName: string;
  relayAssignments: string[];
  activeModeDemand?: string;
};
