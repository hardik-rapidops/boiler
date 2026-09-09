---
noteId: "1b73684080ff11f18ae5f59843a20cbf"
tags: []

---

# Investigation Summary & Recommendations

## Status: AWAITING USER DECISION

**Critical decision required before proceeding with implementation.**

---

## Investigation Findings Summary

### DELIVERABLE 1: Rule Contradiction Resolution

**Document:** `docs/CONTRADICTION-REPORT.md`

**Finding:** Direct contradiction between original task requirements and current investigation expectations for items 5-6.

| Role | Original "New Rules" | Current Investigation | Current Docs (Authoritative) |
|------|---------------------|----------------------|----------------------------|
| SiteSupervisor | PKRep's site | **PKTech's site** | **PKTech's site** |
| SiteUser | PKTech's site | **PKRep's site** | **PKRep's site** (implied) |

**Recommendation:** Proceed with current documented rules (PKTech for SiteSupervisor, PKRep for SiteUser).

**Rationale:**
- Current docs have no assignment gaps
- Current implementation was designed around these rules
- Original "new rules" created logical impossibilities
- My STEP-0 ambiguity analysis was correct

**⚠️ BLOCKING: Cannot proceed with items 5-6 until you confirm this resolution.**

---

### DELIVERABLE 2: Root Cause for Items 1-3

**Document:** `docs/ITEMS-1-3-ROOT-CAUSE-ANALYSIS.md`

**Finding:** ALL boiler-creation tests are selecting wrong sites because TestContext is empty.

**Root Cause #1:** TestContext doesn't persist across module boundaries
- Each module runs as a separate Node.js process (`spawnSync`)
- TestContext is in-memory singleton
- Created fresh (empty) in each new process
- Site-creation sets context → process exits → context destroyed
- Boiler-creation starts with empty context → falls back to "first available site"

**Root Cause #2:** TestContext only tracks ONE site
- Single `_currentSiteName` field
- Three roles each call `setCurrentSite()` → each overwrites previous
- Even if it persisted, only last site (PKRep's) would be retained

**Why RuntimeDataManager Works:** Persists to disk (`sites.runtime.json`), survives process boundaries

**Evidence from Logs:**

```
[WARN] No site context found - using first available site (standalone mode fallback)
```
This appears for **EVERY SINGLE boiler-creation test**.

---

### DELIVERABLE 3: Confirmation of Items 4, 5, 6

#### Item 4: SiteManager ✅ APPEARS Correct (But Actually Lucky)

**Result:** Boiler 00:0D:E1:00:0C:EB under PKANR9PZ (PKAdmin's site)

**Expected:** Boiler under PKAdmin's site (per docs/02-access-matrix.md:88)

**Status:** ✅ Match

**But:** Log shows "Selecting first Site available in Boiler form" - SiteManager ALSO fell back to "first available" mode. It just happened that the first available site in SiteManager's dropdown was PKANR9PZ, which is also the correct site.

**Verification:**
- Site ID d9351ced-2f3f-4eb6-bbea-61cd46994daf is confirmed as PKAdmin's PKANR9PZ
- PKAdmin invited SiteManager to this site (confirmed in log line 94-98)
- Boiler creation used this site (log line 829)
- Site-update later operated on same site ID (log line 15:08:30)

**Conclusion:** Accidentally correct, not intentionally correct.

#### Item 5: SiteSupervisor - Analysis Pending Contradiction Resolution

**Result:** Boiler 00:0D:E1:F3:D5:52 under PKTEBYBN5

**Expected (if current docs are authoritative):** PKTech's site PKTENXXK0

**Site ID:** PKTEBYBN5 = a281a924-348c-4127-ab31-211f5535f34f

**Status:** ⏸️ Need confirmation of which site PKTEBYBN5 actually is before final determination

**If PKTech site is correct:** Then PKTEBYBN5 ≠ PKTENXXK0, so this is WRONG

#### Item 6: SiteUser - Analysis Pending Contradiction Resolution

**Result:** SiteUser verified boiler under PKRPGPJ9 (PKRep's site)

**Expected (if current docs are authoritative):** PKRep's site (for read-only verification)

**Status:** ⏸️ Need to verify whether PKR PGPJ9 is genuinely PKRep's site from THIS run or coincidentally correct

---

### The "Mike" Site Mystery - SOLVED

**File:** `docs/ITEMS-1-3-ROOT-CAUSE-ANALYSIS.md` (section: "The 'Mike' Site Mystery Solved")

**Finding:** "Mike" is a **pre-existing site** in the test environment that wasn't created during this run.

**Evidence:**
- Never appears in site-creation logs for this run
- Has valid site ID: 01e7448a-f189-4422-aa1b-70ef1d7d73fa
- Accessible to PKTech's account
- First in PKTech's dropdown (alphabetically or by creation date)

**Source:** Likely leftover from previous test run, manual test data, or environment fixture

**Why It Matters:** Silent fallback to "first available" allowed test to proceed with unrelated site instead of failing loudly when context was missing.

---

## The Fix Strategy

### Immediate Action: Replace TestContext with RuntimeDataManager

**Current Broken Pattern:**
```typescript
const targetSite = await resolveSiteForBoiler(page, testContext);
// TestContext is empty → falls back to arbitrary "first available"
```

**Fixed Pattern:**
```typescript
// Define explicit role-to-site-owner mapping
const roleToSiteOwnerMap: Record<BoilerCreatorRole, BoilerSiteOwnerRole> = {
  pkAdmin: 'pkAdmin',
  pkTech: 'pkTech',
  pkRep: 'pkRep',
  siteManager: 'pkAdmin',    // Creates under PKAdmin's site
  siteSupervisor: 'pkTech',  // Creates under PKTech's site (per authoritative docs)
  siteUser: 'pkRep'          // Read-only under PKRep's site (per authoritative docs)
};

// Read from RuntimeDataManager which persists across processes
const runtime = runtimeData.requireCreatedSites();
const siteOwnerRole = roleToSiteOwnerMap[role];
const targetSite = runtime.sites[siteOwnerRole];

if (!targetSite?.id || !targetSite.name) {
  throw new Error(
    `Site data missing for ${siteOwnerRole}. ` +
    `Expected site to be created by ${siteOwnerRole} before ${role} creates a boiler. ` +
    `This is a test configuration error, not an application bug.`
  );
}

// Use the SPECIFIC site by ID, not "first available"
```

**Why This Works:**
- RuntimeDataManager persists to disk → survives process boundaries ✅
- Explicitly reads site by role key: `runtime.sites['pkAdmin']` ✅
- Fails loudly if site missing → no silent fallback ✅
- Same pattern already working for site-invitation ✅

### Remove TestContext from Boiler-Creation Entirely

**Finding:** TestContext was never going to work for cross-process flows.

**Action:** Remove `testContext` parameter and `resolveSiteForBoiler()` function from boiler-creation.spec.ts

**Keep TestContext For:** In-process flows like boiler tracking within a single module run (e.g., `addBoilerNumber()`)

---

## Required User Decision

**Before I can implement the fix, I need you to confirm:**

### Question 1: Rule Set Confirmation

Which rule set is authoritative for items 5-6?

- [ ] **Option A (RECOMMENDED):** Current docs are correct
  - SiteSupervisor creates boiler under PKTech's site
  - SiteUser verifies boiler under PKRep's site
  - No additional assignment steps needed
  - **Action:** Implement fix using current documented rules

- [ ] **Option B:** Original "new rules" are correct
  - SiteSupervisor creates boiler under PKRep's site
  - SiteUser verifies boiler under PKTech's site
  - Requires adding 2 new assignment steps (see STEP-0-AMBIGUITY-RESOLUTION.md)
  - **Action:** Add missing assignments, then implement fix

- [ ] **Option C:** Something else
  - Please specify the correct rules
  - **Action:** I'll adjust accordingly

### Question 2: Scope Confirmation

Should I proceed with:

- [ ] **Immediate fix only:** Fix boiler-creation site selection (items 1-5)
- [ ] **Full fix:** Fix + create `docs/role-site-boiler-matrix.md` + validation runs
- [ ] **Investigation only:** Stop here, you'll handle implementation

---

## Deliverables Completed

- [x] **Deliverable 1:** Explicit resolution of rule contradiction → `CONTRADICTION-REPORT.md`
- [x] **Deliverable 2:** Root cause for items 1-3 with "Mike" site explanation → `ITEMS-1-3-ROOT-CAUSE-ANALYSIS.md`
- [x] **Deliverable 3:** Confirmation (or correction) of items 4, 5, 6 → This document, section 3
- [ ] **Deliverable 4:** Diff of all changed files → PENDING your decision
- [ ] **Deliverable 5:** 5-10 stable runs with site-ID verification → PENDING implementation
- [ ] **Deliverable 6:** Updated `docs/role-site-boiler-matrix.md` → PENDING your decision

---

## My Recommendation

**Proceed with Option A + Full Fix:**

1. Confirm current docs are authoritative (SiteSupervisor→PKTech, SiteUser→PKRep)
2. Implement the RuntimeDataManager-based fix for all boiler-creation tests
3. Create `docs/role-site-boiler-matrix.md` to formalize the rules
4. Run 5-10 full e2e sequences with site-ID-level verification
5. Update any assertions that were checking wrong sites

**Expected Result:**
- PKAdmin boiler under PKANR9PZ ✅
- PKTech boiler under PKTENXXK0 ✅
- PKRep boiler under PKRPGPJ9 ✅
- SiteManager boiler under PKANR9PZ (PKAdmin's) ✅
- SiteSupervisor boiler under PKTENXXK0 (PKTech's) ✅
- SiteUser verifies boiler under PKRPGPJ9 (PKRep's) ✅

**No more "Mike" or wrong site issues** - every boiler lands exactly where business rules dictate, verified by site ID.

---

## Status: ⚠️ AWAITING YOUR CONFIRMATION TO PROCEED

Once you confirm Option A (or provide alternative direction), I'll immediately:
1. Update boiler-creation.spec.ts with the RuntimeDataManager-based fix
2. Create the role-site-boiler-matrix.md documentation
3. Run validation tests
4. Provide all diffs and confirmation of stable runs
