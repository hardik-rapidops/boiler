import { logger } from '../utils/logger';

/**
 * Shared test context for name-based site tracking across the e2e flow.
 *
 * MODE 1 - Full e2e run (site-creation → boiler-creation → site-update → etc.):
 *   - Site-creation sets currentSiteName to the created site's name
 *   - All subsequent tests use this SAME site name by reading currentSiteName
 *   - Site-update updates currentSiteName when the site name changes
 *   - Boiler-creation appends to boilerNumbers when creating boilers under this site
 *
 * MODE 2 - Standalone run (e.g., only boiler-creation tests):
 *   - currentSiteName will be undefined/null
 *   - Tests fall back to picking the first available site from the UI list
 *   - This is clearly logged so it's obvious which mode is running
 *
 * FUTURE - Site-deletion:
 *   - Will use currentSiteName to identify which site to delete
 *   - Will verify only the boilerNumbers in this array are affected by deletion
 */
export class TestContext {
  private static instance: TestContext;

  /** The unique site name being tracked through the e2e flow */
  private _currentSiteName: string | undefined;

  /** Boiler numbers (nuro) created under the current site during this run */
  private _boilerNumbers: string[] = [];

  /** Site ID for the current site (for ID-based operations where needed) */
  private _currentSiteId: string | undefined;

  private constructor() {
    // Private constructor to enforce singleton
  }

  static getInstance(): TestContext {
    if (!TestContext.instance) {
      TestContext.instance = new TestContext();
    }
    return TestContext.instance;
  }

  /**
   * Set the current site name at site-creation time.
   * This starts the name-threading through the e2e flow.
   */
  setCurrentSite(siteName: string, siteId?: string): void {
    this._currentSiteName = siteName;
    this._currentSiteId = siteId;
    this._boilerNumbers = []; // Reset boilers when site changes
    logger.system('Test context updated - current site set', {
      module: 'TestContext',
      siteName,
      siteId
    });
  }

  /**
   * Update the current site name (e.g., after site-update changes it).
   * This ensures all subsequent tests use the updated name.
   */
  updateCurrentSiteName(newSiteName: string): void {
    const oldName = this._currentSiteName;
    this._currentSiteName = newSiteName;
    logger.system('Test context updated - site name changed', {
      module: 'TestContext',
      oldName,
      newName: newSiteName
    });
  }

  /**
   * Update the current site ID (if needed for ID-based operations).
   */
  updateCurrentSiteId(siteId: string): void {
    this._currentSiteId = siteId;
    logger.system('Test context updated - site ID set', {
      module: 'TestContext',
      siteId
    });
  }

  /**
   * Add a boiler number to the list of boilers created under the current site.
   * Used for tracking which boilers should be affected by future site-deletion.
   */
  addBoilerNumber(boilerNumber: string): void {
    if (!this._boilerNumbers.includes(boilerNumber)) {
      this._boilerNumbers.push(boilerNumber);
      logger.system('Test context updated - boiler added', {
        module: 'TestContext',
        boilerNumber,
        totalBoilers: this._boilerNumbers.length
      });
    }
  }

  /**
   * Get the current site name being tracked through the e2e flow.
   * Returns undefined if running in standalone mode (no site-creation in this run).
   */
  getCurrentSiteName(): string | undefined {
    return this._currentSiteName;
  }

  /**
   * Get the current site ID.
   */
  getCurrentSiteId(): string | undefined {
    return this._currentSiteId;
  }

  /**
   * Get all boiler numbers created under the current site during this run.
   */
  getBoilerNumbers(): readonly string[] {
    return Object.freeze([...this._boilerNumbers]);
  }

  /**
   * Check if we're running in full e2e mode (site was created in this run).
   */
  hasCurrentSite(): boolean {
    return this._currentSiteName !== undefined;
  }

  /**
   * Clear the context (useful for test cleanup or between test runs).
   */
  clear(): void {
    const hadSite = this._currentSiteName;
    this._currentSiteName = undefined;
    this._currentSiteId = undefined;
    this._boilerNumbers = [];
    if (hadSite) {
      logger.system('Test context cleared', { module: 'TestContext' });
    }
  }

  /**
   * Get a summary of the current context state (for debugging/logging).
   */
  getSummary(): { siteName?: string; siteId?: string; boilerCount: number; boilerNumbers: readonly string[] } {
    return {
      siteName: this._currentSiteName,
      siteId: this._currentSiteId,
      boilerCount: this._boilerNumbers.length,
      boilerNumbers: this.getBoilerNumbers()
    };
  }
}

/**
 * Convenience function to get the singleton instance.
 */
export function getTestContext(): TestContext {
  return TestContext.getInstance();
}
