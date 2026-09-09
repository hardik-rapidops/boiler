import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { roleKeys, roleLabels, type RoleCredentials, type RoleKey } from '../types/roles';

const envName = process.env.TEST_ENV === 'prod' ? 'prod' : 'dev';
const envFile = path.resolve(process.cwd(), `.env.${envName}`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: true });
}

const envVarPrefix: Record<RoleKey, string> = {
  pkAdmin: 'PKADMIN',
  pkTech: 'PKTECH',
  pkRep: 'PKREP',
  siteManager: 'SITE_MANAGER',
  siteSupervisor: 'SITE_SUPERVISOR',
  siteUser: 'SITE_USER'
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const testEnvironment = {
  name: envName,
  baseUrl: required('BASE_URL'),
  authStateDir: path.resolve(process.cwd(), 'playwright/.auth'),
  runtimeDataFile: path.resolve(process.cwd(), 'src/runtime/runtime-data.json'),
  credentials: roleKeys.reduce((acc, roleKey) => {
    const prefix = envVarPrefix[roleKey];
    const username = required(`${prefix}_USERNAME`);
    acc[roleKey] = {
      role: roleLabels[roleKey],
      username,
      email: username,
      password: required(`${prefix}_PASSWORD`)
    };
    return acc;
  }, {} as Record<RoleKey, RoleCredentials>)
};

export type TestEnvironment = typeof testEnvironment;
