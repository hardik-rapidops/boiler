import { test as base } from './baseFixture';
import { testEnvironment } from '../config/environment';
import { roleKeys, type RoleCredentials, type RoleKey } from '../types/roles';

type RoleFixtures = {
  roles: Record<RoleKey, RoleCredentials>;
  roleKeys: RoleKey[];
};

export const test = base.extend<RoleFixtures>({
  roles: async ({}, use) => {
    await use(testEnvironment.credentials);
  },

  roleKeys: async ({}, use) => {
    await use(roleKeys);
  }
});

export { expect } from './baseFixture';
