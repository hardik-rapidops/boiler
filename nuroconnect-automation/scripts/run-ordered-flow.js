const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const playwrightCli = path.join(root, 'node_modules', '@playwright', 'test', 'cli.js');
const flow = [
  { project: 'site-creation', workers: 3 },
  { project: 'site-invitation', workers: 1 },
  { project: 'site-search', workers: 3 },
  { project: 'boiler-creation', workers: 1 },
  { project: 'boiler-info', workers: 1 },
  { project: 'site-update', workers: 1 },
  { project: 'site-unassignment', workers: 1 }
];
const selectedProjects = process.env.FLOW_ONLY
  ? new Set(process.env.FLOW_ONLY.split(',').map((value) => value.trim()).filter(Boolean))
  : undefined;
const selectedFlow = selectedProjects ? flow.filter((item) => selectedProjects.has(item.project)) : flow;

function resetOutput() {
  for (const relativePath of [
    'reports/blob',
    'reports/json',
    'reports/html',
    'reports/junit',
    'reports/allure-results',
    'test-results'
  ]) {
    fs.rmSync(path.join(root, relativePath), { recursive: true, force: true });
  }
}

function countJsonReport(file) {
  if (!fs.existsSync(file)) return { total: 0, passed: 0, failed: 0, skipped: 0 };
  const report = JSON.parse(fs.readFileSync(file, 'utf8'));
  const counts = { total: 0, passed: 0, failed: 0, skipped: 0 };

  function visit(suites = []) {
    for (const suite of suites) {
      for (const spec of suite.specs ?? []) {
        for (const test of spec.tests ?? []) {
          counts.total += 1;
          const finalResult = test.results?.at(-1)?.status;
          if (test.status === 'skipped' || finalResult === 'skipped') counts.skipped += 1;
          else if (test.status === 'expected' && finalResult === 'passed') counts.passed += 1;
          else counts.failed += 1;
        }
      }
      visit(suite.suites);
    }
  }

  visit(report.suites);
  return counts;
}

function runPlaywright(args, env) {
  return spawnSync(process.execPath, [playwrightCli, ...args], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  });
}

resetOutput();
const startedAt = Date.now();
const summary = { total: 0, passed: 0, failed: 0, skipped: 0 };
const moduleResults = [];

for (const [index, item] of selectedFlow.entries()) {
  const flowIndex = String(index + 1).padStart(2, '0');
  const artifactId = `${flowIndex}-${item.project}`;
  process.stdout.write(`\n${'='.repeat(90)}\n`);
  process.stdout.write(`FLOW ${index + 1}/${selectedFlow.length}: ${item.project}\n`);
  process.stdout.write(`${'='.repeat(90)}\n`);

  const testArgs = [
      'test',
      '--config=playwright.config.ts',
      `--project=${item.project}`,
      '--no-deps',
      `--workers=${item.workers}`
    ];
  if (process.env.FLOW_GREP) testArgs.push('--grep', process.env.FLOW_GREP);
  const result = runPlaywright(
    testArgs,
    {
      ORDERED_FLOW: 'true',
      FLOW_INDEX: flowIndex,
      FLOW_PROJECT: item.project,
      PRESERVE_LOGS: index === 0 ? 'false' : 'true'
    }
  );

  const counts = countJsonReport(path.join(root, 'reports', 'json', `${artifactId}.json`));
  for (const key of Object.keys(summary)) summary[key] += counts[key];
  moduleResults.push({ project: item.project, exitCode: result.status ?? 1, ...counts });

  // After site-creation, wait for sites to propagate to all API endpoints
  // (Newly created sites need time to appear in dropdown APIs used by boiler-creation)
  if (item.project === 'site-creation') {
    const propagationDelaySeconds = 10;
    process.stdout.write(`\nWaiting ${propagationDelaySeconds}s for sites to propagate to all APIs...\n`);
    const waitStart = Date.now();
    while (Date.now() - waitStart < propagationDelaySeconds * 1000) {
      // Busy wait to block execution
    }
    process.stdout.write(`Site propagation delay complete.\n`);
  }
}

const blobDir = path.join(root, 'reports', 'blob');
if (fs.existsSync(blobDir) && fs.readdirSync(blobDir).some((file) => file.endsWith('.zip'))) {
  runPlaywright(['merge-reports', '--config=playwright.config.ts', 'reports/blob'], {
    MERGE_REPORTS: 'true',
    PRESERVE_LOGS: 'true'
  });
}

const durationMs = Date.now() - startedAt;
const executionSummary = {
  ...summary,
  durationMs,
  duration: `${(durationMs / 1000).toFixed(1)} seconds`,
  modules: moduleResults
};
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'reports', 'execution-summary.json'),
  `${JSON.stringify(executionSummary, null, 2)}\n`
);

process.stdout.write(`\n${'='.repeat(90)}\n`);
process.stdout.write('COMPLETE EXECUTION SUMMARY\n');
process.stdout.write(`${'='.repeat(90)}\n`);
process.stdout.write(`Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Skipped: ${summary.skipped}\n`);
process.stdout.write(`Duration: ${(durationMs / 1000).toFixed(1)} seconds\n`);
for (const moduleResult of moduleResults) {
  process.stdout.write(
    `${moduleResult.project}: ${moduleResult.passed} passed, ${moduleResult.failed} failed, ${moduleResult.skipped} skipped\n`
  );
}

process.exitCode = moduleResults.some((result) => result.exitCode !== 0 || result.failed > 0) ? 1 : 0;
