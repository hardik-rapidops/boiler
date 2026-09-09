import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/basePage';
import { logger } from '../../utils/logger';

export type BoilerDeviceInfo = {
  sola: string;
  nuro: string;
};

export class BoilersPage extends BasePage {
  readonly searchInput: Locator = this.byTestId('boiler-search')
    .or(this.inputByModel('searchBoilers'))
    .or(this.inputByLabel(/search/i));
  readonly addNewBoilerLink: Locator = this.byTestId('boiler-create')
    .or(this.page.locator('a, button, md-button').filter({ hasText: /^add a new boiler$/i }))
    .or(this.page.locator('md-button.btn-fix-bottom, button.btn-fix-bottom, a.btn-fix-bottom'));
  readonly boilerCodeInput: Locator = this.byTestId('boiler-code')
    .or(this.inputByModel('vm.code'))
    .or(this.inputByModel('vm.boilerCode'))
    .or(this.inputByLabel(/code/i))
    .or(this.page.locator('input[placeholder*="code" i]'));
  readonly boilerCodeDigitInputs: Locator = this.page.locator('input[ng-model^="vm.code["], input.password-text[maxlength="1"]');
  readonly addBoilerButton: Locator = this.byTestId('boiler-add-submit')
    .or(this.button(/^add boiler$/i))
    .or(this.page.locator('button, md-button').filter({ hasText: /^add boiler$/i }));
  readonly nameField: Locator = this.byTestId('boiler-name')
    .or(this.inputByModel('vm.boiler.name'))
    .or(this.inputByLabel(/^name$/i));
  readonly descriptionField: Locator = this.byTestId('boiler-description')
    .or(this.inputByModel('vm.boiler.description'))
    .or(this.inputByLabel(/^description$/i));
  readonly siteSelect: Locator = this.byTestId('boiler-site')
    .or(this.page.locator('md-select[ng-model="vm.selectedSiteId"], md-select[ng-model="vm.boiler.siteId"], md-select[ng-model="vm.boiler.site"]'))
    .or(this.inputByLabel(/^site$/i));
  readonly saveButton: Locator = this.byTestId('boiler-save')
    .or(this.button(/^save$/i))
    .or(this.page.locator('button, md-button').filter({ hasText: /^save$/i }))
    .or(this.page.locator('div > div > div > md-content > div > button'));
  readonly saveSuccessMessage: Locator = this.page.getByText(/boiler.*saved|boiler.*updated|saved successfully/i);
  readonly solaField: Locator = this.byTestId('boiler-sola')
    .or(this.inputByModel('vm.boiler.sola'))
    .or(this.inputByModel('vm.boiler.solaSerialNumber'))
    .or(this.inputByLabel(/sola/i))
    .or(this.page.locator('input[ng-model*="sola" i]'));
  readonly nuroField: Locator = this.byTestId('boiler-nuro')
    .or(this.inputByModel('vm.boiler.nuro'))
    .or(this.inputByModel('vm.boiler.nuroSerialNumber'))
    .or(this.inputByLabel(/nuro/i))
    .or(this.page.locator('input[ng-model*="nuro" i]'));

  async navigateToBoilers(): Promise<void> {
    logger.step('Navigating to Boilers page', { module: 'BoilersPage' });
    await this.goto('/#!/boilers');
    await this.page.waitForLoadState('networkidle').catch(() => undefined);

    // AngularJS apps need extra time to bootstrap and render
    // Give the digest cycle time to complete before checking for elements
    await this.page.waitForTimeout(1000);

    await this.searchInput.or(this.addNewBoilerLink).first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async clickAddNewBoiler(): Promise<void> {
    logger.step('Clicking Add New Boiler', { module: 'BoilersPage' });
    await this.clickFirstVisible([
      this.byTestId('boiler-create'),
      this.page.locator('a, button, md-button').filter({ hasText: /^add a new boiler$/i }),
      this.page.locator('md-button.btn-fix-bottom, button.btn-fix-bottom, a.btn-fix-bottom')
    ]);
    await this.boilerCodeInput.or(this.boilerCodeDigitInputs).first().waitFor({ state: 'visible' });
  }

  async enterBoilerCode(code: string): Promise<void> {
    logger.step('Entering Boiler registration code', { module: 'BoilersPage', codeLength: code.length });
    const digitInputs = this.boilerCodeDigitInputs;
    const digitCount = await digitInputs.count();
    if (digitCount >= code.length) {
      for (const [index, character] of [...code].entries()) {
        await digitInputs.nth(index).fill(character);
      }
      return;
    }

    await this.boilerCodeInput.first().fill(code);
  }

  async clickAddBoiler(): Promise<void> {
    logger.step('Clicking Add Boiler', { module: 'BoilersPage' });
    await this.addBoilerButton.first().click();
  }

  async verifyBoilerInfoPage(): Promise<void> {
    logger.step('Verifying Boiler information page is displayed', { module: 'BoilersPage' });
    await expect(this.nameField.first()).toBeVisible();
  }

  async verifyAutoPopulatedName(nuro: string): Promise<void> {
    logger.step('Verifying Boiler name was auto-populated', { module: 'BoilersPage', nuro });
    await expect(this.nameField.first()).toHaveValue(nuro);
  }

  async verifyDeviceInfo(deviceInfo: BoilerDeviceInfo): Promise<void> {
    logger.step('Verifying Boiler device information', { module: 'BoilersPage', nuro: deviceInfo.nuro, sola: deviceInfo.sola });
    await expect(this.solaField.first()).toHaveValue(deviceInfo.sola);
    await expect(this.nuroField.first()).toHaveValue(deviceInfo.nuro);
  }

  async verifyDeviceInfoReadOnly(): Promise<void> {
    logger.step('Verifying Boiler device fields are read-only', { module: 'BoilersPage' });
    for (const field of [this.solaField.first(), this.nuroField.first()]) {
      await expect
        .poll(() =>
          field.evaluate((element) => {
            const input = element as HTMLInputElement;
            return input.disabled || input.readOnly || element.getAttribute('aria-disabled') === 'true';
          })
        )
        .toBe(true);
    }
  }

  async enterDescription(description: string): Promise<void> {
    logger.step('Entering Boiler description', { module: 'BoilersPage' });
    await this.descriptionField.first().fill(description);
  }

  async selectSite(siteName: string): Promise<void> {
    logger.step('Selecting Site for Boiler', { module: 'BoilersPage', siteName });
    const selected = await this.selectSiteIfAvailable(siteName);
    if (!selected) {
      throw new Error(`Site ${siteName} is not available in Boiler Site dropdown.`);
    }
  }

  async selectSiteIfAvailable(siteName: string): Promise<string | undefined> {
    logger.step('Selecting Site for Boiler if available', { module: 'BoilersPage', siteName });
    const select = this.siteSelect.first();
    await expect(select).toBeVisible();

    const tagName = await select.evaluate((element) => element.tagName.toLowerCase());
    if (tagName === 'select') {
      const option = select
        .locator('option', { hasText: new RegExp(`^\\s*${this.escapeRegExp(siteName)}\\s*$`) })
        .first();
      if (!(await option.count())) return undefined;
      const selectedSiteName = this.normalizeSiteName(await option.innerText());
      await select.selectOption({ label: selectedSiteName });
      return selectedSiteName;
    }

    // For md-select: open dropdown and wait for options to load from API
    await select.click();

    // Wait for dropdown options to populate from API (newly created sites need time to appear)
    // First, wait for ANY option to be visible (dropdown has loaded)
    try {
      await this.page.getByRole('option').or(this.page.locator('md-option')).first().waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      logger.warn('No sites available in dropdown after 5s wait', { module: 'BoilersPage' });
      await this.closeSiteDropdown(select);
      return undefined;
    }

    // Additional wait for API response to complete (newly created sites may take 1-2s to appear)
    await this.page.waitForTimeout(2000);

    const option = this.page
      .getByRole('option', { name: new RegExp(`^\\s*${this.escapeRegExp(siteName)}\\s*$`) })
      .or(this.page.locator('md-option').filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(siteName)}\\s*$`) }))
      .filter({ visible: true })
      .first();
    if (!(await option.isVisible().catch(() => false))) {
      await this.closeSiteDropdown(select);
      return undefined;
    }
    const selectedSiteName = this.normalizeSiteName(await option.innerText());
    await option.click({ force: true });
    await this.closeSiteDropdown(select);
    return selectedSiteName;
  }

  async selectFirstAvailableSite(): Promise<string> {
    logger.step('Selecting first Site available in Boiler form', { module: 'BoilersPage' });
    const select = this.siteSelect.first();
    await expect(select).toBeVisible();
    await select.click();
    const option = this.page.getByRole('option').filter({ visible: true }).first();
    await expect(option, 'At least one Site should be selectable for Boiler creation').toBeVisible();
    const siteName = this.normalizeSiteName(await option.innerText());
    await option.click({ force: true });
    await this.closeSiteDropdown(select);
    return siteName;
  }

  async saveBoiler(): Promise<void> {
    logger.step('Saving Boiler', { module: 'BoilersPage' });
    await this.closeOpenSiteDropdownIfNeeded();
    await this.saveButton.first().click();
  }

  async verifySaveSuccess(): Promise<void> {
    logger.step('Verifying Boiler save success', { module: 'BoilersPage' });
    if (await this.saveSuccessMessage.first().isVisible().catch(() => false)) {
      await expect(this.saveSuccessMessage.first()).toBeVisible();
      return;
    }

    await expect
      .poll(() => this.page.url(), { message: 'Expected Boiler save to complete by message or navigation' })
      .toMatch(/#!\/(?:boilers|boiler-info)/i);
  }

  async searchBoiler(boilerName: string): Promise<void> {
    logger.step('Searching Boiler', { module: 'BoilersPage', boilerName });
    await this.navigateToBoilers();
    const search = this.searchInput.filter({ visible: true }).first();
    await search.waitFor({ state: 'visible', timeout: 30_000 });
    await search.scrollIntoViewIfNeeded().catch(() => undefined);
    await search.fill(boilerName);

    // Wait for search results to populate after filling the search input
    // This accounts for debounced search, API latency, and backend indexing delays
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

    // Give AngularJS digest cycle time to render results
    await this.page.waitForTimeout(500);
  }

  async verifyBoilerInSearchResult(boilerName: string): Promise<void> {
    logger.step('Verifying Boiler is present in search results', { module: 'BoilersPage', boilerName });
    // Use polling to handle eventual consistency - boiler may take a few seconds to appear
    // in search results after creation due to backend indexing or API propagation delays
    await expect
      .poll(
        async () => {
          const result = this.boilerResult(boilerName).first();
          return (await result.count().catch(() => 0)) > 0;
        },
        {
          message: `Boiler ${boilerName} should appear in search results`,
          timeout: 30_000,
          intervals: [1000, 2000, 2000, 3000]
        }
      )
      .toBe(true);
  }

  async verifyBoilerUnderSite(boilerName: string, siteName: string): Promise<void> {
    logger.step('Verifying Boiler is listed under selected Site', { module: 'BoilersPage', boilerName, siteName });

    // Get all accordion buttons for this site and filter for visible ones to avoid stale/hidden duplicates
    const siteButtons = this.siteAccordionButton(siteName).filter({ visible: true });

    // Poll for site accordion button to appear (may take time after search results load)
    await expect
      .poll(
        async () => (await siteButtons.count().catch(() => 0)) > 0,
        {
          message: `Selected Site ${siteName} should be present as a Site accordion button`,
          timeout: 15_000,
          intervals: [500, 1000, 1000]
        }
      )
      .toBe(true);

    // Work with the first visible button
    const siteButton = siteButtons.first();

    // Get the panel that should expand (next sibling element after the button)
    const siteSection = siteButton.locator('xpath=following-sibling::*[1]');

    // Check if the panel is already visible (accordion already expanded)
    // This is the most reliable way to determine expansion state
    const isPanelVisible = await siteSection.isVisible().catch(() => false);

    if (!isPanelVisible) {
      logger.step('Expanding Site accordion', { module: 'BoilersPage', siteName });

      // Diagnostic: Check button state before clicking
      const buttonInfo = await siteButton.evaluate((el) => ({
        visible: el.offsetParent !== null,
        displayed: window.getComputedStyle(el).display,
        classes: el.className,
        boundingBox: el.getBoundingClientRect(),
        parentVisible: el.parentElement ? window.getComputedStyle(el.parentElement).display : 'unknown'
      })).catch(() => ({ visible: false, displayed: 'unknown', classes: '', boundingBox: null, parentVisible: 'unknown' }));

      logger.debug('Accordion button state before expansion', {
        module: 'BoilersPage',
        siteName,
        buttonInfo
      });

      // Ensure button is scrolled into view
      await siteButton.scrollIntoViewIfNeeded().catch(() => undefined);

      // Wait for button to be actionable (visible, stable, enabled)
      await siteButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => undefined);

      // Click the button normally (without force - let Playwright verify actionability)
      await siteButton.click({ timeout: 5_000 }).catch(async (error) => {
        // If normal click fails, log diagnostics and retry with force
        logger.warn('Normal accordion click failed, retrying with force', {
          module: 'BoilersPage',
          siteName,
          error: error.message
        });
        await siteButton.click({ force: true });
      });

      // Wait for the panel to become visible after expansion
      await expect(siteSection).toBeVisible({ timeout: 5_000 });

      logger.debug('Accordion expanded successfully', { module: 'BoilersPage', siteName });
    } else {
      logger.debug('Accordion already expanded, skipping click', { module: 'BoilersPage', siteName });
    }

    const boilerInSite = siteSection
      .locator('md-list-item button[ng-click*="goToDetailsPage"], md-list-item .md-button')
      .filter({ hasText: boilerName })
      .first();

    // Poll for boiler to appear under the site section
    await expect
      .poll(
        async () => (await boilerInSite.count().catch(() => 0)) > 0,
        {
          message: `Boiler ${boilerName} should be listed under Site ${siteName}`,
          timeout: 15_000,
          intervals: [500, 1000, 1000]
        }
      )
      .toBe(true);
  }

  async verifyCreatedBoilerSearchResult(boilerName: string, siteName: string): Promise<void> {
    await this.verifyBoilerInSearchResult(boilerName);
    await this.verifyBoilerUnderSite(boilerName, siteName);
  }

  async verifyBoilerTypeInSearchResult(boilerName: string, boilerTypeLabel: string): Promise<void> {
    logger.step('Verifying Boiler type in search result', { module: 'BoilersPage', boilerName, boilerTypeLabel });
    await expect(
      this.boilerResult(boilerName).filter({ hasText: boilerTypeLabel }).first(),
      `Boiler ${boilerName} should display Boiler type ${boilerTypeLabel}`
    ).toBeAttached();
  }

  async getBoilerCardBackgroundColor(boilerName: string): Promise<string> {
    const result = this.boilerResult(boilerName).first();
    await expect(result, `Boiler ${boilerName} should be present before reading background color`).toBeAttached();
    return result.evaluate((element) => window.getComputedStyle(element).backgroundColor);
  }

  async verifyBoilerBackgroundColor(
    boilerName: string,
    expectedColor: string,
    expectedCssClass?: string
  ): Promise<void> {
    logger.step('Verifying Boiler card background color', {
      module: 'BoilersPage',
      boilerName,
      expectedColor,
      expectedCssClass
    });
    const result = this.boilerResult(boilerName).first();
    await expect(result, `Boiler ${boilerName} should be present before color validation`).toBeAttached();
    if (expectedCssClass && expectedCssClass !== 'white-list-bg') {
      await expect(result, `Boiler ${boilerName} should use ${expectedCssClass}`).toHaveClass(new RegExp(expectedCssClass));
    }
    const expectedRgb = this.toRgbColor(expectedColor);
    await expect
      .poll(() => this.getBoilerCardBackgroundColor(boilerName), {
        message: `Boiler ${boilerName} should display background color ${expectedColor}`
      })
      .toBe(expectedRgb);
  }

  async getBoilerIdFromResult(boilerName: string): Promise<string> {
    logger.step('Capturing Boiler ID from search result', { module: 'BoilersPage', boilerName });
    const resultLink = this.boilerResult(boilerName).locator('a[href*="boiler"], a[ui-sref*="boiler"]').first();
    const href = await resultLink.getAttribute('href').catch(() => null);
    const uiSref = await resultLink.getAttribute('ui-sref').catch(() => null);
    return this.extractBoilerId(href || uiSref || '') ?? boilerName;
  }

  async openBoilerFromSearch(boilerName: string): Promise<void> {
    logger.step('Opening Boiler from search result', { module: 'BoilersPage', boilerName });
    const result = this.boilerResult(boilerName).first();
    await expect(result, `Boiler ${boilerName} should be present in search results`).toBeAttached();
    const link = result
      .locator('a[href*="boiler"], a[ui-sref*="boiler"], div.md-button, button, .md-button')
      .first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
    } else {
      await result.click({ force: true });
    }
    await this.verifyBoilerInfoPage();
  }

  async openBoilerDetailsFromSearch(nuro: string, payloadBrand?: string): Promise<void> {
    logger.step('Opening Boiler Details from Nuro search result', { module: 'BoilersPage', nuro });
    const result = this.boilerResult(nuro).first();
    await expect(result, `Boiler ${nuro} should be present in search results`).toBeAttached();
    const detailsControl = result
      .locator('button[ng-click*="goToDetailsPage"], a[href*="boiler-details"], a[ui-sref*="boiler-details"]')
      .first();
    await expect(detailsControl, `Boiler ${nuro} should have a details control`).toBeAttached();
    if (payloadBrand) {
      await detailsControl.evaluate((element, brand) => {
        const angularApi = (window as typeof window & {
          angular?: { element: (target: Element) => { scope: () => { boiler?: { brand?: string } } } };
        }).angular;
        const scope = angularApi?.element(element).scope();
        if (scope?.boiler) scope.boiler.brand = brand;
        localStorage.setItem('selectedBrand', brand);
      }, payloadBrand);
    }
    await detailsControl.click({ force: true });
    await this.page.waitForURL(/#!\/boiler-details\//i, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  }

  async verifySelectedSite(siteName: string): Promise<void> {
    logger.step('Verifying selected Site on Boiler page', { module: 'BoilersPage', siteName });
    const select = this.siteSelect.first();
    await expect(select).toBeVisible();
    const tagName = await select.evaluate((element) => element.tagName.toLowerCase());
    if (tagName === 'select') {
      await expect(select).toHaveValue(/.+/);
      await expect(select.locator(`option:checked`)).toHaveText(siteName);
      return;
    }

    await expect(select, `Boiler should be assigned to Site ${siteName}`).toContainText(siteName);
  }

  async getSelectedSiteId(): Promise<string | null> {
    logger.step('Getting selected Site ID from Boiler form', { module: 'BoilersPage' });
    const select = this.siteSelect.first();
    await expect(select).toBeVisible();

    // Try to get site ID from the ng-model value (md-select stores the value in ng-model)
    const siteId = await select.evaluate((element) => {
      // For md-select, the value is stored in ng-model
      const ngModel = element.getAttribute('ng-model');
      if (ngModel && (window as any).angular) {
        try {
          const scope = (window as any).angular.element(element).scope();
          // Try different possible model paths
          const modelPaths = ['vm.selectedSiteId', 'vm.boiler.siteId', 'vm.boiler.site'];
          for (const path of modelPaths) {
            const parts = path.split('.');
            let value: any = scope;
            for (const part of parts) {
              value = value?.[part];
            }
            if (value && typeof value === 'string') {
              return value;
            }
          }
        } catch (error) {
          // Angular scope access failed, continue
        }
      }

      // For regular select, get the value attribute
      if (element.tagName.toLowerCase() === 'select') {
        return (element as HTMLSelectElement).value || null;
      }

      return null;
    }).catch(() => null);

    logger.debug('Retrieved selected Site ID', { module: 'BoilersPage', siteId });
    return siteId;
  }

  async verifySelectedSiteId(expectedSiteId: string): Promise<void> {
    logger.step('Verifying selected Site ID on Boiler page', { module: 'BoilersPage', expectedSiteId });

    const actualSiteId = await this.getSelectedSiteId();

    if (actualSiteId !== expectedSiteId) {
      logger.error('Site ID mismatch in Boiler form', {
        module: 'BoilersPage',
        expected: expectedSiteId,
        actual: actualSiteId
      });
    }

    await expect.poll(
      () => this.getSelectedSiteId(),
      {
        message: `Expected site ID ${expectedSiteId} to be selected in Boiler form, but got different ID`,
        timeout: 5_000
      }
    ).toBe(expectedSiteId);
  }

  private boilerResult(boilerName: string): Locator {
    return this.byTestId(`boiler-result-${boilerName}`)
      .or(this.page.locator('.boilers-list:visible md-list-item, .boilers-list:visible .each-boiler').filter({ hasText: boilerName }))
      .or(
        this.page
          .locator('md-list-item, .each-boiler, .boilers-list [ng-repeat], .boilers-list [ng-repeat-start], md-card, tr')
          .filter({ hasText: boilerName })
      )
      .filter({ visible: true });
  }

  private siteBoilerSection(siteName: string): Locator {
    return this.byTestId(`boiler-site-section-${siteName}`)
      .or(this.page.locator('.boilers-list:visible [ng-repeat], .boilers-list:visible md-list, .boilers-list:visible md-list-item').filter({ hasText: siteName }))
      .or(this.page.locator('md-content, main, [role="main"]').filter({ hasText: siteName }));
  }

  private siteAccordionButton(siteName: string): Locator {
    return this.byTestId(`boiler-site-${siteName}`)
      .or(this.page.locator('button.sites-accordion').filter({ hasText: siteName }))
      .or(this.page.getByRole('button', { name: new RegExp(siteName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }));
  }

  private extractBoilerId(value: string): string | null {
    return value.match(/boiler[^/]*\/([^/?#]+)/i)?.[1] ?? value.match(/boilerId[:=]([^)}&#/]+)/i)?.[1] ?? null;
  }

  private toRgbColor(color: string): string {
    if (color.startsWith('rgb')) return color;
    const match = color.match(/^#([0-9a-f]{6})$/i);
    if (!match) throw new Error(`Unsupported color format: ${color}`);
    const value = match[1];
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return `rgb(${red}, ${green}, ${blue})`;
  }

  private async clickFirstVisible(locators: Locator[]): Promise<void> {
    for (const locator of locators) {
      const first = locator.first();
      if (await first.isVisible().catch(() => false)) {
        await first.click();
        return;
      }
    }

    throw new Error('Unable to find a visible Add Boiler control.');
  }

  private async closeOpenSiteDropdownIfNeeded(): Promise<void> {
    const select = this.siteSelect.first();
    if (await select.isVisible().catch(() => false)) {
      await this.closeSiteDropdown(select);
    }
  }

  private async closeSiteDropdown(select: Locator): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const isExpanded = (await select.getAttribute('aria-expanded').catch(() => null)) === 'true';
      const visibleOptions = await this.page.getByRole('option').filter({ visible: true }).count().catch(() => 0);
      if (!isExpanded && visibleOptions === 0) return;

      await this.page.keyboard.press('Escape').catch(() => undefined);
      await this.page.mouse.click(5, 5).catch(() => undefined);
      await this.page.waitForTimeout(250);
    }

    logger.warn('Boiler Site dropdown did not report closed after selection; continuing with selected value', {
      module: 'BoilersPage'
    });
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private normalizeSiteName(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

}
