# Environment Strategy

## Files

- `.env.dev`
- `.env.prod`

`TEST_ENV=dev` loads `.env.dev`; `TEST_ENV=prod` loads `.env.prod`.

## Required Values

- `BASE_URL`
- `{ROLE}_USERNAME`
- `{ROLE}_PASSWORD`

Credentials are read centrally by `src/config/environment.ts`. Missing values fail fast to avoid partial test execution against the wrong environment.

## Authentication Strategy

All roles authenticate through the login API. The request payload is:

```json
{
  "email": "emailaddress",
  "password": "password"
}
```

The expected response includes the session token in `id`:

```json
{
  "id": "ok2T4Lc2ZILWsL034kyfeHVFnT7cWtPkDAlXRPQBrDVZPUhoJWOFzBP6sCmwCjXN",
  "ttl": 1209600,
  "created": "2026-06-18T18:01:35.320Z",
  "userId": "6a2bb244a7344b337929e29c"
}
```

The framework must use `id` for authenticated API requests and browser session handling. UI-based login is not allowed.

## Cache Strategy

After add/update user role operations, tests must verify that user roles and permissions come from the latest API response. The assignee validation uses a new API login and browser context, and the current-user request uses cache-busting plus `Cache-Control: no-cache, no-store`. Environment setup and session reuse must not preserve stale user data, role data, or permissions across permission-sensitive assertions.

The same fresh-session strategy applies after unassignment. Removed-user Site visibility must be checked with a new login token, cache-busted current-user response, and new browser context.

Successful Site updates are verified in a new API-authenticated browser context before runtime data is replaced, preventing stale Site names or details from satisfying update assertions.

## Simulator Strategy

Boiler Creation uses the simulator Register and Update APIs before the UI Add Boiler step.

- Register endpoint: `POST /simulator/register`
- Full Update endpoint: `POST /simulator/fullupdate`
- `sola` and `nuro` are generated dynamically and must be unique per Register call.
- The Register response `code` is entered in the Add Boiler UI.
- The Register response `uniqueKey` is passed to Full Update as `key`.
- The Register request `sola` and `nuro` values are reused in the Full Update payload.
- Full Update must return `response.success = true`.
- Boiler settings are loaded from `test-data/settings/boiler-settings-data.json` and selected by the configurable software-version prefix in `test-data/settings/boiler-settings-config.json`.
- Boiler settings are refreshed automatically before Boiler Creation tests run.
- Runtime data stores `sola`, `nuro`, `code`, `uniqueKey`, software version, and settings type for future Boiler scenarios.

## Logging Strategy

Framework logs are written automatically under `logs/`:

- `logs/system.log`
- `logs/test.log`
- `logs/error.log`
- `logs/api.log`

The log directory is created automatically and ignored by source control. Logs must not include passwords, access tokens, authorization headers, API keys, secrets, simulator unique keys, or other sensitive values.

## Assigned Role Credential Strategy

Assigned-role invitation permission tests authenticate with `SITE_MANAGER`, `SITE_SUPERVISOR`, and `SITE_USER` credentials from the selected `.env` file. These accounts must have current access to the runtime sites used by the tests, and their role/permission data must be fetched from the latest API response during session setup.

The setup invitation scenarios invite those configured account emails into the created runtime sites:

- `SITE_MANAGER_USERNAME` is invited as Manager on the PKAdmin-created site.
- `SITE_SUPERVISOR_USERNAME` is invited as Supervisor on the PKTech-created site.
- `SITE_USER_USERNAME` is invited as User on the PKRep-created site.

Use quoted password values in `.env` files when a password contains `#`, otherwise dotenv treats the rest of the line as a comment.

## CI/CD

GitHub Actions supports manual environment selection and scheduled dev execution. Environment variables are supplied from GitHub secrets.
