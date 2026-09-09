import type { APIRequestContext, APIResponse } from '@playwright/test';
import { AuthService } from '../auth/authService';
import { BoilerService } from '../boilers/boilerService';
import { SiteService } from '../sites/siteService';
import { getBoilerTypeFromSoftwareVersion, loadBoilerSettingsConfig } from '../../test-data/settingsDataHelper';
import type { RuntimeBoilerRecord, RuntimeSiteRecord } from '../../types/site';
import type { RoleKey } from '../../types/roles';
import { logger } from '../../utils/logger';

type ApiRecord = Record<string, unknown>;

export class AvailableDataService {
  private readonly tokens: Partial<Record<RoleKey, string>> = {};

  constructor(private readonly request: APIRequestContext) {}

  async getLatestAvailableSite(): Promise<RuntimeSiteRecord | undefined> {
    return this.getLatestAvailableSiteForRole('pkAdmin');
  }

  async getLatestAvailableSiteForRole(role: RoleKey): Promise<RuntimeSiteRecord | undefined> {
    return (await this.getAvailableSitesForRole(role)).at(-1);
  }

  async getAvailableSiteForRoleByName(role: RoleKey, siteName: string): Promise<RuntimeSiteRecord | undefined> {
    return (await this.getAvailableSitesForRole(role)).find((site) => site.name === siteName);
  }

  async getAvailableSiteForRoleById(role: RoleKey, siteId: string): Promise<RuntimeSiteRecord | undefined> {
    return (await this.getAvailableSitesForRole(role)).find((site) => site.id === siteId);
  }

  async getAvailableSitesForRole(role: RoleKey): Promise<RuntimeSiteRecord[]> {
    const token = await this.tokenFor(role);
    const response = await new SiteService(this.request, token).getSites();
    const records = await this.records(response, 'Site');
    return records
      .map((record) => this.toSite(record))
      .filter((site) => Boolean(site.id && site.name))
      .map((site) => ({ ...site, assignedUsers: role === 'pkAdmin' ? [] : [role] }));
  }

  async getLatestAvailableBoiler(): Promise<RuntimeBoilerRecord | undefined> {
    const boilers = await this.availableBoilers();
    return boilers[0];
  }

  async getLatestAvailableBoilerByType(boilerSettingsType: string): Promise<RuntimeBoilerRecord | undefined> {
    const boilers = await this.availableBoilers();
    return boilers.find((boiler) => boiler.boilerSettingsType === boilerSettingsType);
  }

  async getAvailableBoilerByNuro(nuro: string): Promise<RuntimeBoilerRecord | undefined> {
    return (await this.availableBoilers()).find((boiler) => boiler.nuro === nuro);
  }

  private async availableBoilers(): Promise<RuntimeBoilerRecord[]> {
    const token = await this.pkAdminToken();
    const response = await new BoilerService(this.request, token).getBoilers();
    const sites = await this.records(response, 'Site');
    const boilers: ApiRecord[] = sites.flatMap((site) => {
      const siteBoilers = Array.isArray(site.boilers) ? site.boilers.filter(this.isRecord) : [];
      return siteBoilers.map((boiler): ApiRecord => ({
        ...boiler,
        siteId: boiler.siteId ?? site.id,
        siteName: site.name
      }));
    });
    return boilers
      .filter((record) => record.isDeleted !== true && record.isDeleted !== 'true')
      .sort((left, right) => this.recordTime(right) - this.recordTime(left))
      .map((record) => this.toBoiler(record))
      .filter((boiler) => Boolean(boiler.id && boiler.nuro && boiler.name === boiler.nuro));
  }

  private async pkAdminToken(): Promise<string> {
    return this.tokenFor('pkAdmin');
  }

  private async tokenFor(role: RoleKey): Promise<string> {
    if (!this.tokens[role]) this.tokens[role] = (await new AuthService(this.request).login(role)).token;
    return this.tokens[role] as string;
  }

  private async records(response: APIResponse, entity: 'Site' | 'Boiler'): Promise<ApiRecord[]> {
    if (!response.ok()) {
      throw new Error(`PKAdmin ${entity} fallback lookup failed: ${response.status()} ${response.statusText()}`);
    }
    const body = (await response.json()) as unknown;
    if (Array.isArray(body)) return body.filter(this.isRecord);
    if (this.isRecord(body)) {
      for (const key of ['data', 'items', 'results', entity.toLowerCase() + 's']) {
        const value = body[key];
        if (Array.isArray(value)) return value.filter(this.isRecord);
      }
    }
    return [];
  }

  private readonly isRecord = (value: unknown): value is ApiRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  private toSite(record: ApiRecord): RuntimeSiteRecord {
    return {
      id: this.text(record, 'id', '_id'),
      name: this.text(record, 'name', 'siteName'),
      description: this.text(record, 'description'),
      address: this.text(record, 'address', 'address1'),
      city: this.text(record, 'city'),
      state: this.text(record, 'state', 'province'),
      province: this.text(record, 'province', 'state'),
      zip: this.text(record, 'zip', 'zipcode', 'postalCode'),
      fuel: this.text(record, 'fuel'),
      createdBy: 'pkAdmin',
      invitedUsers: [],
      assignedUsers: []
    };
  }

  private toBoiler(record: ApiRecord): RuntimeBoilerRecord {
    const softwareVersion = this.text(record, 'software', 'softwareVersion');
    const boilerSettingsType = this.resolveBoilerType(softwareVersion, this.text(record, 'brand', 'boilerType'));
    const id = this.text(record, 'id', '_id');
    const nuro = this.text(record, 'nuro', 'nuroSN', 'nuroNumber', 'serialNumber', 'name');
    const payloadData = Object.fromEntries(
      Object.entries(record).filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    ) as Record<string, string | number | boolean>;
    payloadData.sola = this.text(record, 'sola', 'solaSN', 'solaNumber');
    payloadData.nuro = nuro;
    payloadData.software = softwareVersion;
    return {
      id,
      name: this.text(record, 'name') || nuro,
      description: this.text(record, 'description'),
      siteId: this.text(record, 'siteId', 'site_id'),
      siteName: this.text(record, 'siteName', 'site'),
      createdBy: 'pkAdmin',
      boilerType: boilerSettingsType ?? this.text(record, 'brand', 'boilerType'),
      boilerSettingsType,
      softwareVersion: softwareVersion || undefined,
      sola: this.text(record, 'sola', 'solaSN', 'solaNumber'),
      nuro,
      code: this.text(record, 'code'),
      uniqueKey: this.text(record, 'uniqueKey', 'key'),
      latestUpdatePayload: softwareVersion
        ? {
            base_url: '',
            key: this.text(record, 'uniqueKey', 'key'),
            data: payloadData as RuntimeBoilerRecord['latestUpdatePayload'] extends { data: infer Data } ? Data : never
          }
        : undefined
    };
  }

  private recordTime(record: ApiRecord): number {
    const value = record.lastUpdated ?? record.updated ?? record.created;
    return typeof value === 'string' || typeof value === 'number' ? new Date(value).getTime() || 0 : 0;
  }

  private resolveBoilerType(software: string, brand: string): string | undefined {
    if (software) {
      try {
        return getBoilerTypeFromSoftwareVersion(software);
      } catch {
        logger.warn('Fallback Boiler software prefix is not configured', { module: 'AvailableDataService', software });
      }
    }
    const normalizedBrand = brand.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return Object.entries(loadBoilerSettingsConfig().boilerTypes).find(([, config]) =>
      config.displayName.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(normalizedBrand)
    )?.[0];
  }

  private text(record: ApiRecord, ...keys: string[]): string {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' || typeof value === 'number') return String(value);
      if (this.isRecord(value) && typeof value.name === 'string') return value.name;
    }
    return '';
  }
}
