export type Role =
  | 'PKAdmin'
  | 'PKTech'
  | 'PKRep'
  | 'Site Manager'
  | 'Site Supervisor'
  | 'Site User';

export type RoleKey =
  | 'pkAdmin'
  | 'pkTech'
  | 'pkRep'
  | 'siteManager'
  | 'siteSupervisor'
  | 'siteUser';

export type RoleCredentials = {
  role: Role;
  email: string;
  username: string;
  password: string;
};

export const roleKeys: RoleKey[] = [
  'pkAdmin',
  'pkTech',
  'pkRep',
  'siteManager',
  'siteSupervisor',
  'siteUser'
];

export const roleLabels: Record<RoleKey, Role> = {
  pkAdmin: 'PKAdmin',
  pkTech: 'PKTech',
  pkRep: 'PKRep',
  siteManager: 'Site Manager',
  siteSupervisor: 'Site Supervisor',
  siteUser: 'Site User'
};

export const creatorRoles: RoleKey[] = ['pkAdmin', 'pkTech', 'pkRep'];
export const nonCreatorRoles: RoleKey[] = ['siteManager', 'siteSupervisor', 'siteUser'];
export const assignedRoles: RoleKey[] = ['siteManager', 'siteSupervisor', 'siteUser'];
