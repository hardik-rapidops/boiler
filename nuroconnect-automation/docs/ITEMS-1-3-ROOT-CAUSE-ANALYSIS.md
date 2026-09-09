---
noteId: "e2c1183080fe11f18ae5f59843a20cbf"
tags: []

---

# ROOT CAUSE ANALYSIS: Items 1-3 Wrong Site Selection

## Executive Summary

**ALL boiler-creation tests are selecting the wrong site** because the TestContext (which should contain site names from site-creation) is **completely empty** during boiler-creation. This causes all tests to fall back to "first available site" mode, resulting in arbitrary/wrong site selection.

---

## Evidence from Test Logs

### Smoking Gun Log Entries

```
[2026-07-16 14:59:18] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 14:59:38] [STEP] PKAdmin Boiler Creation selected Site: PKASFHJR
                      (Expected: PKANR9PZ - the site PKAdmin created)

[2026-07-16 15:00:17] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 15:00:30] [STEP] PKTech Boiler Creation selected Site: Mike
                      (Expected: PKTENXXK0 - the site PKTech created)

[2026-07-16 15:01:06] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 15:01:24] [STEP] PKRep Boiler Creation selected Site: PKR6PWRB
                      (Expected: PKRPGPJ9 - the site PKRep created)
```

**Pattern:** Every single boiler-creation test shows "No site context found" and falls back to arbitrary site selection.

---

## Root Cause #1: TestContext Doesn't Persist Across Module Boundaries

### The Architecture

**File:** `scripts/run-ordered-flow.js:59-93`

```javascript
const result = runPlaywright(
  testArgs,
  {
    ORDERED_FLOW: 'true',
    FLOW_INDEX: flowIndex,
    FLOW_PROJECT: item.project,
    PRESERVE_LOGS: index === 0 ? 'false' : 'true'
  }
);

function runPlaywright(args, env) {
  return spawnSync(process.execPath, [playwrightCli, ...args], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit'
  });
}
```

**Each module runs as a SEPARATE Node.js process via `spawnSync`:**

1. **Process 1:** site-creation
   - TestContext singleton created
   - PKAdmin calls `testContext.setCurrentSite("PKANR9PZ", "d9351ced...")`
   - PKTech calls `testContext.setCurrentSite("PKTENXXK0", "...")` ← **OVERWRITES PKAdmin's**
   - PKRep calls `testContext.setCurrentSite("PKRPGPJ9", "...")` ← **OVERWRITES PKTech's**
   - Process exits → **TestContext destroyed**

2. **Process 2:** site-invitation
   - **NEW TestContext singleton created** (empty)
   - Process exits → TestContext destroyed

3. **Process 3:** boiler-creation
   - **ANOTHER NEW TestContext singleton created** (empty)
   - All tests call `testContext.hasCurrentSite()` → returns `false`
   - All tests fall back to "first available site from UI dropdown"

### Why RuntimeDataManager Works But TestContext Doesn't

**RuntimeDataManager:** Writes to `test-data/runtime/sites.runtime.json` on disk
- ✅ Persists across process boundaries
- ✅ Used by site-invitation to read PKAdmin/PKTech/PKRep created sites
- ✅ Why invitations work correctly

**TestContext:** In-memory singleton in `src/context/testContext.ts`
- ❌ Destroyed when process exits
- ❌ Each new process starts with empty context
- ❌ No persistence mechanism
- ❌ Why boiler-creation has no site context

---

## Root Cause #2: TestContext Only Tracks ONE Site

Even if TestContext DID persist across processes, it would still fail because:

**File:** `src/context/testContext.ts:24-31`

```typescript
/** The unique site name being tracked through the e2e flow */
private _currentSiteName: string | undefined;

/** Site ID for the current site (for ID-based operations where needed) */
private _currentSiteId: string | undefined;
```

**Design:** Single `_currentSiteName` field

**Reality:** THREE roles each create their own site:
- PKAdmin creates PKANR9PZ
- PKTech creates PKTENXXK0
- PKRep creates PKRPGPJ9

**Conflict:** Each call to `testContext.setCurrentSite()` **OVERWRITES** the previous value:
1. PKAdmin test sets context = PKANR9PZ
2. PKTech test sets context = PKTENXXK0 ← PKAdmin's lost
3. PKRep test sets context = PKRPGPJ9 ← PKTech's lost

Only the LAST site (PKRep's) would be retained, even within the same process.

---

## How Wrong Sites Are Selected

### Current Boiler-Creation Logic

**File:** `tests/boiler-management/boiler-creation.spec.ts:74-108`

```typescript
async function resolveSiteForBoiler(
  page: Page,
  testContext: TestContext
): Promise<{ name: string; id?: string }> {
  // MODE 1: Check if we have a site from the e2e context
  if (testContext.hasCurrentSite()) {
    const siteName = testContext.getCurrentSiteName()!;
    const siteId = testContext.getCurrentSiteId();
    logger.system('Using site from test context (MODE 1: full e2e run)', {
      module: 'BoilerCreation',
      siteName,
      siteId,
      mode: 'e2e-context'
    });
    return { name: siteName, id: siteId };
  }

  // MODE 2: Standalone run - pick first available site
  logger.system('No site context available - using first available site (MODE 2: standalone run)', {
    module: 'BoilerCreation',
    mode: 'standalone-fallback'
  });

  const sitesPage = new SitesPage(page);
  const firstSite = await sitesPage.getFirstAvailableSite();
  // ^^^ THIS is what ALL tests are doing - selecting first available site from UI
```

### Why Each Role Got the "Wrong" Site

1. **PKAdmin → PKASFHJR:**
   - Context empty → MODE 2 fallback
   - `getFirstAvailableSite()` returns first site in dropdown for PKAdmin's account
   - PKASFHJR happens to be first alphabetically/positionally
   - **ID:** 022e0a58-83a3-465b-ab4e-60f7cc52fadf

2. **PKTech → "Mike":**
   - Context empty → MODE 2 fallback
   - `getFirstAvailableSite()` returns first site in dropdown for PKTech's account
   - "Mike" is an existing site (possibly from prior runs or fixtures)
   - Happens to sort first for PKTech
   - **ID:** 01e7448a-f189-4422-aa1b-70ef1d7d73fa

3. **PKRep → PKR6PWRB:**
   - Context empty → MODE 2 fallback
   - `getFirstAvailableSite()` returns first site in dropdown for PKRep's account
   - PKR6PWRB is first available (not the newly created PKRPGPJ9)
   - **ID:** 097debbf-9451-47ca-89e9-a7c1f3665ef1

### Why Item 4 (SiteManager) Accidentally Worked

```
[2026-07-16 15:02:11] [STEP] Site Manager Boiler Creation selected Site: PKANR9PZ
```

**Pure luck:** The first available site in SiteManager's dropdown happened to be PKANR9PZ (PKAdmin's site), which is also the site SiteManager is assigned to.

**This does NOT mean the logic is correct** - it just happened to select the right site by coincidence.

---

## The "Mike" Site Mystery Solved

**Question:** Where did site "Mike" come from?

**Answer:** It's a pre-existing site in the test environment that wasn't created during this run. Possible sources:
1. Leftover from a previous test run that didn't clean up
2. Manual test data created in the environment
3. Fixture/seed data from environment setup

**Evidence:**
- "Mike" never appears in site-creation logs for this run
- It has a valid site ID: 01e7448a-f189-4422-aa1b-70ef1d7d73fa
- It's accessible to PKTech's account
- It happened to be first in the dropdown (alphabetically? by creation date?)

**Why this matters:** If the test had FAILED LOUDLY when context was missing (instead of silently falling back), we would have caught this immediately instead of creating a boiler under an unrelated site and getting confusing "wrong site" errors.

---

## Why This Pattern Broke ALL Tests

Items 1, 2, 3, 5 all failed for the same reason:
- ❌ PKAdmin boiler under wrong site (PKASFHJR instead of PKANR9PZ)
- ❌ PKTech boiler under wrong site ("Mike" instead of PKTENXXK0)
- ❌ PKRep boiler under wrong site (PKR6PWRB instead of PKRPGPJ9)
- ❌ SiteSupervisor boiler under wrong site (PKTEBYBN5 instead of PKTech's or PKRep's - TBD after contradiction resolved)

Only SiteManager (item 4) and SiteUser (item 6) appeared correct by pure coincidence (first-available happened to match assigned).

---

## Comparison: Why Site Invitation Worked

Site invitation tests worked correctly because they read from RuntimeDataManager:

**File:** `tests/site-management/site-invitation.spec.ts:40-41`

```typescript
const runtime = runtimeData.requireCreatedSites();
const createdSite = runtime.sites[scenario.inviterRole];
```

**Key differences:**
1. Uses RuntimeDataManager which **persists to disk** between processes
2. Reads specific site by role key: `runtime.sites['pkAdmin']`, `runtime.sites['pkTech']`, etc.
3. No reliance on TestContext at all

**This is the pattern boiler-creation should follow.**

---

## The Fix

### Immediate Fix: Read Sites from RuntimeDataManager

**Current broken code (boiler-creation.spec.ts:110-243):**

```typescript
async function createBoilerForRole(
  role: BoilerCreatorRole,
  siteOwnerRole: BoilerSiteOwnerRole,
  // ...
) {
  // ...
  const targetSite = await resolveSiteForBoiler(page, testContext); // ← WRONG: TestContext is empty
  // ...
}
```

**Fixed code:**

```typescript
async function createBoilerForRole(
  role: BoilerCreatorRole,
  siteOwnerRole: BoilerSiteOwnerRole,
  authenticatedPageForRole,
  runtimeData,
  // ...
) {
  // Get the site created by the SPECIFIC owner role, not from empty context
  const runtime = runtimeData.requireCreatedSites();
  const targetSite = runtime.sites[siteOwnerRole];

  if (!targetSite?.id || !targetSite.name) {
    throw new Error(
      `Site data missing for ${siteOwnerRole}. ` +
      `Expected site to be created by ${siteOwnerRole} before ${role} creates a boiler.`
    );
  }

  // Use the SPECIFIC site, not "first available"
  // ...
}
```

### Long-Term Fix: Extend RuntimeDataManager for Boiler-Specific Tracking

Since boiler-creation needs to know:
- PKAdmin creates boiler under PKAdmin's site
- SiteManager creates boiler under PKAdmin's site (the one SiteManager is assigned to)
- SiteSupervisor creates boiler under PKTech's site (after contradiction resolved)

The mapping should be explicit in test code:

```typescript
const roleToSiteOwnerMap: Record<BoilerCreatorRole, BoilerSiteOwnerRole> = {
  pkAdmin: 'pkAdmin',
  pkTech: 'pkTech',
  pkRep: 'pkRep',
  siteManager: 'pkAdmin',    // Creates under assigned PKAdmin site
  siteSupervisor: 'pkTech',  // Creates under assigned PKTech site
  siteUser: 'pkRep'          // Read-only, verifies PKRep boilers
};

const siteOwnerRole = roleToSiteOwnerMap[role];
const targetSite = runtime.sites[siteOwnerRole];
```

---

## Action Items

1. **Immediate:** Fix boiler-creation to read from RuntimeDataManager instead of TestContext
2. **Validation:** Ensure boilers land under correct sites per authoritative docs
3. **Safeguard:** Throw explicit error if target site is missing (fail fast, not silent fallback)
4. **Cleanup:** Remove TestContext usage from boiler-creation entirely (it was never going to work across processes)
5. **Documentation:** Update docs to clarify RuntimeDataManager is the source of truth for cross-module data, not TestContext

---

## Status

**Root cause identified:** ✅
**Fix strategy confirmed:** ✅
**Ready to implement:** ⏸️ (awaiting contradiction resolution for items 5-6)

**Items 1-3 analysis complete. Items 1-4 can be fixed immediately. Items 5-6 need contradiction resolution first.**
