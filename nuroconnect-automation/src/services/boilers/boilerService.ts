import type { APIRequestContext, APIResponse } from '@playwright/test';
import { apiEndpoints } from '../../constants/apiEndpoints';
import { logger } from '../../utils/logger';

export class BoilerService {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string
  ) {}

  async getBoilers(): Promise<APIResponse> {
    logger.api('Get latest Boilers API request started', {
      module: 'BoilerService',
      endpoint: apiEndpoints.sites.base
    });
    return this.request.get(apiEndpoints.sites.base, {
      headers: this.headers(),
      params: { filter: JSON.stringify({ include: 'boilers' }) }
    });
  }

  private headers(): Record<string, string> {
    return {
      Authorization: this.token,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    };
  }
}
