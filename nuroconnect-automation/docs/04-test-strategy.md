# Test Strategy

## Layers

- Page objects own UI interaction and locator fallback behavior.
- Fixtures compose API-authenticated pages, role credentials, POMs, and runtime data access.
- Tests express business behavior and access rules.
- Runtime data manager stores only flow state required by downstream suites and future module prerequisites.
- Logger utility captures structured system, test, error, API, and step/action logs across shared framework layers.

## Framework Architecture

The framework is organized as a multi-phase Playwright + TypeScript automation framework.

- Phase 1 is Site Management only.
- Site Management is the prerequisite module for future automation.
- Phase 2 adds Boiler Management after Site Management prerequisite data is available.
- Shared code must be module-neutral wherever practical: fixtures, auth helpers, API clients, runtime data manager, cleanup utilities, factories, and base page behavior should not be tightly coupled to Site Management.
- Feature-specific page objects and tests should live in module-specific folders so Boiler Management can be added without restructuring Phase 1.

## API-Only Authentication

Login must be performed through the login API only. UI-based login should not be used in any automation flow.

Login request payload:

```json
{
  "email": "emailaddress",
  "password": "password"
}
```

Expected login response:

```json
{
  "id": "",
  "ttl": 1209600,
  "created": "2026-06-18T18:01:35.320Z",
  "userId": ""
}
```

The `id` value is the token used for authenticated API requests and session bootstrapping. Fixtures should create authenticated browser state from the token instead of interacting with login screens.

## Cache-Sensitive Role Validation

When a new user is added or an existing user is updated with any role, tests must verify that latest user, role, and permission data is used immediately. Permission assertions should fetch or force-refresh the latest API response and must not rely on cached user data, cached role data, or stale permissions.

For invitation scenarios, tests must verify the invited user from the current Access Control list after the invite completes. The invitation success message is necessary but not sufficient by itself.

After every assignment, the framework creates a new API-authenticated browser context for the assignee. Session setup cache-busts the current-user API request and includes current roles and devices before Site visibility is asserted.

Assigned-role invitation permission tests must verify the current Access Control UI after API-authenticated login. Site Manager should see an enabled `+` invite control; Site Supervisor and Site User should not see the `+` invite control.

Site Update runs while assignment data is still active, but the Site Update spec should contain update test cases only. Owner updates run first, followed by successful assigned-site updates for Site Manager and Site Supervisor. Site User negative update permission validation belongs in Site Update because it verifies assigned Site fields cannot be updated. Site Unassignment tests run afterward, verify removal restrictions, and then remove users in dependency-safe order.

## Execution Model

- Projects in `playwright.config.ts` remain independent for module-only and parallel-safe execution.
- The full regression flow is executed through `scripts/run-ordered-flow.js`; direct `npx playwright test` is reserved for explicit module/project execution and should not be used as the ordered full-flow command.
- Each spec file contains only its own scenarios and must not import, call, or execute scenarios from another spec file.
- `scripts/run-ordered-flow.js` enforces `site-creation` -> `site-invitation` -> `site-search` -> `boiler-creation` -> `boiler-info` -> `site-update` -> `site-unassignment` without spec-to-spec imports.
- The ordered runner starts each project as a separate Playwright process in the required order. A failed module is reported, and the runner continues to the next module so the final report contains all failures from the run.
- Site Creation and Site Search allow intra-project parallel execution. Boiler Creation and Boiler Info use `fullyParallel: false` with one worker to guarantee declaration order. Boiler Info must maintain declaration order because later validations reuse the latest simulator update context by Boiler type. Runtime writes and authenticated storage files are isolated or locked for safe workers.
- Every test writes a dedicated readable execution log under `logs/tests/`, containing its context, API activity, steps, errors, final status, and duration. Aggregate `test.log`, `api.log`, `error.log`, and `system.log` remain available; all logs are cleared at the start of each Playwright execution.
- Authentication secrets are redacted centrally. Login and current-user requests are excluded from Playwright instrumentation, Allure automatic action detail is disabled, and Playwright traces are disabled to prevent raw tokens, headers, payloads, responses, cookies, or browser storage from entering report artifacts. Failure screenshots and videos remain enabled.
- Site Invitation, Boiler Creation, Boiler Info, Site Update, and Site Unassignment use one worker and declaration order. They do not use Playwright serial suites, so one failed test does not skip later tests. The ordered runner starts the next module after the current process completes regardless of its exit code.
- Ordered-flow child runs write unique blob, JSON, raw test-result, trace, screenshot, and video artifacts. Blob reports are merged after the final module into complete HTML, JUnit, and Allure results. `reports/execution-summary.json` records totals, passed, failed, skipped, duration, and per-module results.
- Temporary UI display differences that must survive automatic settings export belong in configurable `displayOverrides`, not in tests or generated settings data.
- **CRITICAL:** The required business flow is strictly: `site-creation` -> `site-invitation` -> `site-search` -> `boiler-creation` -> `boiler-info` -> `site-update` -> `site-unassignment`. This order MUST be maintained in `scripts/run-ordered-flow.js`. Boiler Info MUST run before Site Update because Site Update changes site names, and Boiler Info must validate boilers with their original site configuration.
- Independent tests can run in the `chromium` project with parallel workers.
- Dependent suites call `requireCreatedSites()` and fail fast with the required error when creation data is missing.
- Site Management flow output should include Site Name and Site ID when available. These values are reusable prerequisite test data for Phase 2 Boiler creation.
- The Site Invitation spec consumes Site Creation runtime data for PKAdmin, PKTech, and PKRep created sites.
- The Site Invitation spec uses configured `.env` emails when inviting Site Manager, Site Supervisor, and Site User so later API-authenticated assigned-role tests use the same users that were invited.
- The Site Invitation spec stores invited user email and role in runtime data for later assigned-site and Boiler prerequisite flows.
- The Site Manager invitation scenario reuses the Site Supervisor email stored from the PKTech invitation; it must not generate another email.
- Assigned-role invitation permission scenarios consume both Site Creation runtime data and previous invited-user runtime data.
- The separate Site Search spec should run after Site Invitation because restricted-role search validation needs assigned-user runtime data. It must not import, call, or execute Site Creation or Site Invitation specs.
- The Boiler Creation spec should run after Site Search and consumes runtime Site Name and Site ID values. It must not create Sites or duplicate Site setup.
- The Boiler Info spec should run after Boiler Creation and before Site Update so it validates Boiler data before Site names are changed by Site Update.
- The Site Update spec consumes runtime data created by prerequisite suites but must not import, call, or execute those specs. It preserves Site ID and assignment records when runtime Site details change.
- The separate Site Unassignment spec should run after Site Update and fails fast when Site or invitation records are missing.
- API login for Site Manager, Site Supervisor, and Site User uses configured `.env` role credentials. Those accounts must represent users with access to the assigned runtime sites in the target environment.

## Logging Strategy

- Use `src/utils/logger.ts` as the single logging utility.
- Logs are written automatically to `logs/system.log`, `logs/test.log`, `logs/error.log`, and `logs/api.log`.
- The base fixture sets test-name context for every test, allowing logs from fixtures, page objects, services, and runtime utilities to include the active test title.
- Page objects log navigation, clicks, form entries, and key assertions as `STEP` logs.
- API services log request start, response status, and failures as `API` or `ERROR` logs.
- Runtime data manager logs read/write/upsert/remove operations without dumping full runtime files.
- Settings export and simulator register/update flows log start, success, and failure points.
- Sensitive data must be redacted or omitted from log metadata. Do not log passwords, tokens, authorization headers, API keys, simulator unique keys, or secrets.
- Playwright global setup clears `system.log`, `test.log`, `error.log`, and `api.log` once before every execution command. Workers must not clear logs individually because parallel workers share the same files.

## Reporting

HTML, list, JUnit, and Allure reporters are enabled. Allure raw results are written to `reports/allure-results`, and the generated report is written to `reports/allure-report`. CI should upload `reports/html`, `reports/junit`, `reports/allure-results`, and `test-results`.

Video recording is enabled for every test with Playwright `video: 'on'`. Videos are retained in `test-results` and included as test attachments in Allure results.

Allure must be viewed through its local HTTP server at `http://localhost:5050`; directly opening the generated `index.html` through `file://` is unsupported because its JSON requests are blocked by browser security.

## Automation Phases

### Phase 1: Site Management
Site Management is the initial automation phase and acts as the prerequisite module for future Boiler Management automation. Phase 1 is limited to Site Management workflows and should produce clean, reusable site data.

Covered scenarios:
- Create Site
- Invite Site Users
- Search Site
- Update Site
- Delete Site

Reusable prerequisite data:
- Site Name
- Site ID
- Invited user emails and roles when needed for access validation
- Assigned users and roles when needed for access validation

### Phase 2: Boiler Management
Boiler Management consumes Phase 1 Site Name and Site ID data instead of recreating site prerequisites inside Boiler tests.

Future scenarios:
- Create Boiler
- Search Boiler
- Boiler Information
- Boiler Details
- Boiler Alerts
- Boiler Settings

Initial Boiler Creation covers PKAdmin, PKTech, PKRep, Site Manager, Site Supervisor, and Site User permission behavior. Simulator Register and Full Update API calls are isolated in a simulator service so future simulator APIs can be added without changing test cases.

Boiler Info validation runs separately for every configured Boiler type, currently Weil-McLain and Patterson-Kelley. Each scenario searches with that type's runtime Nuro Number and opens the matching Boiler Details page. Site, State, Status, and Brand are validated against the latest Full Update payload and the configured brand-specific settings mappings. Updated is validated as relative seconds/minutes text. Mode and Model remain non-failing placeholders until their application mappings are finalized.

Temperature Sensor scenarios load `Temperature Sensors (Read-Only)` mappings from `test-data/boilers/boiler-info-reference.json`, apply the mapped decimal raw values to the Full Update payload, and compare every mapped label and displayed value on Boiler Info. The reference `return` property maps to the application's `return_` payload key. Summary and sensor scenarios independently build the same deterministic reference payload, so failure in either test does not prevent or invalidate the other.

Boiler Creation uses the same reference loader for both Weil-McLain and Patterson-Kelley Full Update requests. Creation validates the outgoing sensor fields and stores the exact payload in runtime data, preventing creation and later Boiler verification from maintaining separate expected values.

The reusable Full Update builder starts with the 41-property DOCX summary mapping. It then applies explicit scenario overrides and dynamic Register identity fields. Per-type software, brand, and cascade configuration remains authoritative where a single DOCX sample cannot represent both brands. The resulting `data` object contains the 41 mapped properties plus dynamic `sola` and `nuro`.

Boiler Info Mode validation reads `cascade` from that payload and resolves it through `getModeFromCascade()`. Cascade is configured per Boiler type in `boiler-settings-config.json`; UI assertions consume the derived expected Mode rather than hardcoded test text or Boiler Settings tables.

Boiler Info validation searches with the runtime Nuro Number and opens the matching Boiler Details page. Site, State, Status, and Brand are validated against the latest Full Update payload and the configured brand-specific settings mappings. Updated is validated as relative seconds/minutes text. Mode and Model remain non-failing placeholders until their application mappings are finalized.

### Framework Design Rule
The framework must not be designed only for Site Management.

All services, fixtures, page objects, utilities, and test data should be reusable for future Boiler Management automation.

Site data such as Site Name and Site ID should be stored and reused as prerequisite data for Boiler creation when those values are needed by upcoming suites.

Site Management is not the final framework scope. It is only Phase 1 and the initial prerequisite layer for future Boiler Management automation.
