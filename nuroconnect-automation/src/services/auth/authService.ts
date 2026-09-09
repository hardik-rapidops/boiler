import fs from 'node:fs';
import path from 'node:path';
import type { APIRequestContext } from '@playwright/test';
import { apiEndpoints } from '../../constants/apiEndpoints';
import { storageKeys } from '../../constants/storageKeys';
import { testEnvironment } from '../../config/environment';
import type { AuthSession, LoginRequest, LoginResponse } from '../../types/auth';
import type { RoleKey } from '../../types/roles';
import { ensureDefined } from '../../utils/errorHelper';
import { logger } from '../../utils/logger';

type BrowserStorageState = {
  cookies: [];
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

export class AuthService {
  constructor(_request: APIRequestContext) {}

  async login(roleKey: RoleKey): Promise<AuthSession> {
    const credentials = testEnvironment.credentials[roleKey];
    const payload: LoginRequest = {
      email: credentials.email,
      password: credentials.password
    };

    logger.api('API login request started', { module: 'AuthService', role: roleKey, endpoint: apiEndpoints.auth.login, email: credentials.email });
    const response = await fetch(new URL(apiEndpoints.auth.login, testEnvironment.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    logger.api('API login response received', {
      module: 'AuthService',
      role: roleKey,
      endpoint: apiEndpoints.auth.login,
      status: response.status,
      ok: response.ok
    });
    if (!response.ok) {
      logger.error('API login failed', { module: 'AuthService', role: roleKey, status: response.status });
      throw new Error(`API login failed for ${credentials.role}: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as LoginResponse;
    const token = ensureDefined(body.id, `Login API did not return id token for ${credentials.role}`);

    return {
      roleKey,
      token,
      userId: ensureDefined(body.userId, `Login API did not return userId for ${credentials.role}`),
      ttl: body.ttl,
      created: body.created
    };
  }

  async authorizationHeader(roleKey: RoleKey): Promise<Record<string, string>> {
    const session = await this.login(roleKey);
    return { Authorization: session.token };
  }

  async createStorageState(roleKey: RoleKey, stateId?: string): Promise<string> {
    const session = await this.login(roleKey);
    const userData = await this.fetchCurrentUser(session);
    const origin = new URL(testEnvironment.baseUrl).origin;
    const storageState: BrowserStorageState = {
      cookies: [],
      origins: [
        {
          origin,
          localStorage: [
            { name: storageKeys.accessToken, value: session.token },
            { name: storageKeys.userId, value: session.userId },
            { name: storageKeys.role, value: roleKey },
            { name: storageKeys.authSession, value: JSON.stringify(session) },
            { name: storageKeys.userData, value: JSON.stringify(userData) },
            { name: storageKeys.loopBackAccessTokenId, value: session.token },
            { name: storageKeys.loopBackCurrentUserId, value: session.userId },
            { name: storageKeys.loopBackRememberMe, value: 'true' }
          ]
        }
      ]
    };

    fs.mkdirSync(testEnvironment.authStateDir, { recursive: true });
    const safeStateId = stateId?.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
    const stateFile = path.join(testEnvironment.authStateDir, `${roleKey}${safeStateId ? `-${safeStateId}` : ''}.json`);
    fs.writeFileSync(stateFile, `${JSON.stringify(storageState, null, 2)}\n`);
    logger.system('Authenticated browser storage state created', { module: 'AuthService', role: roleKey, stateFile });
    return stateFile;
  }

  private async fetchCurrentUser(session: AuthSession): Promise<unknown> {
    logger.api('Current user refresh request started', { module: 'AuthService', role: session.roleKey, userId: session.userId });
    const endpoint = new URL(apiEndpoints.users.byId(session.userId), testEnvironment.baseUrl);
    endpoint.searchParams.set('filter', JSON.stringify({ include: ['roles', 'devices'] }));
    endpoint.searchParams.set('cacheBust', Date.now().toString());
    const response = await fetch(endpoint, {
      headers: {
        Authorization: session.token,
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache'
      }
    });
    logger.api('Current user refresh response received', {
      module: 'AuthService',
      role: session.roleKey,
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      logger.error('Unable to fetch authenticated user data', { module: 'AuthService', role: session.roleKey, status: response.status });
      throw new Error(`Unable to fetch authenticated user data: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
