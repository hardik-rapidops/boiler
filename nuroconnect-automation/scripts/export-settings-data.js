const fs = require('node:fs');
const path = require('node:path');
const { chromium, request } = require('@playwright/test');
const dotenv = require('dotenv');

const envName = process.env.TEST_ENV === 'prod' ? 'prod' : 'dev';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${envName}`), override: true });

const baseUrl = required('BASE_URL');
const boilerSettingsConfig = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'test-data/settings/boiler-settings-config.json'), 'utf-8')
);
const boilerUpdatePayloadReference = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'test-data/boilers/boiler-update-payload-reference.json'), 'utf-8')
).properties;
const settingsIndex = process.env.SETTINGS_INDEX || '0';
const exportName = process.env.SETTINGS_EXPORT_NAME;
const outputDir = path.resolve(process.cwd(), 'exports', 'settings');
const combinedSettingsFile = path.resolve(process.cwd(), 'test-data', 'settings', 'boiler-settings-data.json');
const boilerTypeSettings = Object.entries(boilerSettingsConfig.boilerTypes).map(([key, value]) => ({
  key,
  settingsIndex: value.settingsIndex
}));
const tabsToExport = [
  'Error Codes',
  'State codes',
  'Status codes',
  'User title',
  'Service reps',
  'Relay text',
  'Active Mode Demand'
];
const tabKeys = {
  'Error Codes': 'errorCodes',
  'State codes': 'stateCodes',
  'Status codes': 'statusCodes',
  'User title': 'userTitles',
  'Service reps': 'serviceReps',
  'Relay text': 'relayText',
  'Active Mode Demand': 'activeModeDemand'
};
const fallbackHeaders = {
  'Error Codes': ['Error Number', 'Error Name', 'Description'],
  'State codes': ['Number', 'Name'],
  'Status codes': ['Number', 'Name'],
  'User title': ['Number', 'Title Name'],
  'Relay text': ['Relay', 'Number', 'Name'],
  'Active Mode Demand': ['Number', 'Name']
};

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function uniqueNuro() {
  const hex = '0123456789ABCDEF';
  const segments = Array.from({ length: 3 }, () =>
    Array.from({ length: 2 }, () => hex[Math.floor(Math.random() * hex.length)]).join('')
  );
  return ['00', '0D', 'E1', ...segments].join(':');
}

function uniqueSola() {
  return `${Math.floor(10000000 + Math.random() * 89999999)}`;
}

async function login(requestContext) {
  const response = await requestContext.post('/simulator/login', {
    data: {
      email: required('PKADMIN_USERNAME'),
      password: required('PKADMIN_PASSWORD')
    }
  });

  if (!response.ok()) {
    throw new Error(`PKAdmin API login failed: ${response.status()} ${response.statusText()}`);
  }

  const session = await response.json();
  if (!session.id || !session.userId) {
    throw new Error('Login response did not include id token and userId.');
  }

  return session;
}

async function currentUser(requestContext, session) {
  const response = await requestContext.get(`/api/users/${session.userId}`, {
    headers: noCacheHeaders(session.id),
    params: {
      filter: JSON.stringify({ include: ['roles', 'devices'] }),
      cacheBust: Date.now().toString()
    }
  });

  if (!response.ok()) {
    throw new Error(`Current user API failed: ${response.status()} ${response.statusText()}`);
  }

  return response.json();
}

async function registerAndUpdateSimulator(requestContext, token) {
  const simulatorHeaders = {
    ...noCacheHeaders(token),
    Authorization: `Bearer ${token}`
  };
  const registrationPayload = {
    sola: uniqueSola(),
    nuro: uniqueNuro(),
    base_url: baseUrl
  };

  const registerResponse = await requestContext.post('/simulator/register', {
    data: registrationPayload,
    headers: simulatorHeaders
  });

  if (!registerResponse.ok()) {
    throw new Error(`Simulator register failed: ${registerResponse.status()} ${registerResponse.statusText()}`);
  }

  const registration = await registerResponse.json();
  const software = boilerSettingsConfig.scenarioSoftwareVersions.pkAdmin;
  const softwarePrefix = Object.keys(boilerSettingsConfig.softwareVersionPrefixes).find((prefix) =>
    software.toUpperCase().startsWith(prefix.toUpperCase())
  );
  const boilerType = softwarePrefix && boilerSettingsConfig.softwareVersionPrefixes[softwarePrefix];
  const cascade = boilerType && boilerSettingsConfig.boilerTypes[boilerType]?.updateData?.cascade;
  if (!Number.isInteger(cascade)) {
    throw new Error(`Cascade is not configured for software version ${software}.`);
  }
  const updatePayload = {
    base_url: baseUrl,
    key: registration.uniqueKey,
    data: {
      ...boilerUpdatePayloadReference,
      sola: registrationPayload.sola,
      nuro: registrationPayload.nuro,
      software,
      cascade,
      activedemand: Number(boilerSettingsConfig.updateSettings.activeModeDemand),
      state: Number(boilerSettingsConfig.updateSettings.stateCode),
      status: Number(boilerSettingsConfig.updateSettings.statusCode),
      errorcode: Number(boilerSettingsConfig.updateSettings.errorCode),
      relayassignmenta: Number(boilerSettingsConfig.updateSettings.relayAssignments[0]),
      relayassignmentb: Number(boilerSettingsConfig.updateSettings.relayAssignments[1]),
      relayassignmentc: Number(boilerSettingsConfig.updateSettings.relayAssignments[2]),
      relayassignmentd: Number(boilerSettingsConfig.updateSettings.relayAssignments[3])
    }
  };

  const updateResponse = await requestContext.post('/simulator/fullupdate', {
    data: updatePayload,
    headers: simulatorHeaders
  });

  if (!updateResponse.ok()) {
    throw new Error(`Simulator update failed: ${updateResponse.status()} ${updateResponse.statusText()}`);
  }

  return {
    registerPayload: registrationPayload,
    registerResponse: registration,
    updatePayload,
    updateResponse: await updateResponse.json().catch(() => ({}))
  };
}

function noCacheHeaders(token) {
  return {
    Authorization: token,
    'Cache-Control': 'no-cache, no-store',
    Pragma: 'no-cache'
  };
}

function storageState(session, userData) {
  const origin = new URL(baseUrl).origin;
  return {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          { name: 'accessToken', value: session.id },
          { name: 'userId', value: session.userId },
          { name: 'role', value: 'pkAdmin' },
          { name: 'authSession', value: JSON.stringify({ roleKey: 'pkAdmin', token: session.id, userId: session.userId, ttl: session.ttl, created: session.created }) },
          { name: 'user-data', value: JSON.stringify(userData) },
          { name: '$LoopBack$accessTokenId', value: session.id },
          { name: '$LoopBack$currentUserId', value: session.userId },
          { name: '$LoopBack$rememberMe', value: 'true' }
        ]
      }
    ]
  };
}

async function openTab(page, tabName) {
  const exactText = new RegExp(`^\\s*${escapeRegExp(tabName)}\\s*$`, 'i');
  const tab = page
    .getByRole('tab', { name: exactText })
    .or(page.getByRole('link', { name: exactText }))
    .or(page.getByRole('button', { name: exactText }))
    .or(page.locator('md-tab-item, md-tab, a, button, md-button').filter({ hasText: exactText }))
    .first();

  await tab.click();
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  await page.waitForTimeout(750);
}

async function extractVisibleSettingsData(page, tabName) {
  return page.evaluate((activeTabName) => {
    const visible = (element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };

    const normalize = (value) => value.replace(/\s+/g, ' ').trim();
    const activePanels = Array.from(document.querySelectorAll('md-tab-content.md-active, md-tab-content[class*="md-active"]'))
      .filter(visible);
    const main =
      activePanels[activePanels.length - 1] ||
      document.querySelector('main') ||
      document.body;

    const tables = Array.from(main.querySelectorAll('table'))
      .filter(visible)
      .map((table) => {
        const headers = Array.from(table.querySelectorAll('thead th, tr:first-child th, tr:first-child td')).map((cell) =>
          normalize(cell.textContent || '')
        );
        const bodyRows = table.querySelectorAll('tbody tr').length
          ? Array.from(table.querySelectorAll('tbody tr'))
          : Array.from(table.querySelectorAll('tr')).slice(1);
        const rows = bodyRows
          .filter(visible)
          .map((row) => {
            const values = Array.from(row.querySelectorAll('td, th')).map((cell) => normalize(cell.textContent || ''));
            return headers.length && headers.length === values.length
              ? Object.fromEntries(headers.map((header, index) => [header || `Column ${index + 1}`, values[index]]))
              : values;
          })
          .filter((row) => Array.isArray(row) ? row.some(Boolean) : Object.values(row).some(Boolean));
        return { headers, rows };
      })
      .filter((table) => table.rows.length);

    const listItems = Array.from(
      main.querySelectorAll('md-list-item, li, [ng-repeat], [ng-repeat-start], .layout-row, [layout="row"]')
    )
      .filter(visible)
      .map((item) => normalize(item.textContent || ''))
      .filter((item) => item && !/^(save|cancel|file upload|search)$/i.test(item));

    const fields = Array.from(main.querySelectorAll('input, textarea, md-select, select'))
      .filter(visible)
      .map((field) => {
        const id = field.getAttribute('id');
        const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
        const ariaLabel = field.getAttribute('aria-label');
        const model = field.getAttribute('ng-model');
        const placeholder = field.getAttribute('placeholder');
        const selectedText = field.tagName.toLowerCase() === 'md-select' ? normalize(field.textContent || '') : '';
        return {
          label: normalize(label?.textContent || ariaLabel || placeholder || model || field.getAttribute('name') || ''),
          value: field.value || field.getAttribute('value') || selectedText
        };
      })
      .filter((field) => field.label || field.value);

    const visibleText = normalize(main.textContent || '');

    return {
      tab: activeTabName,
      exportedAt: new Date().toISOString(),
      tables,
      listItems: Array.from(new Set(listItems)),
      fields,
      visibleText
    };
  }, tabName);
}

function normalizeTabData(tabData) {
  const primaryTableRows = tabData.tables[0]?.rows ?? [];
  if (primaryTableRows.length) {
    const scrapedHeaders = tabData.tables[0]?.headers ?? [];
    const firstRow = primaryTableRows[0];
    const fallback = fallbackHeaders[tabData.tab];
    const headers =
      Array.isArray(firstRow) && scrapedHeaders.length === firstRow.length
        ? scrapedHeaders
        : fallback;
    return primaryTableRows.map((row) => {
      if (!Array.isArray(row)) {
        return row;
      }

      if (!headers?.length || headers.length !== row.length) {
        return Object.fromEntries(row.map((value, index) => [`Column ${index + 1}`, value]));
      }

      return Object.fromEntries(headers.map((header, index) => [header, row[index]]));
    });
  }

  if (tabData.fields.length) {
    return tabData.fields;
  }

  return tabData.listItems.map((value) => ({ value }));
}

function normalizeSettingsTabs(settingsTabs) {
  return settingsTabs.reduce((acc, tabData) => {
    acc[tabKeys[tabData.tab]] = normalizeTabData(tabData);
    return acc;
  }, {
    errorCodes: [],
    stateCodes: [],
    statusCodes: [],
    userTitles: [],
    serviceReps: [],
    relayText: [],
    activeModeDemand: []
  });
}

async function extractSettingsTabs(page, targetSettingsIndex) {
  const settingsTabs = [];
  await page.goto(`/#!/settings/${targetSettingsIndex}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page
    .locator('md-tab-item, md-tab, a, button, md-button')
    .filter({ hasText: /Error Codes|State codes|Status codes|User title|Service reps|Relay text|Active Mode Demand/i })
    .first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  for (const tab of tabsToExport) {
    await openTab(page, tab);
    settingsTabs.push(await extractVisibleSettingsData(page, tab));
  }
  return settingsTabs;
}

function flattenForCsv(exportData) {
  const rows = [];
  for (const tabData of exportData.settingsTabs) {
    for (const [tableIndex, table] of tabData.tables.entries()) {
      for (const [rowIndex, row] of table.rows.entries()) {
        rows.push({
          tab: tabData.tab,
          source: `table-${tableIndex + 1}`,
          row: rowIndex + 1,
          data: JSON.stringify(row)
        });
      }
    }

    for (const [index, item] of tabData.listItems.entries()) {
      rows.push({
        tab: tabData.tab,
        source: 'list-item',
        row: index + 1,
        data: item
      });
    }

    for (const [index, field] of tabData.fields.entries()) {
      rows.push({
        tab: tabData.tab,
        source: 'field',
        row: index + 1,
        data: JSON.stringify(field)
      });
    }
  }
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function writeOutputs(data) {
  fs.mkdirSync(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFileName = exportName ? exportName.replace(/[<>:"/\\|?*]/g, '-') : `settings-export-${stamp}`;
  const jsonFile = path.join(outputDir, `${baseFileName}.json`);
  const csvFile = path.join(outputDir, `${baseFileName}.csv`);

  fs.writeFileSync(jsonFile, `${JSON.stringify(data, null, 2)}\n`);

  const csvRows = flattenForCsv(data);
  const header = ['tab', 'source', 'row', 'data'];
  const csv = [
    header.join(','),
    ...csvRows.map((row) => header.map((column) => csvEscape(row[column])).join(','))
  ].join('\n');
  fs.writeFileSync(csvFile, `${csv}\n`);

  return { jsonFile, csvFile };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function main() {
  const requestContext = await request.newContext({ baseURL: baseUrl });
  const session = await login(requestContext);
  const userData = await currentUser(requestContext, session);
  await registerAndUpdateSimulator(requestContext, session.id);

  const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
  const context = await browser.newContext({
    baseURL: baseUrl,
    storageState: storageState(session, userData)
  });
  const page = await context.newPage();

  try {
    if (process.env.EXPORT_COMBINED_BOILER_SETTINGS === 'true') {
      const combinedSettings = {};
      for (const boilerType of boilerTypeSettings) {
        const settingsTabs = await extractSettingsTabs(page, boilerType.settingsIndex);
        combinedSettings[boilerType.key] = normalizeSettingsTabs(settingsTabs);
      }

      fs.mkdirSync(path.dirname(combinedSettingsFile), { recursive: true });
      fs.writeFileSync(combinedSettingsFile, `${JSON.stringify(combinedSettings, null, 2)}\n`);
      console.log(`Combined Boiler settings JSON exported: ${combinedSettingsFile}`);
      return;
    }

    var settingsTabs = await extractSettingsTabs(page, settingsIndex);
  } finally {
    await context.close();
    await browser.close();
    await requestContext.dispose();
  }

  const output = writeOutputs({
    environment: envName,
    baseUrl,
    settingsUrl: `${baseUrl}/#!/settings/${settingsIndex}`,
    exportedAt: new Date().toISOString(),
    skippedTabs: ['Boiler Model', 'Boiler Images'],
    settingsTabs
  });

  console.log(`Settings JSON exported: ${output.jsonFile}`);
  console.log(`Settings CSV exported: ${output.csvFile}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const sanitized = message
    .replace(/(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;"']+/gi, '$1[REDACTED]')
    .replace(/("(?:id|token|accessToken|uniqueKey|password|key)"\s*:\s*")[^"]+/gi, '$1[REDACTED]');
  console.error(sanitized);
  process.exit(1);
});
