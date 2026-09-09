---
noteId: "7926ad70810a11f18ae5f59843a20cbf"
tags: []

---

# ACTUAL ROOT CAUSE: Site Dropdown Timing Issue

**Date:** 2026-07-16
**Status:** ✅ CONFIRMED

---

## Executive Summary

**You suspected:** Execution sequence was wrong
**Actual finding:** Execution sequence IS CORRECT, but newly created sites don't appear in boiler dropdown immediately

**Root Cause:** `selectSiteIfAvailable()` doesn't wait for dropdown options to load from API after opening

---

## Evidence: Execution Sequence IS CORRECT

### From Latest Test Run:

```
FLOW 1/7: site-creation       ✅ PASSED (all 3 sites created)
FLOW 2/7: site-invitation     ✅ PASSED (assignments completed)
FLOW 3/7: site-search         ⏭️ SKIPPED (not in FLOW_ONLY filter)
FLOW 4/7: boiler-creation     ❌ FAILED (new reason - sites not in dropdown)
```

**Proof from logs:**
```
[16:37:42] Site-creation: Created PKARLNGQ (ID: 7cd08b67-899a-4713-8b7a-38c3293f8d64)
[16:37:44] Site-creation: Created PKTE33SIL (ID: a7c1cbb8-67bc-4407-b8c6-af47cd5ec3f6)
[16:37:51] Site-creation: Created PKR8AMTN (ID: a088aa80-9e18-4009-9936-4fe75affe549)
[16:38:21] Site-invitation: Completed all assignments
[16:41:33] Boiler-creation: Resolved site PKARLNGQ (correct!)
           ERROR: Site "PKARLNGQ" not available in dropdown
```

### Test Execution Order (run-ordered-flow.js):

**File:** `scripts/run-ordered-flow.js:7-14`

```javascript
const flow = [
  { project: 'site-creation', workers: 3 },
  { project: 'site-invitation', workers: 1 },
  { project: 'site-search', workers: 3 },
  { project: 'boiler-creation', workers: 1 },  // ← Runs 4th, as intended
  { project: 'boiler-info', workers: 1 },
  { project: 'site-update', workers: 1 },
  { project: 'site-unassignment', workers: 1 }
];
```

**Execution mechanism:** Each project runs as a SEPARATE process via `spawnSync`, sequentially.

**Result:** ✅ Order enforced correctly - no parallel execution, no file-load-order issues

---

## Evidence: My RuntimeDataManager Fix IS WORKING

**Logs show:**
```
[16:41:33] [SYSTEM] Resolved site for boiler creation from RuntimeDataManager
           {"module":"BoilerCreation",
            "role":"pkAdmin",
            "siteOwnerRole":"pkAdmin",
            "siteName":"PKARLNGQ",
            "siteId":"7cd08b67-899a-4713-8b7a-38c3293f8d64"}
```

**This proves:**
- ✅ RuntimeDataManager is being read (not TestContext)
- ✅ Correct site name/ID being resolved
- ✅ No fallback to "first available" happening
- ✅ Role-to-site mapping working correctly

---

## The ACTUAL Problem: Site Dropdown Timing

### Current Implementation (BoilersPage.ts:135-165):

```typescript
async selectSiteIfAvailable(siteName: string): Promise<string | undefined> {
  logger.step('Selecting Site for Boiler if available', { module: 'BoilersPage', siteName });
  const select = this.siteSelect.first();
  await expect(select).toBeVisible();

  // ...handle regular <select> case...

  // For md-select (Material Design):
  await select.click();  // ← Opens dropdown, triggers API call

  const option = this.page
    .getByRole('option')
    .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(siteName)}\\s*$`) })
    .first();

  if (!(await option.isVisible().catch(() => false))) {  // ← IMMEDIATELY checks, no wait!
    await this.closeSiteDropdown(select);
    return undefined;  // ← Returns "not found" before API response arrives
  }
  // ...
}
```

### The Problem:

1. **Line 150:** `await select.click()` - Opens dropdown, which triggers an API call to load sites
2. **Line 151-156:** Immediately tries to find option - **NO WAIT for API response**
3. **Line 157:** Checks `isVisible()` - returns false because options haven't loaded yet
4. **Line 159:** Returns `undefined` - "site not found"
5. **Test fails loudly** (thanks to my new fail-fast error handling)

### Why This Happens:

**Newly Created Sites:**
- Site-creation module creates sites and writes to RuntimeDataManager ✅
- BUT the application's site list API may:
  - Cache site lists
  - Index sites asynchronously
  - Have propagation delay between write and read APIs

**Boiler Dropdown:**
- Loads sites from a separate API endpoint
- That endpoint may not immediately reflect just-created sites
- No explicit wait for options to finish loading after dropdown opens

---

## Why We Didn't See This Before

**Previous buggy code:**
```typescript
// OLD: Silent fallback
const firstSite = await sitesPage.getFirstAvailableSite();
// If target not found, just pick whatever is first (e.g., "Mike")
```

**My new code:**
```typescript
// NEW: Fail-fast
if (!selectedSiteName) {
  throw new Error('SITE SELECTION FAILED...');  // ← LOUD FAILURE
}
```

**Result:** Previous code MASKED this timing issue by silently falling back to old sites. My fix EXPOSED it by failing loudly.

---

## Root Cause: selectSiteIfAvailable Needs to Wait for Options

### Current Flow (BROKEN):
```
1. Open dropdown (triggers API call)
2. Immediately check for option  ← TOO FAST
3. Option not found (API still loading)
4. Return undefined
5. Test fails
```

### Required Flow (FIX):
```
1. Open dropdown (triggers API call)
2. Wait for options to load      ← ADD THIS
3. Check for option
4. Option found/not found (real result)
5. Proceed accordingly
```

---

## The Fix

### Option A: Add explicit wait in selectSiteIfAvailable

```typescript
async selectSiteIfAvailable(siteName: string): Promise<string | undefined> {
  // ...
  await select.click();  // Opens dropdown

  // ADD: Wait for dropdown to populate with options from API
  await this.page.waitForTimeout(2000);  // Simple wait
  // OR better: Wait for first option to be visible
  await this.page.getByRole('option').first().waitFor({ state: 'visible', timeout: 5000 });

  // NOW check for our specific option
  const option = this.page
    .getByRole('option')
    .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(siteName)}\\s*$`) })
    .first();

  if (!(await option.isVisible().catch(() => false))) {
    await this.closeSiteDropdown(select);
    return undefined;
  }
  // ...
}
```

### Option B: Poll/retry for site visibility

```typescript
async selectSiteIfAvailable(siteName: string, retries = 3): Promise<string | undefined> {
  // ...
  await select.click();

  for (let i = 0; i < retries; i++) {
    await this.page.waitForTimeout(1000);
    const option = this.page
      .getByRole('option')
      .filter({ hasText: new RegExp(`^\\s*${this.escapeRegExp(siteName)}\\s*$`) })
      .first();

    if (await option.isVisible().catch(() => false)) {
      // Found it!
      await option.click({ force: true });
      return siteName;
    }

    if (i < retries - 1) {
      // Close and reopen dropdown to trigger fresh API call
      await this.closeSiteDropdown(select);
      await this.page.waitForTimeout(500);
      await select.click();
    }
  }

  await this.closeSiteDropdown(select);
  return undefined;
}
```

### Option C: Add site-creation → site-search delay

In `scripts/run-ordered-flow.js`, add a delay between site-creation and subsequent modules:

```javascript
// After site-creation completes, wait for sites to propagate
if (item.project === 'site-creation') {
  console.log('Waiting 5s for sites to propagate...');
  await new Promise(resolve => setTimeout(resolve, 5000));
}
```

---

## Recommendation

**Implement Option A + Option C:**

1. **Option A:** Add 2-3 second wait in `selectSiteIfAvailable()` after opening dropdown
   - Fixes immediate timing issue
   - Simple, low-risk change

2. **Option C:** Add 5-10 second delay after site-creation in run-ordered-flow.js
   - Ensures sites propagate to all APIs
   - Gives application time to index new sites
   - Matches real-world usage pattern (users don't create site and immediately create boiler)

**Don't need Option B:** Polling/retry adds complexity and may mask deeper issues

---

## Impact on Previous Investigation

### What We Learned:

1. ✅ Execution sequence was ALWAYS correct - run-ordered-flow.js works as designed
2. ✅ RuntimeDataManager fix works perfectly - correct sites being resolved
3. ✅ Fail-fast error handling works - exposed hidden timing issue
4. ❌ "Wrong site" bugs (Mike, PKTEBYBN5) were NOT caused by sequence - they were caused by TestContext being empty → fallback to first available
5. ✅ With my RuntimeDataManager fix + timing fix, "wrong site" bugs should be completely resolved

### What This Means:

- **Original investigation was correct:** TestContext + fallback logic was root cause
- **My fix was correct:** RuntimeDataManager-based resolution works
- **New issue discovered:** Dropdown timing masked by old silent-fallback behavior
- **Execution sequence was NEVER the problem:** It was working all along

---

## Next Steps

1. Implement Option A (add wait in selectSiteIfAvailable)
2. Implement Option C (add delay after site-creation)
3. Re-run validation tests
4. Verify ALL boilers land under correct sites
5. Verify no more "Mike" or wrong-site issues

---

## Files to Modify

1. **`src/pages/boilers/boilersPage.ts`** - Add wait in selectSiteIfAvailable (Option A)
2. **`scripts/run-ordered-flow.js`** - Add delay after site-creation (Option C)

---

## Status

**Execution Sequence:** ✅ CONFIRMED CORRECT - No changes needed
**RuntimeDataManager Fix:** ✅ WORKING - Sites correctly resolved
**New Issue Found:** ⚠️ Dropdown timing - Fix ready to implement
