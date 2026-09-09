import type { APIRequestContext } from '@playwright/test';
import { apiEndpoints } from '../../constants/apiEndpoints';
import { logger } from '../../utils/logger';

export class UserService {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string
  ) {}

  async getUser(userId: string) {
    logger.api('Get User API request started', { module: 'UserService', endpoint: apiEndpoints.users.byId(userId), userId });
    return this.request.get(apiEndpoints.users.byId(userId), {
      headers: this.headers(),
      params: { cacheBust: Date.now().toString() }
    });
  }

  async refreshCurrentUser(userId: string) {
    logger.api('Refresh Current User API request started', {
      module: 'UserService',
      endpoint: apiEndpoints.users.byId(userId),
      userId
    });
    return this.request.get(apiEndpoints.users.byId(userId), {
      headers: this.headers(),
      params: {
        filter: JSON.stringify({ include: ['roles', 'devices'] }),
        cacheBust: Date.now().toString()
      }
    });
  }

  private headers(): Record<string, string> {
    return {
      Authorization: this.token,
      'Cache-Control': 'no-cache, no-store',
      Pragma: 'no-cache'
    };
  }
}
