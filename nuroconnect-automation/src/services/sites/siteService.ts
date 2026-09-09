import type { APIRequestContext } from '@playwright/test';
import { apiEndpoints } from '../../constants/apiEndpoints';
import type { SiteData } from '../../types/site';
import { logger } from '../../utils/logger';

export class SiteService {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string
  ) {}

  async createSite(data: SiteData) {
    logger.api('Create Site API request started', { module: 'SiteService', endpoint: apiEndpoints.sites.base, siteName: data.name });
    return this.request.post(apiEndpoints.sites.base, {
      data,
      headers: this.headers()
    });
  }

  async getSite(siteId: string) {
    logger.api('Get Site API request started', { module: 'SiteService', endpoint: apiEndpoints.sites.byId(siteId), siteId });
    return this.request.get(apiEndpoints.sites.byId(siteId), {
      headers: this.headers()
    });
  }

  async getSites() {
    logger.api('Get latest Sites API request started', { module: 'SiteService', endpoint: apiEndpoints.sites.base });
    return this.request.get(apiEndpoints.sites.base, {
      headers: this.headers(),
      params: { filter: JSON.stringify({ order: ['updated DESC', 'created DESC'] }) }
    });
  }

  async deleteSite(siteId: string) {
    logger.api('Delete Site API request started', { module: 'SiteService', endpoint: apiEndpoints.sites.byId(siteId), siteId });
    return this.request.delete(apiEndpoints.sites.byId(siteId), {
      headers: this.headers()
    });
  }

  private headers(): Record<string, string> {
    return { Authorization: this.token, 'Cache-Control': 'no-cache', Pragma: 'no-cache' };
  }
}
