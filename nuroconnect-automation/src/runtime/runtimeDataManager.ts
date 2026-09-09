import fs from 'node:fs';
import path from 'node:path';
import { testEnvironment } from '../config/environment';
import { SITE_NOT_CREATED_ERROR } from '../constants/messages';
import type { RoleKey } from '../types/roles';
import type {
  InvitationData,
  RuntimeBoilerExpectedInfo,
  RuntimeBoilerRecord,
  RuntimeData,
  RuntimeSimulatorUpdatePayload,
  RuntimeSiteRecord,
  SiteData
} from '../types/site';
import { isoNow } from '../utils/dateTime';
import { logger } from '../utils/logger';
import type { AvailableDataService } from '../services/data/availableDataService';

export class RuntimeDataManager {
  private static readonly runtimeFile = testEnvironment.runtimeDataFile;
  private static readonly lockFile = `${testEnvironment.runtimeDataFile}.lock`;

  static read(): RuntimeData {
    if (!fs.existsSync(this.runtimeFile)) {
      logger.debug('Runtime data file is missing; returning empty runtime data', {
        module: 'RuntimeDataManager',
        runtimeFile: this.runtimeFile
      });
      return { createdAt: isoNow(), sites: {}, boilers: {} };
    }
    logger.debug('Reading runtime data file', { module: 'RuntimeDataManager', runtimeFile: this.runtimeFile });
    return JSON.parse(fs.readFileSync(this.runtimeFile, 'utf-8')) as RuntimeData;
  }

  static save(data: RuntimeData): void {
    fs.mkdirSync(path.dirname(this.runtimeFile), { recursive: true });
    fs.writeFileSync(this.runtimeFile, `${JSON.stringify(data, null, 2)}\n`);
    logger.system('Runtime data saved', {
      module: 'RuntimeDataManager',
      siteCount: Object.keys(data.sites).length,
      boilerCount: Object.keys(data.boilers ?? {}).length
    });
  }

  static upsertSite(role: RoleKey, site: RuntimeSiteRecord): void {
    this.withRuntimeLock(() => {
      const data = this.read();
      data.sites[role] = site;
      this.save(data);
    });
    logger.system('Runtime Site data upserted', { module: 'RuntimeDataManager', role, siteName: site.name, siteId: site.id });
  }

  static updateSite(role: RoleKey, updatedSite: SiteData): void {
    let updatedBoilerCount = 0;
    this.withRuntimeLock(() => {
      const data = this.requireCreatedSites();
      const currentSite = data.sites[role];
      if (!currentSite?.id) {
        throw new Error(`Runtime site data is missing for ${role}. Execute site-creation test first.`);
      }

      data.sites[role] = {
        ...currentSite,
        ...updatedSite,
        id: currentSite.id,
        createdBy: currentSite.createdBy,
        invitedUsers: currentSite.invitedUsers ?? [],
        assignedUsers: currentSite.assignedUsers ?? []
      };
      for (const boiler of Object.values(data.boilers ?? {})) {
        if (boiler.siteId === currentSite.id) {
          boiler.siteName = updatedSite.name;
          updatedBoilerCount += 1;
        }
      }
      this.save(data);
    });
    logger.system('Runtime Site data updated', { module: 'RuntimeDataManager', role, siteName: updatedSite.name });
    logger.system('Linked runtime Boiler Site names updated', {
      module: 'RuntimeDataManager',
      role,
      siteName: updatedSite.name,
      boilerCount: updatedBoilerCount
    });
  }

  static addInvitedUser(siteOwnerRole: RoleKey, invitation: InvitationData): void {
    const data = this.requireCreatedSites();
    const site = data.sites[siteOwnerRole];
    if (!site) {
      throw new Error(`Site data is missing for ${siteOwnerRole}`);
    }
    site.invitedUsers = [
      ...(site.invitedUsers ?? []).filter((user) => user.email !== invitation.email),
      invitation
    ];
    site.assignedUsers = [...new Set([...(site.assignedUsers ?? []), invitation.role])];
    data.sites[siteOwnerRole] = site;
    this.save(data);
    logger.system('Runtime invited user data added', {
      module: 'RuntimeDataManager',
      siteOwnerRole,
      invitedRole: invitation.role,
      email: invitation.email
    });
  }

  static requireInvitedUser(siteOwnerRole: RoleKey, invitedRole: RoleKey): InvitationData {
    const data = this.requireCreatedSites();
    const site = data.sites[siteOwnerRole];
    const invitation = site?.invitedUsers?.find((user) => user.role === invitedRole);
    if (!invitation) {
      logger.error('Required runtime invited user data is missing', {
        module: 'RuntimeDataManager',
        siteOwnerRole,
        invitedRole
      });
      throw new Error(
        `Invited user data is missing for ${invitedRole} on ${siteOwnerRole} site. Execute site-invitation test first.`
      );
    }
    logger.debug('Runtime invited user data resolved', { module: 'RuntimeDataManager', siteOwnerRole, invitedRole });
    return invitation;
  }

  static removeInvitedUser(siteOwnerRole: RoleKey, email: string): void {
    const data = this.requireCreatedSites();
    const site = data.sites[siteOwnerRole];
    if (!site) {
      throw new Error(`Site data is missing for ${siteOwnerRole}`);
    }

    const removedInvitation = site.invitedUsers?.find((user) => user.email === email);
    if (!removedInvitation) {
      throw new Error(
        `Invited user data is missing for ${email} on ${siteOwnerRole} site. Execute site-invitation test first.`
      );
    }

    site.invitedUsers = site.invitedUsers.filter((user) => user.email !== email);
    const roleStillAssigned = site.invitedUsers.some((user) => user.role === removedInvitation.role);
    if (!roleStillAssigned) {
      site.assignedUsers = (site.assignedUsers ?? []).filter((role) => role !== removedInvitation.role);
    }
    data.sites[siteOwnerRole] = site;
    this.save(data);
    logger.system('Runtime invited user data removed', { module: 'RuntimeDataManager', siteOwnerRole, email });
  }

  static upsertBoiler(boiler: RuntimeBoilerRecord): void {
    const data = this.read();
    data.boilers[boiler.id] = boiler;
    this.save(data);
    logger.system('Runtime Boiler data upserted', {
      module: 'RuntimeDataManager',
      boilerId: boiler.id,
      boilerName: boiler.name,
      siteName: boiler.siteName,
      createdBy: boiler.createdBy
    });
  }

  static requireBoilers(): Record<string, RuntimeBoilerRecord> {
    const data = this.read();
    this.synchronizeBoilerSiteNames(data);
    logger.debug('Runtime Boiler data requested', {
      module: 'RuntimeDataManager',
      boilerCount: Object.keys(data.boilers ?? {}).length
    });
    return data.boilers;
  }

  static requireLatestBoiler(): RuntimeBoilerRecord {
    const boiler = Object.values(this.requireBoilers()).at(-1);
    if (!boiler) {
      throw new Error('Runtime Boiler data is missing. Execute boiler-creation test first.');
    }
    return boiler;
  }

  static requireLatestBoilerBySettingsType(boilerSettingsType: string): RuntimeBoilerRecord {
    const boiler = Object.values(this.requireBoilers())
      .filter((record) => record.boilerSettingsType === boilerSettingsType)
      .at(-1);
    if (!boiler) {
      throw new Error(
        `Runtime Boiler data is missing for ${boilerSettingsType}. Execute boiler-creation test for this Boiler type first.`
      );
    }
    return boiler;
  }

  static async getLatestAvailableSite(fallback: AvailableDataService): Promise<RuntimeSiteRecord> {
    const runtimeSite = Object.values(this.read().sites).filter((site): site is RuntimeSiteRecord => Boolean(site?.id)).at(-1);
    if (runtimeSite) return runtimeSite;

    const site = await fallback.getLatestAvailableSite();
    if (!site) throw new Error('No Site found. Please create a Site before executing this test.');
    logger.warn('Using PKAdmin API fallback Site data', {
      module: 'RuntimeDataManager',
      siteId: site.id,
      siteName: site.name
    });
    this.upsertSite('pkAdmin', site);
    return site;
  }

  static async getLatestAvailableBoiler(fallback: AvailableDataService): Promise<RuntimeBoilerRecord> {
    const runtimeBoiler = Object.values(this.read().boilers ?? {}).at(-1);
    if (runtimeBoiler) return runtimeBoiler;

    const boiler = await fallback.getLatestAvailableBoiler();
    if (!boiler) throw new Error('No Boiler found. Please create a Boiler before executing this test.');
    logger.warn('Using PKAdmin API fallback Boiler data', {
      module: 'RuntimeDataManager',
      boilerId: boiler.id,
      nuro: boiler.nuro
    });
    this.upsertBoiler(boiler);
    return boiler;
  }

  static async getLatestAvailableBoilerByType(
    boilerSettingsType: string,
    fallback: AvailableDataService
  ): Promise<RuntimeBoilerRecord> {
    const runtimeBoiler = Object.values(this.read().boilers ?? {})
      .filter((boiler) => boiler.boilerSettingsType === boilerSettingsType)
      .at(-1);
    if (runtimeBoiler) return runtimeBoiler;

    const boiler = await fallback.getLatestAvailableBoilerByType(boilerSettingsType);
    if (!boiler) throw new Error('No Boiler found. Please create a Boiler before executing this test.');
    logger.warn('Using PKAdmin API fallback Boiler data by type', {
      module: 'RuntimeDataManager',
      boilerId: boiler.id,
      nuro: boiler.nuro,
      boilerSettingsType
    });
    this.upsertBoiler(boiler);
    return boiler;
  }

  static async getSiteDataOrFallback(fallback: AvailableDataService): Promise<RuntimeSiteRecord> {
    return this.getLatestAvailableSite(fallback);
  }

  static async getBoilerDataOrFallback(
    fallback: AvailableDataService,
    boilerSettingsType?: string
  ): Promise<RuntimeBoilerRecord> {
    return boilerSettingsType
      ? this.getLatestAvailableBoilerByType(boilerSettingsType, fallback)
      : this.getLatestAvailableBoiler(fallback);
  }

  static updateBoilerInfoValidation(
    boilerId: string,
    latestUpdatePayload: RuntimeSimulatorUpdatePayload,
    expectedInfo: RuntimeBoilerExpectedInfo
  ): void {
    let boiler: RuntimeBoilerRecord | undefined;
    this.withRuntimeLock(() => {
      const data = this.read();
      boiler = data.boilers[boilerId];
      if (!boiler) {
        throw new Error(`Runtime Boiler data is missing for ${boilerId}. Execute boiler-creation test first.`);
      }

      this.synchronizeBoilerSiteNames(data);
      data.boilers[boilerId] = { ...data.boilers[boilerId], latestUpdatePayload, expectedInfo };
      this.save(data);
    });
    logger.system('Runtime Boiler Info validation data updated', {
      module: 'RuntimeDataManager',
      boilerId,
      nuro: latestUpdatePayload.data.nuro,
      software: latestUpdatePayload.data.software
    });
  }

  private static withRuntimeLock<T>(action: () => T): T {
    fs.mkdirSync(path.dirname(this.runtimeFile), { recursive: true });
    const deadline = Date.now() + 30_000;
    const waitBuffer = new Int32Array(new SharedArrayBuffer(4));
    let lockDescriptor: number | undefined;

    while (lockDescriptor === undefined) {
      try {
        lockDescriptor = fs.openSync(this.lockFile, 'wx');
      } catch (error) {
        const fileError = error as NodeJS.ErrnoException;
        if (!this.isRuntimeLockContention(fileError)) {
          throw error;
        }

        try {
          const lockAge = Date.now() - fs.statSync(this.lockFile).mtimeMs;
          if (lockAge > 60_000) {
            try {
              fs.unlinkSync(this.lockFile);
              continue;
            } catch (unlinkError) {
              const unlinkFileError = unlinkError as NodeJS.ErrnoException;
              if (unlinkFileError.code === 'ENOENT') continue;
              if (!this.isRuntimeLockContention(unlinkFileError)) throw unlinkError;
            }
          }
        } catch (statError) {
          const statFileError = statError as NodeJS.ErrnoException;
          if (statFileError.code === 'ENOENT') continue;
          if (!this.isRuntimeLockContention(statFileError)) throw statError;
        }
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for runtime data lock: ${this.lockFile}`);
        }
        Atomics.wait(waitBuffer, 0, 0, 50);
      }
    }

    try {
      return action();
    } finally {
      fs.closeSync(lockDescriptor);
      this.releaseRuntimeLock(waitBuffer);
    }
  }

  private static isRuntimeLockContention(error: NodeJS.ErrnoException): boolean {
    return error.code === 'EEXIST' || error.code === 'EACCES' || error.code === 'EPERM';
  }

  private static releaseRuntimeLock(waitBuffer: Int32Array): void {
    const releaseDeadline = Date.now() + 5_000;
    while (true) {
      try {
        fs.unlinkSync(this.lockFile);
        return;
      } catch (error) {
        const fileError = error as NodeJS.ErrnoException;
        if (fileError.code === 'ENOENT') return;
        if (!this.isRuntimeLockContention(fileError) || Date.now() >= releaseDeadline) throw error;
        Atomics.wait(waitBuffer, 0, 0, 50);
      }
    }
  }

  private static synchronizeBoilerSiteNames(data: RuntimeData): void {
    const sitesById = new Map(
      Object.values(data.sites)
        .filter((site): site is RuntimeSiteRecord => Boolean(site?.id))
        .map((site) => [site.id as string, site])
    );

    for (const boiler of Object.values(data.boilers ?? {})) {
      const currentSite = sitesById.get(boiler.siteId);
      if (currentSite) {
        boiler.siteName = currentSite.name;
      }
    }
  }

  static requireCreatedSites(): RuntimeData {
    const data = this.read();
    if (!data.sites.pkAdmin || !data.sites.pkTech || !data.sites.pkRep) {
      logger.error('Required runtime Site Creation data is missing', { module: 'RuntimeDataManager' });
      throw new Error(SITE_NOT_CREATED_ERROR);
    }
    logger.debug('Runtime Site Creation data resolved', { module: 'RuntimeDataManager' });
    return data;
  }

  static clear(): void {
    if (fs.existsSync(this.runtimeFile)) {
      fs.unlinkSync(this.runtimeFile);
      logger.system('Runtime data file cleared', { module: 'RuntimeDataManager', runtimeFile: this.runtimeFile });
    }
  }
}
