# NuroConnect Automation

Playwright TypeScript framework using Page Object Model for role-based NuroConnect automation.

Site Management is Phase 1 and acts as the prerequisite module. Boiler Management is Phase 2 and consumes Site Name and Site ID values created by Phase 1.

## Execution

```bash
npm install
npm run test:flow:dev
npm run test:flow:prod
```

The ordered flow project runs:

1. site creation
2. site invitation / assignment
3. site search
4. boiler creation
5. site update
6. boiler info
7. site unassignment

The `scripts/run-ordered-flow.js` runner enforces the full sequence without importing specs or using Playwright project dependencies. It records a project's failures and continues with every remaining project. Module-only scripts continue to use the projects in `playwright.config.ts` with `--no-deps`.

Run the ordered dev flow with `npm run test:flow` or `npm run test:flow:dev`. Site Creation, Site Search, and Boiler Info may use their configured worker pools. State-changing modules use one worker and execute tests in declaration order. A failed test is reported but does not skip the remaining tests or later modules. At completion, blob results are merged into HTML, JUnit, and Allure results, and totals are written to `reports/execution-summary.json`.

## Environment Files

Populate `.env.dev` and `.env.prod` with each environment URL and role credentials. Empty required values fail fast before tests start.

Runtime site data is written to `src/runtime/runtime-data.json` only after site creation and is removed by the final delete suite.

Each Playwright execution clears all files under `logs/` once during global setup before workers start.

Phase 1 site creation should capture reusable Site Name and Site ID values. Future Boiler Management tests should consume those values as prerequisite data for Boiler creation instead of duplicating site setup.

Boiler Creation uses the simulator Register and Update APIs before entering the generated boiler code in the UI. Runtime boiler data stores Boiler Name, Boiler ID when available, selected Site Name/Site ID, Sola, Nuro, Register Code, Unique Key, creator role, description, and boiler type.

The Site Invitation spec depends on the Site Creation runtime data. It invites the configured Site Manager, Site Supervisor, and Site User account emails from `.env`, stores invited and assigned roles under the matching creator site, verifies each email in Access Control, and verifies each assigned Site through a fresh assignee session.

Assigned-role invitation permission tests use the configured Site Manager, Site Supervisor, and Site User credentials from `.env`. Site Manager reuses the Supervisor email previously invited by PKTech; Site Supervisor and Site User must not see the Access Control `+` invite button.

The separate Site Unassignment spec runs after Site Update. It first verifies that Site Supervisor and Site User cannot remove users. Site Manager then removes the Manager-invited Supervisor before PKAdmin removes the Manager, followed by PKTech and PKRep owner removals. Every removal is verified from a fresh API-authenticated removed-user session.

The Site Search spec runs after Site Invitation because restricted-role search checks use assigned Site runtime data. It verifies PKAdmin and PKTech can search all Sites created by PKAdmin, PKTech, and PKRep. It also verifies PKRep, Site Manager, Site Supervisor, and Site User can see only own or directly assigned Sites and cannot see Sites assigned to other users where they are not part of Access Control.

To run only Site Search tests:

```bash
npm run test:site:search
npx playwright test tests/site-management/site-search.spec.ts
```

The Site Update spec contains update test cases only. It updates creator-owned Sites for PKAdmin, PKTech, and PKRep, validates successful assigned-site updates for Site Manager and Site Supervisor, and validates that Site User cannot update assigned Site fields. It uses runtime prerequisite data and must not import, call, or execute Site Creation, Search, or Invitation specs.

To run only Boiler Creation tests:

```bash
npm run test:boiler:creation
npx playwright test tests/boiler-management/boiler-creation.spec.ts
```

To run Boiler Info validation after Boiler Creation runtime data exists:

```bash
npm run test:boiler:info
npx playwright test tests/boiler-management/boiler-info.spec.ts --project=boiler-info --no-deps
```

Boiler Info includes configured-brand summary checks and reference-driven read-only Temperature Sensor checks. Run the full ordered flow when stored simulator registration keys are no longer valid.

To run only Site Update tests:

```bash
npm run test:site:update
npx playwright test tests/site-management/site-update.spec.ts
```

## Allure Report

Every test run records video and writes Allure results automatically. After execution, generate and serve the report:

```bash
npm run report:allure
```

Open `http://localhost:5050` in the browser. Do not open `reports/allure-report/index.html` directly with a `file://` URL because browser security prevents Allure from fetching its JSON data.

Recorded videos are promoted to the test-level **Attachments** section when the Allure report is generated.

To generate and open in separate commands:

```bash
npm run report:allure:generate
npm run report:allure:open
```

For a temporary generated report served directly from the results:

```bash
npm run report:allure:serve
```
