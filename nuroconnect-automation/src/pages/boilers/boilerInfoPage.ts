import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/basePage';
import { logger } from '../../utils/logger';

type BoilerInfoLabel = 'Model' | 'Site' | 'Mode' | 'State' | 'Status' | 'Brand' | 'Updated';
type ReadOnlyBoilerInfoField = { label: string; displayedValue: string };
type SetpointBoilerInfoField = ReadOnlyBoilerInfoField & { payloadPropertyKey: string };

export class BoilerInfoPage extends BasePage {
  private readonly summaryPanel: Locator = this.page
    .locator('div')
    .filter({ hasText: /Site\s*:/i })
    .filter({ hasText: /State\s*:/i })
    .filter({ hasText: /Status\s*:/i })
    .filter({ hasText: /Brand\s*:/i })
    .filter({ hasText: /Updated\s*:/i })
    .last();

  async openBoilerInfo(nuro: string): Promise<void> {
    logger.step('Verifying Boiler Info page is open', { module: 'BoilerInfoPage', nuro });
    await this.page.waitForURL(/#!\/boiler-details\//i, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await expect(this.summaryPanel).toBeVisible();
    await expect(this.summaryPanel.getByText(nuro, { exact: true }).first()).toBeVisible();
  }

  async getBoilerInfoValue(label: BoilerInfoLabel): Promise<string> {
    const text = (await this.summaryPanel.innerText()).replace(/\s+/g, ' ').trim();
    const labels: BoilerInfoLabel[] = ['Model', 'Site', 'Mode', 'State', 'Status', 'Brand', 'Updated'];
    const followingLabels = labels.filter((candidate) => candidate !== label).join('|');
    const match = text.match(new RegExp(`${label}\\s*:\\s*(.*?)(?=\\s+(?:${followingLabels})\\s*:|$)`, 'i'));
    if (!match) {
      throw new Error(`Boiler Info value is missing for label: ${label}`);
    }
    return match[1].trim();
  }

  async verifyNuroNumber(expectedNuro: string): Promise<void> {
    logger.step('Verifying Boiler Nuro number', { module: 'BoilerInfoPage', nuro: expectedNuro });
    await expect(this.summaryPanel.getByText(expectedNuro, { exact: true }).first()).toBeVisible();
  }

  async verifyBoilerSite(expectedSite: string): Promise<void> {
    await this.verifyInfoValueContains('Site', expectedSite);
  }

  async verifyBoilerMode(expectedMode?: string): Promise<void> {
    if (!expectedMode) {
      logger.warn('Boiler Mode validation skipped because its mapping is under development', { module: 'BoilerInfoPage' });
      return;
    }
    await this.verifyInfoValueContains('Mode', expectedMode);
  }

  async verifyBoilerState(expectedState: string): Promise<void> {
    await this.verifyInfoValueContains('State', expectedState);
  }

  async verifyBoilerStatus(expectedStatus: string): Promise<void> {
    await this.verifyInfoValueContains('Status', expectedStatus);
  }

  async verifyErrorCodeBanner(errorCode: number, expectedErrorName: string): Promise<void> {
    logger.step('Verifying Boiler Error Code banner', {
      module: 'BoilerInfoPage',
      errorCode,
      expectedErrorName
    });
    const banner = this.page
      .getByText(new RegExp(`Error\\s+Code\\s+${errorCode}\\s*:\\s*${this.escapeRegExp(expectedErrorName)}`, 'i'))
      .filter({ visible: true })
      .first();
    await banner.scrollIntoViewIfNeeded();
    await expect(banner, `Error Code ${errorCode} should display ${expectedErrorName}`).toBeVisible();
    await this.verifyContainerReadOnly(banner.locator('xpath=..'), `Error Code ${errorCode}`);
  }

  async verifyErrorCodeBannerHidden(): Promise<void> {
    logger.step('Verifying Boiler Error Code banner is hidden', { module: 'BoilerInfoPage' });
    await expect(this.page.getByText(/Error\s+Code\s+\d+\s*:/i).filter({ visible: true })).toHaveCount(0);
  }

  async verifyBoilerBrand(expectedBrand: string): Promise<void> {
    await this.verifyInfoValueContains('Brand', expectedBrand);
  }

  async verifyUpdatedTimeFormat(): Promise<void> {
    logger.step('Verifying Boiler Updated relative time', { module: 'BoilerInfoPage' });
    const updated = await this.getBoilerInfoValue('Updated');
    expect(updated).toMatch(/^(?:a few|one|a|an|\d+)\s+(?:seconds?|minutes?)\s+ago$/i);
  }

  async verifyModelPlaceholderOnly(): Promise<void> {
    const model = await this.getBoilerInfoValue('Model').catch(() => '');
    logger.warn('Boiler Model validation is currently informational only', {
      module: 'BoilerInfoPage',
      model: model || 'unavailable'
    });
  }

  async verifyDeviceInfoReadOnlyIfApplicable(): Promise<void> {
    const visibleInputs = this.summaryPanel.locator('input:visible, select:visible, textarea:visible');
    const count = await visibleInputs.count();
    for (let index = 0; index < count; index += 1) {
      const control = visibleInputs.nth(index);
      await expect
        .poll(() =>
          control.evaluate((element) => {
            const input = element as HTMLInputElement;
            return input.disabled || input.readOnly || element.getAttribute('aria-disabled') === 'true';
          })
        )
        .toBe(true);
    }
  }

  async verifyReadOnlyBoilerInfoValues(fields: ReadOnlyBoilerInfoField[]): Promise<void> {
    for (const field of fields) {
      logger.step('Verifying read-only Boiler Info value', {
        module: 'BoilerInfoPage',
        label: field.label,
        expectedValue: field.displayedValue
      });
      const label = this.page.getByText(field.label, { exact: true }).filter({ visible: true }).first();
      await label.scrollIntoViewIfNeeded();
      await expect(label).toBeVisible();

      const row = await this.closestContainerWithValue(label, field.displayedValue);
      await expect(row, `${field.label} should display ${field.displayedValue}`).toContainText(field.displayedValue);
      await this.verifyContainerReadOnly(row, field.label);
    }
  }

  async verifyNoTemperatureSensorEditActions(fields: ReadOnlyBoilerInfoField[]): Promise<void> {
    await this.verifyNoReadOnlyInfoEditActions(fields);
  }

  async verifyNoReadOnlyInfoEditActions(fields: ReadOnlyBoilerInfoField[]): Promise<void> {
    for (const field of fields) {
      const label = this.page.getByText(field.label, { exact: true }).filter({ visible: true }).first();
      const row = await this.closestContainerWithValue(label, field.displayedValue);
      await expect(row.getByRole('button', { name: /edit|save/i })).toHaveCount(0);
      await expect(row.getByRole('link', { name: /edit|save/i })).toHaveCount(0);
    }
  }

  async verifySetpointProperties(fields: SetpointBoilerInfoField[], writable: boolean): Promise<void> {
    for (const field of fields) {
      logger.step('Verifying Boiler Setpoint Property', {
        module: 'BoilerInfoPage',
        label: field.label,
        expectedValue: field.displayedValue,
        writable
      });
      const label = this.page.getByText(field.label, { exact: true }).filter({ visible: true }).first();
      await label.scrollIntoViewIfNeeded();
      const row = await this.closestContainerWithValue(label, field.displayedValue);
      await expect(row, `${field.label} should display ${field.displayedValue}`).toContainText(field.displayedValue);

      const slider = this.page
        .locator(`md-slider[ng-model="vm.boilerRecord.writeableData.${field.payloadPropertyKey}"]`)
        .first();
      if (writable) {
        await slider.scrollIntoViewIfNeeded();
        await expect(slider, `${field.label} should expose a writable slider`).toBeVisible();
        await this.verifySliderAcceptsInput(slider, field.label);
      } else {
        await expect(slider, `${field.label} writable slider should be hidden`).toBeHidden();
      }
    }
  }

  private async verifySliderAcceptsInput(slider: Locator, label: string): Promise<void> {
    await expect
      .poll(
        () =>
          slider.evaluate(
            (element) =>
              element.getAttribute('aria-disabled') !== 'true' &&
              !element.hasAttribute('disabled') &&
              !element.classList.contains('md-disabled')
          ),
        { message: `${label} slider should be enabled` }
      )
      .toBe(true);

    const originalValue = await slider.getAttribute('aria-valuenow');
    const minimumValue = await slider.getAttribute('aria-valuemin');
    const maximumValue = await slider.getAttribute('aria-valuemax');
    const box = await slider.boundingBox();
    if (originalValue === null || minimumValue === null || maximumValue === null || !box) {
      throw new Error(`${label} slider does not expose its range or visible track.`);
    }

    const minimum = Number(minimumValue);
    const maximum = Number(maximumValue);
    const originalRatio = (Number(originalValue) - minimum) / (maximum - minimum);
    const changedRatio = originalRatio < 0.5 ? 0.75 : 0.25;
    await slider.click({ position: { x: box.width * changedRatio, y: box.height / 2 } });
    await expect
      .poll(() => slider.getAttribute('aria-valuenow'), {
        message: `${label} slider should accept a value change`
      })
      .not.toBe(originalValue);

    await slider.click({ position: { x: box.width * originalRatio, y: box.height / 2 } });
  }

  private async verifyInfoValueContains(label: BoilerInfoLabel, expectedValue: string): Promise<void> {
    logger.step(`Verifying Boiler ${label}`, { module: 'BoilerInfoPage', expectedValue });
    await expect
      .poll(() => this.getBoilerInfoValue(label), {
        message: `Boiler ${label} should display ${expectedValue}`,
        timeout: 20_000
      })
      .toContain(expectedValue);
  }

  private async closestContainerWithValue(label: Locator, expectedValue: string): Promise<Locator> {
    const buttonRow = label.locator('xpath=ancestor::button[1]');
    if (await buttonRow.count()) {
      return buttonRow;
    }

    const normalizedExpected = this.normalizeDisplayedText(expectedValue);
    let container = label.locator('xpath=..');
    for (let depth = 0; depth < 5; depth += 1) {
      const text = await container.innerText().catch(() => '');
      if (this.normalizeDisplayedText(text).includes(normalizedExpected)) {
        return container;
      }
      container = container.locator('xpath=..');
    }
    throw new Error(`Unable to find Boiler Info row for ${await label.innerText()} with value ${expectedValue}.`);
  }

  private normalizeDisplayedText(value: string): string {
    return value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async verifyContainerReadOnly(container: Locator, label: string): Promise<void> {
    const editableControls = container.locator(
      'input:visible:not([readonly]):not([disabled]), textarea:visible:not([readonly]):not([disabled]), ' +
        'select:visible:not([disabled]), [contenteditable="true"]:visible'
    );
    await expect(editableControls, `${label} should not expose an editable control`).toHaveCount(0);
  }
}
