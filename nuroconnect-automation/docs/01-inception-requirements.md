# Inception Requirements

## Scope

Automate Phase 1 role-based Site Management workflows and Phase 2 Boiler Management workflows. Site Management is the initial prerequisite module for Boiler Management.

- Site creation
- Site search
- Site invitation
- Site update
- Site unassignment
- Site delete
- Boiler creation

Boiler Management is Phase 2. Phase 1 should create reliable Site Name and Site ID prerequisite data that Boiler Management tests consume.

## Roles

- PKAdmin
- PKTech
- PKRep
- Site Manager
- Site Supervisor
- Site User

## Business Rules

- Login must be performed through the login API only; UI-based login must not be used anywhere in the automation framework.
- The login API request payload is:

```json
{
  "email": "emailaddress",
  "password": "password"
}
```

- Login requests must be sent to `/simulator/login` for the configured environment base URL.

- The expected login API response is:

```json
{
  "id": "",
  "ttl": 1209600,
  "created": "2026-06-18T18:01:35.320Z",
  "userId": ""
}
```

- The `id` value from the login response is the authentication token for API requests and browser session handling.
- The login `id`, passwords, API keys, authorization headers, cookies, and session data must never be emitted to console output, logs, reports, screenshots, or debug output. Authentication API calls use an uninstrumented secure HTTP path, and trace capture remains disabled because raw traces cannot be reliably redacted.
- Sites are created only by PKAdmin, PKTech, and PKRep.
- Site Manager, Site Supervisor, and Site User must not create sites.
- Site names use a unique 5-character alphanumeric suffix.
- Invitation emails use a unique 5-character alphanumeric local part plus `@yopmail.com` when the scenario requires a new ad hoc user.
- If site creation data is absent, dependent suites fail with `Site is not created. Execute site-creation test first.`
- PKAdmin, PKTech, and PKRep created sites are assigned to Site Manager, Site Supervisor, and Site User.
- Initial invitation coverage uses runtime Site data created by the Site Creation suite:
  - PKAdmin invites the configured Site Manager account from the PKAdmin-created site.
  - PKTech invites the configured Site Supervisor account from the PKTech-created site.
  - PKRep invites the configured Site User account from the PKRep-created site.
- Each initial invitation must verify the invited email in the inviter's Access Control list and verify the assigned Site from a fresh API-authenticated assignee session.
- Assigned-role invitation coverage uses runtime Site and invited-user data created by the previous suites:
  - Site Manager reuses the Supervisor email previously invited by PKTech and assigns that existing Supervisor to the PKAdmin-created site.
  - Site Supervisor cannot invite users from the assigned PKTech-created site.
  - Site User cannot invite users from the assigned PKRep-created site.
- Site invitation tests must store invited user email and role in runtime data for later access-control, update, delete, and Boiler prerequisite flows.
<!-- - Update coverage assigns Site Manager from the PKAdmin site and Site Supervisor from the PKTech site. -->
- Site creation must capture reusable Site Name and Site ID values so they can be used later as prerequisite data for Boiler creation.
- When a user is added or an existing user is updated with any role, the latest role and permission changes must be reflected immediately.
- The application and automation must not use old cached user data, role data, or permissions after add/update user role operations.
- Flow data is stored in a runtime file only while required by later suites.
- Runtime data is cleaned after the final delete suite.

## Site Unassignment Rules

- Site unassignment runs only after all Site Update scenarios finish.
- Site Supervisor and Site User removal restrictions must be verified while they still have assigned Site access.
- Site Supervisor and Site User must not have an enabled delete, remove, or unassign control in Access Control.
- Site Manager must remove the Manager-invited Supervisor before PKAdmin removes the Site Manager; otherwise the Manager can no longer open the assigned Site.
- PKAdmin removes the Manager, PKTech removes the Supervisor, and PKRep removes the User from their respective created Sites.
- After removal, the email must disappear from Access Control and the Site must disappear from a fresh API-authenticated removed-user session.
- Runtime invitation and assignment records must be updated only after UI removal succeeds.

## Site Search Rules

- PKAdmin and PKTech must be able to search Sites created by PKAdmin, PKTech, and PKRep, including Sites created by themselves.
- PKRep can view/search only Sites created by PKRep or assigned to PKRep.
- Site Manager, Site Supervisor, and Site User can view/search only Sites assigned to them, or Sites created by themselves if creation is ever allowed.
- Restricted roles must not view Sites created by other users, Sites assigned to other users, or Sites where they are not part of Access Control.
- Restricted-role search filters must be hidden, disabled, or ineffective according to the actual UI behavior.
- Search validation runs after Site Creation and Site Invitation, using runtime Site and assigned-user data only.

## Site Update Rules

- PKAdmin, PKTech, and PKRep can update their own created Sites.
- Site Manager can update the assigned PKAdmin Site and Site Supervisor can update the assigned PKTech Site.
- Every successful update uses dynamic data, verifies the updated Site Name through a fresh API-authenticated search, verifies updated details, and updates the existing runtime Site record without losing Site ID or assignments.
- Site User has read-only access to the assigned PKRep Site. Site Update should validate that Site User cannot update assigned Site fields, but it must not execute Site Creation, Search, or Invitation scenarios to get that prerequisite data.

## Boiler Creation Rules

- Boiler Creation runs after Site Creation, Site Invitation, and Site Search, and before Site Update and Site Unassignment.
- Boiler Creation covers PKAdmin, PKTech, PKRep, Site Manager, Site Supervisor, and Site User permission behavior.
- PKAdmin selects the latest PKAdmin-created Site, PKTech selects the latest PKTech-created Site, and PKRep selects the latest PKRep-created Site.
- Site Manager and Site Supervisor can create Boilers only for Sites directly assigned to them.
- Site User cannot create Boilers. Site User Boiler information must be read-only and the Save control must not be visible for edit/create behavior.
- If Site runtime data is missing, Boiler Creation must fail fast and must not add a Boiler.
- Boiler Creation must call Simulator Register API before entering the boiler code in the UI.
- Simulator Register must use unique Sola and Nuro values for every call and must return a six-character code and unique key.
- Boiler Creation must call Simulator Full Update API with the Register unique key as `key`, and the same Sola and Nuro values from the Register request payload, before adding the Boiler in the UI.
- Boiler settings must be selected dynamically from `payload.data.software` using configurable software-version prefix mapping.
- Boiler settings for Weil-McLain and Patterson-Kelley must be stored separately and refreshed automatically before Boiler Creation tests run.
- Boiler Info validation must verify auto-populated Name equals Nuro, Sola S/N equals Sola, Nuro S/N equals Nuro, and Device Info fields are disabled/read-only.
- Boiler Info Temperature Sensor validation must read its payload key, decimal raw value, UI label, and expected displayed value from `test-data/boilers/boiler-info-reference.json`. Hexadecimal values must not be sent to Full Update. The mapped sensor values must be displayed as read-only with no edit or save action.
- Boiler Creation for every configured Boiler type must use those same Temperature Sensor raw values in its Full Update payload and persist that payload for Boiler Info and subsequent Boiler data verification.
- Boiler Update payload data must load all 41 non-identity properties from `test-data/boilers/boiler-update-payload-reference.json`, extracted from `boiler-details.docx` Summary Table `Attribute` and `Raw (sample)` columns. Hex samples are stored as decimal numbers. Register-request `sola` and `nuro` are appended dynamically, and the Register-response unique key remains the top-level update `key`.
- Boiler Info Mode must be derived directly from the Full Update `cascade` value: `0` is `Standalone`, `1` is `Cascade Master`, and `2` is `Cascade Member`. Patterson-Kelley uses configured cascade `0`; Weil-McLain uses configured cascade `1`. Mode must not be resolved from Boiler Settings.
- Boiler Creation must assert the displayed Boiler type based on the software-version mapping.
- Runtime data must store Boiler Name, Boiler ID when available, selected Site Name/Site ID, Sola, Nuro, Register Code, Unique Key, creator role, description, boiler type, settings type, and software version.

## Logging Requirements

- The framework must provide one centralized reusable logger utility.
- Supported log levels are `INFO`, `WARN`, `ERROR`, `DEBUG`, `STEP`, `API`, and `SYSTEM`.
- Logs must include timestamp, log level, test name when available, role when available, module when available, message, and optional metadata.
- Logs must be written under `logs/` into separate `system.log`, `test.log`, `error.log`, and `api.log` files.
- The `logs/` folder must be created automatically when tests run and must be excluded from source control.
- Important system, step, warning, and error logs should print to the console during execution.
- Logger usage must cover common navigation actions, button clicks, form entries, API requests/responses, assertions, runtime data save/read actions, settings export, Boiler Register API, Boiler Full Update API, and errors.
- Sensitive values must not be logged. Passwords, access tokens, authorization headers, API keys, secrets, simulator unique keys, and similar secret values must be masked or omitted.

## Phase 2 Readiness

The Playwright + TypeScript framework must stay module-ready. Shared fixtures, API helpers, runtime data utilities, page objects, and test data factories should support additional modules without Site Management-specific coupling.

For Boiler Management automation, Site Name and Site ID from Phase 1 should be available as prerequisite data for Boiler creation, Boiler search, Boiler details, alerts, and settings scenarios.

## Cache Validation

Add/update user role scenarios must verify that user roles and permissions are fetched from the latest API response. Tests should invalidate or bypass stale browser, storage, or API cache state before asserting permission-sensitive behavior.

Invitation scenarios must verify the invited user from the latest Access Control list after invite completion. Tests must not rely only on the toast message or cached role/user data.

Site visibility must be validated immediately after assignment using a new API login, a cache-busted current-user API response, and a fresh browser context for the assignee.

For negative invitation permission checks, tests must verify the Access Control `+` invite button is hidden for Site Supervisor and Site User.

## Test Title Standard

Every test title starts with `Verify When`.
