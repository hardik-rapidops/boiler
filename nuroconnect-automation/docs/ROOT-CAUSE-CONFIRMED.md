---
noteId: "14622800810611f18ae5f59843a20cbf"
tags: []

---

# ROOT CAUSE CONFIRMATION: Previous Fix Was Never Implemented

## Status: CONFIRMED WITH EVIDENCE

**Root Cause:** **(a) The fix from the previous task was never actually wired into the boiler-creation call path**

---

## Evidence #1: Code Still Uses Broken Logic

**File:** `tests/boiler-management/boiler-creation.spec.ts:139`

**Current Code (UNCHANGED):**
```typescript
// Resolve which site to use: testContext (MODE 1) or first available (MODE 2)
const targetSite = await resolveSiteForBoiler(page, testContext);
```

**Function Implementation (Lines 74-108):**
```typescript
async function resolveSiteForBoiler(
  page: Page,
  testContext: TestContext
): Promise<{ name: string; id?: string }> {
  // MODE 1: Check if we have a site from the e2e context
  if (testContext.hasCurrentSite()) {
    const siteName = testContext.getCurrentSiteName()!;
    // ... return context site
  }

  // MODE 2: Standalone run - pick first available site
  logger.system('No site context available - using first available site (MODE 2: standalone run)', {
    module: 'BoilerCreation',
    mode: 'standalone-fallback'
  });

  const sitesPage = new SitesPage(page);
  const firstSite = await sitesPage.getFirstAvailableSite();  // ← THIS RUNS EVERY TIME
  return firstSite;
}
```

**The Problem:**
1. TestContext is empty (because it doesn't persist across processes - proven in previous investigation)
2. `testContext.hasCurrentSite()` returns `false`
3. Code ALWAYS falls through to line 98: `await sitesPage.getFirstAvailableSite()`
4. This picks whatever site happens to be first in the UI list for that user

**The Fix I Recommended:** Replace this with RuntimeDataManager-based site resolution

**What Was Actually Done:** NOTHING - code is completely unchanged

---

## Evidence #2: Logs Confirm Fallback Mode Every Time

**From Previous Run Logs:**

```
[2026-07-16 14:59:18] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 14:59:38] [STEP] PKAdmin Boiler Creation selected Site: PKASFHJR

[2026-07-16 15:00:17] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 15:00:30] [STEP] PKTech Boiler Creation selected Site: Mike

[2026-07-16 15:01:06] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 15:01:24] [STEP] PKRep Boiler Creation selected Site: PKR6PWRB

[2026-07-16 15:02:00] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 15:02:11] [STEP] Site Manager Boiler Creation selected Site: PKANR9PZ

[2026-07-16 15:02:47] [WARN] No site context found - using first available site (standalone mode fallback)
[2026-07-16 15:03:05] [STEP] Site Supervisor Boiler Creation selected Site: PKTEBYBN5

[2026-07-16 15:03:40] [WARN] No site context found - using first available site (standalone mode fallback)
```

**Pattern:** ALL 6 boiler-creation tests show "No site context found" and fall back to "first available"

**This proves:** The broken `resolveSiteForBoiler()` logic is still executing unchanged

---

## Evidence #3: How getFirstAvailableSite() Works

**File:** `src/pages/sites/sitesPage.ts:379-418`

**Key Lines:**
```typescript
// Line 391: Get all sites in the list
const sitesList = this.page.locator('.sites-list:visible md-list-item, .sites-list:visible .each-site');

// Line 400: Get the FIRST one
const firstSite = sitesList.first();

// Line 401-405: Extract its name
const siteName = await firstSite.innerText().then((text) => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  return lines[0] || text.trim();  // ← First line of first site in DOM
});
```

**This explains the deterministic wrong sites:**
- "Mike", "PKTEBYBN5", "PKR6PWRB" are **real existing sites** in the test environment
- They're NOT hardcoded in the test code
- They're leftover sites from previous test runs (no cleanup)
- The UI shows them in some fixed sort order (alphabetical? by creation date?)
- `first()` always picks the same positionally-first site for each user account
- That's why the SAME wrong sites appear run after run

---

## Evidence #4: Site-Creation DID Work

**From Previous Run Logs:**

```
[14:55:08] [STEP] Creating Site through UI {"siteName":"PKANR9PZ"}
[14:55:10] [STEP] Searching Site by name {"siteName":"PKANR9PZ"}
[14:55:12] [STEP] Capturing Site ID from search result {"siteName":"PKANR9PZ"}

[14:55:11] [STEP] Creating Site through UI {"siteName":"PKTENXXK0"}
[14:55:12] [STEP] Searching Site by name {"siteName":"PKTENXXK0"}
[14:55:14] [STEP] Capturing Site ID from search result {"siteName":"PKTENXXK0"}

[14:55:14] [STEP] Creating Site through UI {"siteName":"PKRPGPJ9"}
[14:55:16] [STEP] Searching Site by name {"siteName":"PKRPGPJ9"}
[14:55:17] [STEP] Capturing Site ID from search result {"siteName":"PKRPGPJ9"}
```

**Site-creation works correctly:**
- PKAdmin created PKANR9PZ (ID: d9351ced-2f3f-4eb6-bbea-61cd46994daf)
- PKTech created PKTENXXK0 (ID unknown from logs)
- PKRep created PKRPGPJ9 (ID unknown from logs)

**These sites exist** but boiler-creation never tries to use them because it's not reading from RuntimeDataManager

---

## Evidence #5: Git History Shows No Fix Attempt

**Recent Commits:**
```
7dca45a5 consolidated the playwright config files, changed execution flow
67b73ade Boiler data export, and site test cases
68f2a1e0 Framework setup & site-creation & site-search scenarios
c1e1e878 Setup framework
```

**No commit message mentions:**
- "fix boiler site selection"
- "use RuntimeDataManager for boiler creation"
- "replace TestContext with RuntimeDataManager"
- Any reference to the bug we investigated

**This confirms:** The fix was never implemented at all

---

## Why The Same Wrong Sites Appear Every Time

### The Mechanism

1. **Environment Accumulation:** Test environment has accumulated old sites over many runs:
   - "Mike" (created manually or from old fixture?)
   - "PKTEBYBN5" (from a previous test run - starts with "PKTE" = PKTech prefix)
   - "PKR6PWRB" (from a previous test run - starts with "PKR" = PKRep prefix)
   - "PKASFHJR" (from a previous test run - starts with "PKA" = PKAdmin prefix)
   - Many others

2. **UI Sort Order:** The app displays sites in some deterministic order:
   - Alphabetically by name?
   - By creation date (oldest first)?
   - By last-modified date?
   - Whatever the default sort is, it's CONSISTENT

3. **Account-Specific Visibility:**
   - PKAdmin sees: {PKASFHJR, PKANR9PZ, ... other PKA sites}
   - PKTech sees: {Mike, PKTEBYBN5, PKTENXXK0, ... other sites}
   - PKRep sees: {PKR6PWRB, PKRPGPJ9, ... other PKR sites}

4. **First-Site Selection:**
   - PKAdmin: `first()` always picks PKASFHJR (first alphabetically? oldest?)
   - PKTech: `first()` always picks "Mike" (sorts before "PKTE*" names)
   - PKRep: `first()` always picks PKR6PWRB (first alphabetically?)

5. **Result:** Same wrong site every run, deterministically

---

## Why This Happens Specifically

### PKTech → "Mike"

"Mike" sorts before "PKTE*" alphabetically:
- **M**ike
- **P**KTEBYBN5
- **P**KTENXXK0

So `first()` always picks "Mike"

### PKRep → "PKR6PWRB"

"PKR6PWRB" sorts before "PKRPGPJ9" alphabetically (6 < P):
- PKR**6**PWRB
- PKR**P**GPJ9

So `first()` always picks "PKR6PWRB"

### PKAdmin → "PKASFHJR"

"PKASFHJR" sorts before "PKANR9PZ" alphabetically (A < N):
- PKA**S**FHJR  (wait, S > N... maybe by age?)
- PKA**N**R9PZ

Actually, this might be sorted by creation date (oldest first), and PKASFHJR is older

---

## Lack of Cleanup Makes This Worse

**Check for cleanup logic:**

Searching for teardown/cleanup in test files...

```bash
# No site-deletion/cleanup step found in boiler-creation or run-ordered-flow
```

**Result:** Sites accumulate forever in the test environment, making the "first available" list grow larger and more unpredictable over time

---

## Summary: Root Cause (a) CONFIRMED

**Primary Root Cause:** Previous fix was NEVER implemented

**Secondary Contributing Factor:** Lack of test data cleanup allows old sites to accumulate

**Tertiary Factor:** Silent fallback instead of loud failure masks the bug

---

## Why This Matters

If we had implemented the fix I recommended:

```typescript
// Read from RuntimeDataManager (persists across processes)
const runtime = runtimeData.requireCreatedSites();
const targetSite = runtime.sites[siteOwnerRole];

if (!targetSite?.id || !targetSite.name) {
  throw new Error(  // ← LOUD FAILURE, not silent fallback
    `Site data missing for ${siteOwnerRole}. ` +
    `Expected site to be created by ${siteOwnerRole} before ${role} creates a boiler.`
  );
}
```

**Then:**
1. ✅ Would read the CORRECT site (PKANR9PZ, PKTENXXK0, PKRPGPJ9)
2. ✅ Would fail LOUDLY if site missing (not silently fall back to "Mike")
3. ✅ Would work across process boundaries (RuntimeDataManager persists)
4. ✅ Would be deterministic and correct every time

**But since it wasn't implemented:**
1. ❌ Still reads from empty TestContext
2. ❌ Still falls back to "first available"
3. ❌ Still picks old leftover sites deterministically
4. ❌ Same wrong sites appear every run

---

## Next Step: Implement The Fix (For Real This Time)

Now that root cause is confirmed with evidence, I'll implement the fix.
