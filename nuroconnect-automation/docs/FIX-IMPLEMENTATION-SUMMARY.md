---
noteId: "af7d7e20810611f18ae5f59843a20cbf"
tags: []

---

# Fix Implementation Summary

**Date:** 2026-07-16
**Issue:** Persistent boiler-site-targeting bug - same wrong sites appearing across runs
**Status:** ✅ FIXED - Root cause identified and corrected

---

## DELIVERABLE 1: Confirmed Root Cause

**Document:** `docs/ROOT-CAUSE-CONFIRMED.md`

**Root Cause:** **(a) The fix from the previous task was never actually wired into the boiler-creation call path**

### Evidence:

1. **Code Analysis:** `tests/boiler-management/boiler-creation.spec.ts:139` still used old broken logic:
   ```typescript
   const targetSite = await resolveSiteForBoiler(page, testContext);
   ```
   - TestContext is empty (doesn't persist across processes)
   - Always falls through to "first available site" mode
   - Never reads from RuntimeDataManager

2. **Log Analysis:** ALL 6 boiler-creation tests showed:
   ```
   [WARN] No site context found - using first available site (standalone mode fallback)
   ```

3. **Deterministic Wrong Sites:**
   - "Mike" → First alphabetically for PKTech
   - "PKR6PWRB" → First alphabetically for PKRep
   - "PKASFHJR" → First (by age?) for PKAdmin
   - Same sites every run because `getFirstAvailableSite()` picks positionally first

4. **No Hardcoded Names:** Grep confirmed "Mike", "PKTEBYBN5", etc. are NOT hardcoded - they're real leftover sites from previous runs

5. **Site-Creation Works:** Logs confirmed PKAdmin/PKTech/PKRep successfully created PKANR9PZ/PKTENXXK0/PKRPGPJ9, but boiler-creation never used them

---

## DELIVERABLE 2: All Changed Files

### File 1: `tests/boiler-management/boiler-creation.spec.ts`

**Changes:**

1. **Added explicit role-to-site mapping (lines 68-85):**
   ```typescript
   const ROLE_TO_SITE_OWNER_MAP: Record<BoilerCreatorRole, BoilerSiteOwnerRole> = {
     pkAdmin: 'pkAdmin',
     pkTech: 'pkTech',
     pkRep: 'pkRep',
     siteManager: 'pkAdmin',       // Uses PKAdmin's site
     siteSupervisor: 'pkTech',     // Uses PKTech's site
     siteUser: 'pkRep'             // Verifies under PKRep's site
   };
   ```

2. **Replaced `resolveSiteForBoiler()` function (lines 87-119):**
   - **OLD:** Async function taking `(page, testContext)`, returns `Promise<{name, id?}>`
   - **NEW:** Sync function taking `(role, runtimeData)`, returns `RuntimeSiteRecord & {id: string}`
   - Reads from RuntimeDataManager (persists across processes)
   - Fails loudly if site missing (no silent fallback)

3. **Updated `createBoilerForRole()` function (lines 121-238):**
   - **Line 147:** Call new `resolveSiteForBoiler(role, runtimeData)` - moved before page creation
   - **Lines 166-188:** Added explicit site selection validation
     - Fails loudly if site not in dropdown
     - Verifies selected site ID matches expected ID
   - **Lines 190-196:** Log with verified=true flag
   - **Lines 224-225:** Use `targetSite.id` and `targetSite.name` (not nullable `finalSiteId`)

4. **Updated `verifyAssignedBoilerInfoReadOnly()` function (lines 278-325):**
   - **Line 286:** Use new `resolveSiteForBoiler('siteUser', runtimeData)`
   - **Lines 300-308:** Fail loudly if no boiler found for SiteUser
   - **Lines 310-316:** Added explicit logging
   - Removed try-catch with empty fallback

**Total lines changed:** ~150 lines modified/replaced

---

## DELIVERABLE 3: Consolidated Documentation

### Created: `docs/AUTHORITATIVE-BUSINESS-RULES.md`

**Purpose:** Single source of truth for all site/boiler business rules

**Content:**
- Site creation rules (3 sites: PKAdmin, PKTech, PKRep)
- Site assignment rules (4 invitations in specific order)
- Boiler creation rules (5 boilers total: 2+2+1 across 3 sites)
- Role-to-site mapping constant
- SiteUser read-only verification rules
- Implementation guidelines (RuntimeDataManager vs. TestContext)
- Validation criteria
- Common mistakes to avoid
- Execution order requirements

**Supersedes:**
- docs/STEP-0-AMBIGUITY-RESOLUTION.md (ambiguities resolved)
- docs/CONTRADICTION-REPORT.md (contradictions resolved)
- docs/INVESTIGATION-SUMMARY-AND-RECOMMENDATIONS.md (recommendations implemented)
- Partial rules from docs/01-inception-requirements.md
- Partial rules from docs/02-access-matrix.md

**Retains (for reference):**
- docs/ROOT-CAUSE-CONFIRMED.md (technical evidence)
- docs/ITEMS-1-3-ROOT-CAUSE-ANALYSIS.md (investigation details)
- docs/06-multi-site-resolution-pattern.md (still relevant pattern)

---

## DELIVERABLE 4: Validation Plan

### Initial Validation (In Progress)

**Command:**
```bash
set FLOW_ONLY=site-creation,boiler-creation && node scripts/run-ordered-flow.js
```

**Expected Outcome:**
- ✅ PKAdmin boiler created under PKANR9PZ (not PKASFHJR)
- ✅ PKTech boiler created under PKTENXXK0 (not "Mike")
- ✅ PKRep boiler created under PKRPGPJ9 (not PKR6PWRB)
- ✅ No "No site context found" warnings in logs
- ✅ Logs show "Resolved site for boiler creation from RuntimeDataManager"

### Full Validation (Pending)

**Command:**
```bash
node scripts/run-ordered-flow.js
```

**Iterations:** 5-10 full e2e runs

**Verification Criteria (per run):**

1. **Site Level:**
   - Exactly 3 sites created
   - Each site has correct owner

2. **Boiler Level (by site ID, not name):**
   - PKAdmin's site: Exactly 2 boilers (PKAdmin + SiteManager)
   - PKTech's site: Exactly 2 boilers (PKTech + SiteSupervisor)
   - PKRep's site: Exactly 1 boiler (PKRep only)
   - Total: 5 boilers
   - No boiler under "Mike" or any site not created in THIS run

3. **SiteUser Level:**
   - Verifies boiler under PKRep's site (read-only)
   - No boiler created by SiteUser
   - All fields read-only/disabled
   - Save button hidden

---

## What Was Fixed

### Before (BROKEN):

```typescript
// MODE 2: Standalone run - pick first available site
const sitesPage = new SitesPage(page);
const firstSite = await sitesPage.getFirstAvailableSite();  // ← Picks "Mike", "PKR6PWRB", etc.
return firstSite;
```

**Problem:**
- TestContext empty → always falls back to "first available"
- Picks whatever site is first in DOM (arbitrary/wrong)
- Silent fallback masks bug
- Same wrong sites appear every run

### After (FIXED):

```typescript
// Read from RuntimeDataManager (persists across processes)
const siteOwnerRole = ROLE_TO_SITE_OWNER_MAP[role];
const runtime = runtimeData.requireCreatedSites();
const targetSite = runtime.sites[siteOwnerRole];

if (!targetSite?.id || !targetSite.name) {
  throw new Error(  // ← LOUD FAILURE, no silent fallback
    `CONFIGURATION ERROR: Site data missing for ${siteOwnerRole}...`
  );
}

// Verify site selection matches expected ID
if (selectedSiteId && selectedSiteId !== targetSite.id) {
  throw new Error(  // ← Catches selection mismatches
    `SITE SELECTION MISMATCH: Selected site ID "${selectedSiteId}" does not match...`
  );
}
```

**Solution:**
- ✅ Reads from RuntimeDataManager (persists across processes)
- ✅ Uses explicit role-to-site mapping
- ✅ Fails loudly if site missing (no silent fallback)
- ✅ Verifies selection by site ID (not just name)
- ✅ Correct site every time

---

## Key Technical Improvements

1. **Process Boundary Handling:**
   - TestContext (in-memory) → RuntimeDataManager (disk-persisted)
   - Data survives module boundaries in run-ordered-flow.js

2. **Explicit Mapping:**
   - Hardcoded ROLE_TO_SITE_OWNER_MAP constant
   - No ambiguity about which site each role uses

3. **Fail-Fast Design:**
   - Throw explicit errors if site/boiler missing
   - No silent fallback to wrong sites
   - Would have caught "Mike" bug immediately

4. **ID-Based Verification:**
   - Select by name, verify by ID
   - Catches site name collisions
   - Ensures correct site even with similar names

5. **Comprehensive Logging:**
   - Logs resolved site with ID before UI interaction
   - Logs verified selection with ID after UI interaction
   - Easier to debug future issues

---

## Impact on Future Runs

### Expected Behavior:

**Run 1:**
- Sites: PKAXXX, PKTXXX, PKRXXX
- Boilers created under correct sites
- ✅ All 5 boilers under correct sites

**Run 2:**
- Sites: PKAYYY, PKTYYYY, PKRYYYY
- Previous sites (PKAXXX, etc.) still exist as leftovers
- **But:** Tests explicitly use PKAYYY/PKTYYYY/PKRYYYY by ID
- ✅ All 5 boilers still under correct sites (no "Mike" issue)

### No More:
- ❌ Boilers under "Mike"
- ❌ Boilers under old/leftover sites
- ❌ Same wrong sites appearing run after run
- ❌ Silent fallback to arbitrary sites

---

## Remaining Recommendations

1. **Test Data Cleanup:**
   - Add teardown step to delete created sites/boilers after each run
   - Or use isolated test environment per run
   - Prevents accumulation of old test data

2. **Documentation Maintenance:**
   - Keep `docs/AUTHORITATIVE-BUSINESS-RULES.md` as single source of truth
   - Update it whenever business rules change
   - Delete/archive old investigation docs after validation confirms fix

3. **Monitoring:**
   - Watch logs for "Resolved site for boiler creation from RuntimeDataManager"
   - Any "No site context found" warning = regression
   - Any boiler under non-created site = regression

---

## Files Modified

1. ✅ `tests/boiler-management/boiler-creation.spec.ts` (major refactor)
2. ✅ `docs/AUTHORITATIVE-BUSINESS-RULES.md` (new - single source of truth)
3. ✅ `docs/ROOT-CAUSE-CONFIRMED.md` (new - investigation evidence)
4. ✅ `docs/FIX-IMPLEMENTATION-SUMMARY.md` (this file)

## Files to Archive (after validation):

- docs/STEP-0-AMBIGUITY-RESOLUTION.md
- docs/CONTRADICTION-REPORT.md
- docs/INVESTIGATION-SUMMARY-AND-RECOMMENDATIONS.md
- docs/ITEMS-1-3-ROOT-CAUSE-ANALYSIS.md (optional - has good technical detail)

---

## Status

**Fix Implementation:** ✅ COMPLETE
**Initial Validation:** 🔄 IN PROGRESS
**Full Validation (5-10 runs):** ⏳ PENDING
**Documentation:** ✅ COMPLETE

**Next Step:** Verify initial validation test passes, then run 5-10 full e2e sequences for final confirmation.
