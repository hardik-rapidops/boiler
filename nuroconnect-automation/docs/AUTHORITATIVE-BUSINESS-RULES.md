---
noteId: "752c9940810611f18ae5f59843a20cbf"
tags: []

---

# Authoritative Business Rules: Site & Boiler Management

**Status:** ✅ OFFICIAL - This is the single source of truth

**Supersedes:** All previous ambiguity/investigation docs, partial rule descriptions in inception-requirements.md and access-matrix.md

**Last Updated:** 2026-07-16

---

## Site Creation Rules

**Creators:** Only PKAdmin, PKTech, and PKRep can create sites.

**Per E2E Run:**
- PKAdmin creates **ONE** site (e.g., PKANR9PZ)
- PKTech creates **ONE** site (e.g., PKTENXXK0)
- PKRep creates **ONE** site (e.g., PKRPGPJ9)

**Total sites per run:** 3

**Non-Creators:** SiteManager, SiteSupervisor, and SiteUser **CANNOT** create sites.

---

## Site Assignment (Invitation) Rules

**Assignment Chain:**

1. **PKAdmin** invites **SiteManager** to PKAdmin's site
2. **PKTech** invites **SiteSupervisor** to PKTech's site
3. **PKRep** invites **SiteUser** to PKRep's site
4. **SiteManager** (now assigned to PKAdmin's site) invites **SiteSupervisor** to PKAdmin's site

**Result:** SiteSupervisor is assigned to **TWO** sites:
- PKTech's site (from rule 2)
- PKAdmin's site (from rule 4)

**Cannot Invite:** SiteSupervisor and SiteUser cannot invite anyone from any site.

---

## Boiler Creation Rules

### Who Creates Where

| Role | Creates Boiler Under | Count Per Run | Notes |
|------|---------------------|---------------|-------|
| **PKAdmin** | PKAdmin's own site | 1 | Creator creates under own site |
| **PKTech** | PKTech's own site | 1 | Creator creates under own site |
| **PKRep** | PKRep's own site | 1 | Creator creates under own site |
| **SiteManager** | PKAdmin's site | 1 | Creates under assigned site (not own, because SiteManager doesn't create sites) |
| **SiteSupervisor** | PKTech's site | 1 | Creates under **PKTech's** site (assigned via rule 2), **NOT** PKAdmin's site |
| **SiteUser** | N/A | 0 | **CANNOT CREATE** - read-only verification only |

### Per-Site Boiler Count

After a full e2e run, each site should have:

- **PKAdmin's site:** 2 boilers
  - 1 created by PKAdmin
  - 1 created by SiteManager

- **PKTech's site:** 2 boilers
  - 1 created by PKTech
  - 1 created by SiteSupervisor

- **PKRep's site:** 1 boiler
  - 1 created by PKRep
  - SiteUser verifies this boiler (read-only), but does NOT create any

**Total boilers per run:** 5

---

## SiteUser Read-Only Verification

**What:** SiteUser performs **READ-ONLY** verification of boiler information

**Which Boiler:** The boiler created by PKRep under PKRep's site

**Which Site:** PKRep's site (the site SiteUser is assigned to via rule 3)

**Actions:**
- ✅ Can search for the boiler
- ✅ Can open boiler details
- ✅ Can view boiler information
- ❌ **CANNOT** create a new boiler
- ❌ **CANNOT** edit/save boiler information
- ❌ **CANNOT** see Save button

---

## Implementation: Role-to-Site Mapping

**Constant (in code):**

```typescript
const ROLE_TO_SITE_OWNER_MAP: Record<BoilerCreatorRole, BoilerSiteOwnerRole> = {
  pkAdmin: 'pkAdmin',           // Creates under own site
  pkTech: 'pkTech',             // Creates under own site
  pkRep: 'pkRep',               // Creates under own site
  siteManager: 'pkAdmin',       // Creates under PKAdmin's site (assigned)
  siteSupervisor: 'pkTech',     // Creates under PKTech's site (assigned)
  siteUser: 'pkRep'             // Verifies under PKRep's site (assigned, read-only)
};
```

**Resolution Logic:**

1. Read site from RuntimeDataManager (persists across process boundaries)
2. Use site ID for all operations (not name to avoid collision)
3. Fail loudly if expected site is missing (no silent fallback)
4. Verify selected site ID matches expected ID after UI selection

---

## Why SiteSupervisor Uses PKTech's Site (Not PKAdmin's)

**Question:** SiteSupervisor is assigned to TWO sites (PKTech's and PKAdmin's via rule 4). Why does it create boilers under PKTech's site and not PKAdmin's?

**Answer:** Business rule priority - the **primary assignment** (rule 2: PKTech invites SiteSupervisor) takes precedence over the **secondary assignment** (rule 4: SiteManager invites SiteSupervisor to PKAdmin's site).

**Rationale:**
- PKTech's site: Direct invitation from PK-role to SiteSupervisor
- PKAdmin's site: Indirect invitation via SiteManager (who was invited first)
- Boiler creation uses the **primary/direct assignment**

---

## Validation Criteria

After a successful full e2e run, verify by **site ID** (not name):

### Site Level:
- ✅ Exactly 3 sites created
- ✅ Each site has correct owner (PKAdmin, PKTech, PKRep)
- ✅ Each site has correct assignments per rules 1-4

### Boiler Level:
- ✅ PKAdmin's site: 2 boilers (PKAdmin + SiteManager)
- ✅ PKTech's site: 2 boilers (PKTech + SiteSupervisor)
- ✅ PKRep's site: 1 boiler (PKRep only)
- ✅ Total: 5 boilers
- ✅ No boiler under wrong site
- ✅ No boiler under old/leftover sites (e.g., "Mike")

### SiteUser Level:
- ✅ SiteUser can see PKRep's boiler
- ✅ All boiler fields are read-only/disabled
- ✅ Save button is hidden
- ✅ No boiler was created by SiteUser

---

## Common Mistakes to Avoid

### ❌ WRONG: Using TestContext for cross-process data

```typescript
// DON'T DO THIS - TestContext is destroyed between modules
const site = testContext.getCurrentSiteName();
```

**Why Wrong:** TestContext is in-memory singleton that doesn't persist when the process exits

### ✅ CORRECT: Using RuntimeDataManager

```typescript
// DO THIS - RuntimeDataManager persists to disk
const runtime = runtimeData.requireCreatedSites();
const site = runtime.sites['pkAdmin'];
```

### ❌ WRONG: Silent fallback to "first available site"

```typescript
// DON'T DO THIS - masks bugs
const site = await getFirstAvailableSite();
```

**Why Wrong:** Picks arbitrary/wrong sites deterministically (e.g., "Mike")

### ✅ CORRECT: Explicit error if site missing

```typescript
// DO THIS - fail loudly
if (!site) {
  throw new Error('Site missing - run site-creation first');
}
```

### ❌ WRONG: Selecting sites by name only

```typescript
// DON'T DO THIS - name collision possible
await selectSite('PKANR9PZ');
```

**Why Wrong:** Multiple sites could have similar names, or old leftover sites could match

### ✅ CORRECT: Selecting by name, verifying by ID

```typescript
// DO THIS - verify ID matches
const selected = await selectSite(site.name);
const selectedId = await getSelectedSiteId();
if (selectedId !== site.id) {
  throw new Error('Site selection mismatch');
}
```

---

## Execution Order Requirements

**Module Sequence (via run-ordered-flow.js):**

1. site-creation
2. site-invitation
3. site-search
4. **boiler-creation** ← Depends on sites existing
5. boiler-info ← Depends on boilers existing
6. site-update
7. site-unassignment

**Critical Dependencies:**
- Boiler-creation **MUST** run after site-creation (needs sites)
- Boiler-creation **MUST** run after site-invitation (SiteManager/SiteSupervisor need assignments)
- Each module runs as separate process - data must persist via RuntimeDataManager, not in-memory

---

## Test Data Cleanup

**Current State:** No automatic cleanup - sites/boilers accumulate in test environment

**Impact:** Old sites (e.g., "Mike", "PKR6PWRB") remain visible and can be selected by "first available" fallback

**Recommendation:** Add teardown/cleanup step or run tests against isolated environment per run

---

## Changes from Previous Docs

### What Changed:
1. **Clarified SiteSupervisor creates under PKTech's site** (not PKRep's or PKAdmin's)
2. **Clarified SiteUser verifies under PKRep's site** (not PKTech's)
3. **Consolidated fragmented rules** from inception-requirements.md, access-matrix.md, and investigation docs
4. **Removed contradictions** between original "new rules" and current implementation
5. **Added explicit role-to-site mapping** constant for implementation

### What Was Superseded:
- docs/STEP-0-AMBIGUITY-RESOLUTION.md → Ambiguities resolved here
- docs/CONTRADICTION-REPORT.md → Contradictions resolved here
- docs/ITEMS-1-3-ROOT-CAUSE-ANALYSIS.md → Technical investigation (retain for reference)
- docs/INVESTIGATION-SUMMARY-AND-RECOMMENDATIONS.md → Recommendations implemented here
- Partial rules in docs/01-inception-requirements.md → Consolidated here
- Partial rules in docs/02-access-matrix.md → Consolidated here

### What to Keep:
- docs/ROOT-CAUSE-CONFIRMED.md → Technical evidence (reference)
- docs/03-locator-strategy.md → Unrelated to this task
- docs/04-test-strategy.md → General strategy (update if needed)
- docs/05-environment-strategy.md → Unrelated to this task
- docs/06-multi-site-resolution-pattern.md → Technical pattern (still relevant)

---

## Summary: The 3-Sites, 5-Boilers Rule

**Remember:**
- 3 sites (PKAdmin, PKTech, PKRep)
- 5 boilers total (2 + 2 + 1)
- Site-to-boiler mapping is **strict** (no flexibility)
- Verified by **site ID** (not name)
- Persisted via **RuntimeDataManager** (not TestContext)
- Fails **loudly** if wrong (no silent fallback)

**This is the authoritative source of truth. All implementation, tests, and documentation should align with these rules.**
