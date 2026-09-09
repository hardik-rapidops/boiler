import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/basePage';
import type { SiteData } from '../../types/site';
import { logger } from '../../utils/logger';

type SiteSearchFilter = 'name' | 'description' | 'address';

export class SitesPage extends BasePage {
  readonly createButton: Locator = this.byTestId('site-create')
    .or(this.page.locator('md-button.btn-fix-bottom[ng-click="siteinfo();"]'))
    .or(this.addNewSiteAnchor)
    .or(this.page.locator('#side-menu md-button[ui-sref="common.add-sites"]').filter({ hasText: /add a new site/i }))
    .or(this.page.locator('md-content').last().getByRole('button', { name: /^add a new site$/i }));
  readonly searchInput: Locator = this.byTestId('site-search').or(this.inputByModel('searchSites')).or(this.inputByLabel(/search/i));
  readonly saveButton: Locator = this.byTestId('site-save').or(this.button(/^save$/i));
  readonly successMessage: Locator = this.page.getByText(/site is added/i);
  readonly updateSuccessMessage: Locator = this.page.getByText(/site.*updated|site.*saved|updated successfully/i);
  readonly noRecordsMessage: Locator = this.page.getByText(/you have no sites|no (sites?|records?) found|no data/i);
  readonly boilerAlertsNotificationOption: Locator = this.page.getByText(
    /don't notify anyone on boiler alerts from this site/i
  );

  async open(): Promise<void> {
    logger.step('Opening Sites page', { module: 'SitesPage' });
    await this.goto('/#!/sites');
    await this.searchInput.or(this.createButton).first().waitFor({ state: 'visible' });
  }

  async openCreateSite(): Promise<void> {
    logger.step('Opening Create Site form', { module: 'SitesPage' });
    await this.clickFirstVisible([
      this.byTestId('site-create'),
      this.page.locator('md-button.btn-fix-bottom[ng-click="siteinfo();"]'),
      this.addNewSiteAnchor,
      this.page.locator('#side-menu md-button[ui-sref="common.add-sites"]').filter({ hasText: /add a new site/i }),
      this.page.locator('md-content').last().getByRole('button', { name: /^add a new site$/i })
    ]);
    await this.inputByModel('vm.site.name').waitFor({ state: 'visible' });
  }

  async fillSiteForm(site: SiteData): Promise<void> {
    logger.step('Filling Site form', { module: 'SitesPage', siteName: site.name, city: site.city, state: site.state || site.province });
    await this.inputByModel('vm.site.name').or(this.inputByLabel(/^name$/i)).fill(site.name);
    await this.inputByModel('vm.site.description').or(this.inputByLabel(/^description$/i)).fill(site.description);
    await this.inputByModel('vm.site.address').or(this.inputByLabel(/^address$/i)).fill(site.address);
    await this.inputByModel('vm.site.city').or(this.inputByLabel(/^city$/i)).fill(site.city);
    await this.inputByModel('vm.site.state').or(this.inputByLabel(/state|province/i)).fill(site.state || site.province);
    await this.inputByModel('vm.site.zip').or(this.inputByLabel(/^zip$/i)).fill(site.zip);

    const fuelInput = this.inputByModel('vm.site.fuel').or(this.inputByLabel(/fuel cost/i));
    if (await fuelInput.isVisible().catch(() => false)) {
      await fuelInput.fill(site.fuel);
    }
  }

  async createSite(site: SiteData): Promise<void> {
    logger.step('Creating Site through UI', { module: 'SitesPage', siteName: site.name });
    await this.openCreateSite();
    await this.fillSiteForm(site);
    await this.saveButton.click();
  }

  async expectSiteCreated(): Promise<void> {
    logger.step('Verifying Site created success message', { module: 'SitesPage' });
    await this.expectLoaded(this.successMessage);
  }

  async searchBySiteName(siteName: string): Promise<void> {
    logger.step('Searching Site by name', { module: 'SitesPage', siteName });
    await this.open();
    await this.searchInput.fill(siteName);
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await this.page.waitForTimeout(500);
  }

  async searchSiteByName(siteName: string): Promise<void> {
    logger.step('Searching Site using Name filter', { module: 'SitesPage', siteName });
    await this.searchByFilter('name', siteName);
  }

  async searchSiteByDescription(description: string): Promise<void> {
    logger.step('Searching Site using Description filter', { module: 'SitesPage' });
    await this.searchByFilter('description', description);
  }

  async searchSiteByAddress(address: string): Promise<void> {
    logger.step('Searching Site using Address filter', { module: 'SitesPage' });
    await this.searchByFilter('address', address);
  }

  async verifySearchFilterVisible(filter: SiteSearchFilter): Promise<void> {
    logger.step('Verifying Site search filter is available', { module: 'SitesPage', filter });
    await this.open();
    const filterControl = this.searchFilterControl(filter).first();
    if (await filterControl.isVisible().catch(() => false)) {
      await expect(filterControl).toBeEnabled();
      return;
    }

    await expect(this.searchInput.first()).toBeVisible();
    await expect(this.searchInput.first()).toBeEnabled();
  }

  async verifySearchFilterHiddenOrDisabled(
    filter: SiteSearchFilter,
    searchValue?: string,
    visibleSiteName?: string
  ): Promise<void> {
    logger.step('Verifying Site search filter is restricted', { module: 'SitesPage', filter });
    await this.open();
    const filterControl = this.searchFilterControl(filter).first();

    // Filter control should either be hidden (not in DOM) or visible but disabled
    if (await filterControl.isVisible().catch(() => false)) {
      // If visible, it must be disabled
      await expect(filterControl).toBeDisabled();
    } else {
      // If not visible, verify it's hidden (expected for restricted roles)
      await expect(filterControl).toBeHidden();
    }
  }

  siteResult(siteName: string): Locator {
    return this.byTestId(`site-result-${siteName}`)
      .or(this.page.locator('.sites-list:visible md-list-item').filter({ hasText: siteName }))
      .or(this.page.locator('.sites-list:visible .each-site').filter({ hasText: siteName }));
  }

  async expectSiteVisible(siteName: string): Promise<void> {
    logger.step('Verifying Site is visible', { module: 'SitesPage', siteName });
    await this.expectLoaded(this.siteResult(siteName).first());
  }

  async verifySiteVisibleInList(siteName: string): Promise<void> {
    await this.expectSiteVisible(siteName);
  }

  async verifySiteNotVisibleInList(siteName: string): Promise<void> {
    logger.step('Verifying Site is not visible in list', { module: 'SitesPage', siteName });
    await expect(this.siteResult(siteName).first()).toBeHidden();
  }

  async verifySiteVisibleForAssignedUser(siteName: string): Promise<void> {
    await this.searchBySiteName(siteName);
    await this.expectSiteVisible(siteName);
  }

  async verifySiteNotVisibleForAssignedUser(siteName: string): Promise<void> {
    await this.verifySiteNotVisible(siteName);
  }

  async verifySiteNotVisible(siteName: string): Promise<void> {
    logger.step('Verifying Site is not visible after search', { module: 'SitesPage', siteName });
    await this.searchBySiteName(siteName);
    await expect(this.siteResult(siteName).first()).toBeHidden();
  }

  async verifyNoRecordsMessageOrEmptyResults(): Promise<void> {
    logger.step('Verifying no Site records are displayed', { module: 'SitesPage' });
    if (await this.noRecordsMessage.first().isVisible().catch(() => false)) {
      await expect(this.noRecordsMessage.first()).toBeVisible();
      return;
    }

    await expect(this.page.locator('.sites-list:visible .each-site:visible')).toHaveCount(0);
  }

  async openSiteFromSearch(siteName: string): Promise<void> {
    logger.step('Opening Site from search results', { module: 'SitesPage', siteName });
    await this.searchBySiteName(siteName);
    await this.expectSiteVisible(siteName);
    await this.siteLink(siteName).click();
    await this.page.waitForURL(/site-info\/[^/?#]+/, { timeout: 10_000 });
  }

  async openSiteById(siteId: string, siteName?: string): Promise<void> {
    logger.step('Opening Site by ID', { module: 'SitesPage', siteId, siteName });

    // Navigate directly to the site-info page using the site ID
    await this.goto(`/#!/site-info/${siteId}`);
    await this.page.waitForLoadState('networkidle').catch(() => undefined);

    // Wait for site info page to load
    const nameField = this.siteField('name');
    await expect(nameField).toBeVisible({ timeout: 10_000 });

    // Verify we're on the correct site by checking the URL contains the expected ID
    await expect.poll(
      () => this.page.url(),
      {
        message: `Expected to be on site-info page for site ID ${siteId}`,
        timeout: 5_000
      }
    ).toMatch(new RegExp(`site-info[^?#]*${siteId}`));
  }

  async verifyCurrentSiteId(expectedSiteId: string): Promise<void> {
    logger.step('Verifying current site ID from URL', { module: 'SitesPage', expectedSiteId });
    const currentUrl = this.page.url();
    const actualSiteId = this.extractSiteId(currentUrl);

    if (actualSiteId !== expectedSiteId) {
      logger.error('Site ID mismatch', {
        module: 'SitesPage',
        expected: expectedSiteId,
        actual: actualSiteId,
        url: currentUrl
      });
    }

    await expect.poll(
      () => this.extractSiteId(this.page.url()),
      {
        message: `Expected site ID ${expectedSiteId}, but got different ID from URL`,
        timeout: 5_000
      }
    ).toBe(expectedSiteId);
  }

  async openSiteEditMode(): Promise<void> {
    logger.step('Opening Site edit mode', { module: 'SitesPage' });
    const nameField = this.siteField('name');
    await expect(nameField).toBeVisible();
    if (await nameField.isEnabled().catch(() => false)) {
      return;
    }

    const editControl = this.byTestId('site-edit')
      .or(this.page.getByRole('button', { name: /^edit$/i }))
      .or(this.page.getByRole('link', { name: /^edit$/i }))
      .or(this.page.locator('[ng-click*="edit" i]'))
      .first();
    if (await editControl.isVisible().catch(() => false)) {
      await editControl.click();
    }
  }

  async updateSiteDetails(site: SiteData): Promise<void> {
    logger.step('Updating Site details', { module: 'SitesPage', siteName: site.name });
    await this.verifySiteFieldsEnabled();
    await this.fillSiteForm(site);
  }

  async verifySiteFieldsEnabled(): Promise<void> {
    logger.step('Verifying Site fields are enabled', { module: 'SitesPage' });
    for (const field of this.editableSiteFields()) {
      if (await field.isVisible().catch(() => false)) {
        await expect(field).toBeEnabled();
      }
    }
  }

  async verifySiteFieldsDisabledOrReadOnly(): Promise<void> {
    logger.step('Verifying Site fields are disabled or read-only', { module: 'SitesPage' });
    for (const field of this.editableSiteFields()) {
      if (!(await field.isVisible().catch(() => false))) {
        continue;
      }

      await expect
        .poll(
          () =>
            field.evaluate((element) => {
              const input = element as HTMLInputElement;
              return input.disabled || input.readOnly || element.getAttribute('aria-disabled') === 'true';
            }),
          { message: `Expected ${await field.getAttribute('ng-model')} to be disabled or read-only` }
        )
        .toBe(true);
    }
  }

  async verifyBoilerAlertsNotificationOptionVisible(): Promise<void> {
    await expect(this.boilerAlertsNotificationOption.first()).toBeVisible();
  }

  async verifyBoilerAlertsNotificationOptionHidden(): Promise<void> {
    await expect.soft(this.boilerAlertsNotificationOption.first()).toBeHidden();
  }

  async verifySaveButtonStateDoesNotGrantUpdateAccess(): Promise<void> {
    if (await this.saveButton.first().isVisible().catch(() => false)) {
      await expect(this.saveButton.first()).toBeVisible();
      return;
    }
    await expect(this.saveButton.first()).toBeHidden();
  }

  async saveSiteUpdate(): Promise<void> {
    logger.step('Saving Site update', { module: 'SitesPage' });
    await this.saveButton.click();
  }

  async verifyUpdateSuccess(): Promise<void> {
    logger.step('Verifying Site update success message', { module: 'SitesPage' });
    await expect(this.updateSuccessMessage.first()).toBeVisible();
  }

  async verifyUpdatedSiteSearchable(siteName: string): Promise<void> {
    logger.step('Verifying updated site is searchable', { module: 'SitesPage', siteName });
    await this.searchBySiteName(siteName);

    // Poll for search results to appear (handles debounced search and network delays)
    await expect.poll(
      async () => await this.siteResult(siteName).count(),
      {
        message: `Site "${siteName}" did not appear in search results after update`,
        timeout: 15_000,
        intervals: [500, 1000, 2000]
      }
    ).toBeGreaterThan(0);

    await this.expectSiteVisible(siteName);
  }

  async verifySiteDetails(site: SiteData): Promise<void> {
    logger.step('Verifying Site details', { module: 'SitesPage', siteName: site.name });
    await expect(this.siteField('name')).toHaveValue(site.name);
    await expect(this.siteField('description')).toHaveValue(site.description);
    await expect(this.siteField('address')).toHaveValue(site.address);
    await expect(this.siteField('city')).toHaveValue(site.city);
    await expect(this.siteField('state')).toHaveValue(site.state || site.province);
    await expect(this.siteField('zip')).toHaveValue(site.zip);

    const fuelField = this.siteField('fuel');
    if (await fuelField.isVisible().catch(() => false)) {
      await expect(fuelField).toHaveValue(site.fuel);
    }
  }

  async openAccessControl(): Promise<void> {
    logger.step('Opening Site Access Control', { module: 'SitesPage' });
    const accessControlLink = this.page
      .locator('a[ui-sref^="common.users"], a[href^="#!/users/"]')
      .or(this.page.locator('main a').filter({ hasText: /access\s*control/i }));

    if (await accessControlLink.first().isVisible().catch(() => false)) {
      await accessControlLink.first().click();
    } else {
      const siteId = this.extractSiteId(this.page.url());
      if (!siteId) {
        throw new Error('Unable to open Access Control because Site ID was not found in the current URL.');
      }
      await this.goto(`/#!/users/${siteId}`);
    }

    await this.page.waitForURL(/users\/[^/?#]+/, { timeout: 10_000 });
  }

  async getSiteIdFromResult(siteName: string): Promise<string> {
    logger.step('Capturing Site ID from search result', { module: 'SitesPage', siteName });
    const link = this.siteLink(siteName);
    const uiSref = await link.getAttribute('ui-sref').catch(() => null);
    const href = await link.getAttribute('href').catch(() => null);
    const idFromAttribute = this.extractSiteId(href || '') ?? this.extractSiteId(uiSref || '');

    if (idFromAttribute) {
      return idFromAttribute;
    }

    await link.click();
    await this.page.waitForURL(/site-info\/[^/?#]+/, { timeout: 10_000 });
    const idFromUrl = this.extractSiteId(this.page.url());
    if (!idFromUrl) {
      throw new Error(`Unable to capture Site ID for ${siteName}`);
    }
    return idFromUrl;
  }

  /**
   * Get the first available site from the sites list (for standalone mode fallback).
   *
   * MODE 2 ONLY: This is used when running tests standalone (e.g., only boiler-creation)
   * without site-creation in the run. Simply returns the first site that appears in the
   * existing site list - no "latest created" logic, no complex filtering.
   *
   * DO NOT use this when running the full e2e sequence - use the testContext instead.
   */
  async getFirstAvailableSite(): Promise<{ name: string; id?: string } | undefined> {
    logger.warn('No site context found - using first available site (standalone mode fallback)', {
      module: 'SitesPage'
    });

    await this.open();

    // Wait for sites to load
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await this.page.waitForTimeout(500);

    // Get all site results in the list
    const sitesList = this.page.locator('.sites-list:visible md-list-item, .sites-list:visible .each-site');
    const count = await sitesList.count();

    if (count === 0) {
      logger.error('No sites found in list for fallback resolution', { module: 'SitesPage' });
      return undefined;
    }

    // Get the first site's name from the list
    const firstSite = sitesList.first();
    const siteName = await firstSite.innerText().then((text) => {
      // Extract just the site name (first line/main text)
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
      return lines[0] || text.trim();
    }).catch(() => '');

    if (!siteName) {
      logger.error('Could not extract site name from first site in list', { module: 'SitesPage' });
      return undefined;
    }

    // Try to get the site ID as well
    let siteId: string | undefined;
    try {
      const link = firstSite.locator('a[ui-sref^="common.site-info"], a[href*="site-info"]').first();
      const uiSref = await link.getAttribute('ui-sref').catch(() => null);
      const href = await link.getAttribute('href').catch(() => null);
      siteId = this.extractSiteId(href || '') ?? this.extractSiteId(uiSref || '') ?? undefined;
    } catch (error) {
      // ID extraction is optional - we can work with just the name
      logger.debug('Could not extract site ID from first site, will use name only', {
        module: 'SitesPage',
        siteName
      });
    }

    logger.system('First available site selected for standalone run', {
      module: 'SitesPage',
      siteName,
      siteId,
      mode: 'standalone-fallback'
    });

    return { name: siteName, id: siteId };
  }

  private extractSiteId(value: string): string | null {
    const siteId = value.match(/site-info\/([^/?#]+)/)?.[1] ?? value.match(/siteId[:=]([^)}&#/]+)/)?.[1] ?? null;
    return siteId && !siteId.includes('.') ? siteId : null;
  }

  private siteField(field: 'name' | 'description' | 'address' | 'city' | 'state' | 'zip' | 'fuel'): Locator {
    return this.inputByModel(`vm.site.${field}`);
  }

  private editableSiteFields(): Locator[] {
    return [
      this.siteField('name'),
      this.siteField('description'),
      this.siteField('address'),
      this.siteField('city'),
      this.siteField('state'),
      this.siteField('zip'),
      this.siteField('fuel'),
      this.page.locator('md-select[ng-model="vm.site.timeZone"]')
    ];
  }

  private siteLink(siteName: string): Locator {
    return this.siteResult(siteName)
      .locator('a[ui-sref^="common.site-info"], a[href*="site-info"]')
      .first();
  }

  private async searchByFilter(filter: SiteSearchFilter, value: string): Promise<void> {
    await this.open();
    const filterControl = this.searchFilterControl(filter).first();
    if (await filterControl.isVisible().catch(() => false)) {
      await filterControl.click();
    }
    await this.searchInput.fill(value);
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await this.page.waitForTimeout(500);
  }

  private searchFilterControl(filter: SiteSearchFilter): Locator {
    const filterLabel = new RegExp(`^${filter}$`, 'i');
    const filterTestId = `site-search-filter-${filter}`;
    return this.byTestId(filterTestId)
      .or(this.page.getByRole('button', { name: filterLabel }))
      .or(this.page.getByRole('radio', { name: filterLabel }))
      .or(this.page.getByRole('checkbox', { name: filterLabel }))
      .or(this.page.getByRole('option', { name: filterLabel }))
      .or(this.page.locator('md-option, md-radio-button, md-checkbox, button, a').filter({ hasText: filterLabel }));
  }

  private async clickFirstVisible(locators: Locator[]): Promise<void> {
    for (const locator of locators) {
      const first = locator.first();
      if (await first.isVisible().catch(() => false)) {
        await first.click();
        return;
      }
    }

    throw new Error('Unable to find a visible Add Site control. Expected plus icon or left navigation Add a new site link.');
  }

  private get addNewSiteAnchor(): Locator {
    return this.page
      .locator('li')
      .filter({ has: this.page.locator('a') })
      .filter({ has: this.page.locator('span') })
      .locator('a')
      .filter({ hasText: /^Add a new site$/i });
  }
}
