---
noteId: "8cd00310804411f18a0633e80ce9c50d"
tags: []

---

# Multi-Site Per User Resolution Pattern

## Problem Statement

The inception requirements intentionally design for **user accounts to be associated with multiple sites**:

> "Site Manager reuses the Supervisor email previously invited by PKTech and assigns that existing Supervisor to the PKAdmin-created site."

This means:
- PKTech invites Supervisor to PKTech-created site
- Site Manager later assigns the SAME Supervisor account to PKAdmin-created site
- Result: One Supervisor account is associated with TWO different sites

This is the **intended business requirement**, not a bug.

##Root Cause of Test Failures

The framework was resolving sites by **user identity** (email/role) and **site name** rather than by explicit **site ID**, causing wrong-site selection when users had multiple sites.

### Evidence from Code:

1. **Name-Based Site Matching (Ambiguous):**
   ```typescript
   // src/pages/sites/sitesPage.ts:125
   siteResult(siteName: string): Locator {
     return this.byTestId(`site-result-${siteName}`)
       .or(this.page.locator('.sites-list:visible md-list-item').filter({ hasText: siteName }))
       .or(this.page.locator('.sites-list:visible .each-site').filter({ hasText: siteName }));
   }
   ```
   - `.filter({ hasText: siteName })` matches ANY site containing that text
   - When multiple sites match, `.first()` picks the first DOM element - **not necessarily the correct site**

2. **Last-Site Fallback (Arbitrary):**
   ```typescript
   // src/services/data/availableDataService.ts:21-22
   async getLatestAvailableSiteForRole(role: RoleKey): Promise<RuntimeSiteRecord | undefined> {
     return (await this.getAvailableSitesForRole(role)).at(-1);
   }
   ```
   - Returns the **last** site from API response
   - For users with multiple sites, "last" is arbitrary and depends on API response order

3. **Name-Based API Resolution:**
   ```typescript
   // tests/boiler-management/boiler-creation.spec.ts:112
   const availableSite = await availableData.getAvailableSiteForRoleByName(role, selectedSiteName);
   ```
   - Queries API for site BY NAME for that role
   - If multiple sites have similar names, wrong one may be returned

### Test Failure Pattern:

- **PKRep boiler-creation:** Expected site PKRI2O5Q, got PKR25KBK (both PKRep sites, wrong one selected)
- **Site Manager site-update:** Expected "Updated Automation site CGSO6", got "Automation site Q3E77" (both PKAdmin-owner sites Site Manager has access to)
- **Site Supervisor site-update:** Expected "Updated Automation site RAT4W", got "Automation site HE0IN" (both PKTech-owner sites Site Supervisor has access to)

All failures follow the same pattern: **test operated on wrong site from user's multi-site list**.

## Solution: ID-Based Site Resolution

**Fix Strategy:** The framework MUST use **site ID** for all selection/navigation/verification operations, never rely on name-only matching or position assumptions.

### Implementation Rules:

1. **Runtime Data Passing:**
   - Tests MUST pass explicit `site.id` from runtime data through all steps
   - Never re-query "latest" or "first" site for a user—use the specific site ID the test created/intends to act on

2. **Page Object Methods:**
   - Add ID-based site selection: `openSiteById(siteId)`, `verifySiteById(siteId)`
   - When name-based search is required (UI constraint), ALWAYS verify the opened site matches the expected ID

3. **API Queries:**
   - Use `getAvailableSiteForRoleById(role, siteId)` instead of `ByName` or `Latest`
   - Only fall back to name-based queries when ID is genuinely unavailable

4. **Boiler Site Selection:**
   - After selecting a site in the boiler form, verify the selection matches the intended site ID
   - Never assume the selected site name uniquely identifies the site

### Code Pattern:

```typescript
// ✅ CORRECT: Pass site ID explicitly
const targetSite = runtimeData.requireCreatedSites().sites['pkAdmin'];
await sitesPage.openSiteById(targetSite.id); // Use ID
await sitesPage.verifyCurrentSiteId(targetSite.id); // Verify by ID

// ❌ WRONG: Derive site by position/name
const sites = await availableData.getAvailableSitesForRole('siteManager');
const targetSite = sites.at(-1); // Arbitrary!
await sitesPage.openSiteFromSearch(targetSite.name); // Ambiguous if multiple matches
```

## Testing Multi-Site Scenarios

When validating fixes:
1. Run tests where the same user (e.g., Site Supervisor) is assigned to multiple sites
2. Verify the test always operates on the INTENDED site, not just "a site"
3. Check that site ID appears in logs/debug output for traceability

## Related Files

- `src/pages/sites/sitesPage.ts` - Site page object (needs ID-based methods)
- `src/pages/boilers/boilersPage.ts` - Boiler page object (site selection verification)
- `src/services/data/availableDataService.ts` - API data queries (has ID-based methods, use them!)
- `tests/site-management/site-update.spec.ts` - Site update tests
- `tests/boiler-management/boiler-creation.spec.ts` - Boiler creation tests
- `docs/01-inception-requirements.md` - Original multi-site design requirement
