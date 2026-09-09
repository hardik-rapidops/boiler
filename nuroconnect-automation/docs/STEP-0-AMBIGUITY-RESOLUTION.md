---
noteId: "e04ff55080f711f18ae5f59843a20cbf"
tags: []

---

# STEP 0: Business Rules Ambiguity Resolution

## Executive Summary

This document resolves critical ambiguities between the **NEW business rules** provided and the **CURRENT implementation** in the framework. Two major discrepancies were found that could explain the "wrong site" failures in recent test runs.

---

## Critical Findings

### Current vs. New Requirements Comparison

| Role | Site Assignment (CURRENT & NEW - MATCH) | Boiler Creation Site (CURRENT) | Boiler Creation Site (NEW) | Status |
|------|----------------------------------------|-------------------------------|----------------------------|---------|
| PKAdmin | Creates PKAdmin site | PKAdmin site | PKAdmin site | ✓ MATCH |
| PKTech | Creates PKTech site | PKTech site | PKTech site | ✓ MATCH |
| PKRep | Creates PKRep site | PKRep site | PKRep site | ✓ MATCH |
| SiteManager | Assigned to PKAdmin site (rule 2) | PKAdmin site | PKAdmin site | ✓ MATCH |
| **SiteSupervisor** | **Assigned to PKTech site (rule 3) AND PKAdmin site (rule 5)** | **PKTech site** | **PKRep site** | ❌ MISMATCH |
| **SiteUser** | **Assigned to PKRep site (rule 4)** | **PKRep site (verify only)** | **PKTech site (verify only)** | ❌ MISMATCH |

---

## Ambiguity #1: SiteSupervisor Creating Boiler Under PKRep's Site

### Current Implementation
- **File:** `tests/boiler-management/boiler-creation.spec.ts:477-492`
- **Code:** `createBoilerForAssignedSite('siteSupervisor', 'pkTech', ...)`
- **Behavior:** SiteSupervisor creates boiler under PKTech's site

### Current Documentation
- **File:** `docs/02-access-matrix.md:89`
- **Statement:** "Site Supervisor creates a Boiler under the assigned PKTech-created Site."
- **File:** `docs/01-inception-requirements.md:107`
- **Statement:** "Site Manager and Site Supervisor can create Boilers only for Sites directly assigned to them."

### New Requirement (Per User)
- **Boiler Creation Rule 5:** "SiteSupervisor creates a boiler under the site PKRep created."

### Assignment Path Analysis
According to BOTH current and new assignment rules:
1. PKTech invites SiteSupervisor to PKTech's site (assignment rule 3) ✓
2. SiteManager invites SiteSupervisor to PKAdmin's site (assignment rule 5) ✓

**Result:** SiteSupervisor is assigned to:
- PKTech's site ✓
- PKAdmin's site ✓
- PKRep's site ❌ **NO ASSIGNMENT PATH EXISTS**

### The Problem
**How can SiteSupervisor create a boiler under PKRep's site when:**
1. No assignment rule grants SiteSupervisor access to PKRep's site?
2. Current docs explicitly state "can create Boilers only for Sites directly assigned to them"?
3. PKRep invites SiteUser (not SiteSupervisor) per assignment rule 4?

### Possible Resolutions
1. **Missing Assignment Rule:** Add new rule: "PKRep invites SiteSupervisor to PKRep's site" before boiler creation
2. **Cross-Site Access:** Application allows PK-role-invited users (SiteSupervisor) to access all PK-owned sites without explicit assignment
3. **Error in New Requirements:** New rule is incorrect; SiteSupervisor should remain on PKTech's site
4. **Role Privilege:** SiteSupervisor role has elevated cross-site access not documented

### Recommended Investigation
- [ ] Check Access Matrix table: Does "Create boiler on assigned site" for SiteSupervisor mean ONLY assigned, or can it access other sites?
- [ ] Test actual app behavior: Log in as SiteSupervisor after current assignment flow and check which sites are visible in site dropdown
- [ ] Review API responses: Does `getAvailableSitesForRole('siteSupervisor')` return PKRep's site?
- [ ] Check historical test runs: Has SiteSupervisor ever successfully created a boiler under PKRep's site in production/QA?

---

## Ambiguity #2: SiteUser Verifying Boiler Under PKTech's Site

### Current Implementation
- **File:** `tests/boiler-management/boiler-creation.spec.ts:260-307` (function `verifyAssignedBoilerInfoReadOnly`)
- **Code (line 285):** `const pkRepSite = runtimeSites['pkRep'];`
- **Behavior:** SiteUser verifies boiler under PKRep's site (read-only)

### Current Documentation
- **File:** `docs/02-access-matrix.md:90`
- **Statement:** "Site User cannot create a Boiler and Boiler information is read-only."
- **Does NOT specify which site** SiteUser verifies boilers on

### New Requirement (Per User)
- **Boiler Creation Rule 6:** "SiteUser CANNOT create a boiler. SiteUser only performs READ-ONLY verification of boiler-info under the site PKTech created."

### Assignment Path Analysis
According to BOTH current and new assignment rules:
1. PKRep invites SiteUser to PKRep's site (assignment rule 4) ✓

**Result:** SiteUser is assigned to:
- PKRep's site ✓
- PKTech's site ❌ **NO ASSIGNMENT PATH EXISTS**

### The Problem
**How can SiteUser verify boiler-info under PKTech's site when:**
1. No assignment rule grants SiteUser access to PKTech's site?
2. SiteUser is only assigned to PKRep's site (assignment rule 4)?
3. PKTech invites SiteSupervisor (not SiteUser) per assignment rule 3?

### Possible Resolutions
1. **Missing Assignment Rule:** Add new rule: "PKTech invites SiteUser to PKTech's site" before boiler-info verification
2. **Cross-Site Read Access:** Application allows read-only access to boilers across sites without explicit site assignment
3. **Error in New Requirements:** New rule is incorrect; SiteUser should remain on PKRep's site
4. **Role Privilege:** SiteUser role has read-only cross-site access not documented

### Recommended Investigation
- [ ] Check Access Matrix table: Does "Edit boiler information on assigned site: Read only" mean ONLY assigned site, or any site?
- [ ] Test actual app behavior: Log in as SiteUser after current assignment flow and check which sites' boilers are visible
- [ ] Review API responses: Does `getAvailableSitesForRole('siteUser')` or boiler search return boilers from PKTech's site?
- [ ] Check if "Read only" access is granted at the boiler level vs. site level (i.e., can see all boilers but only edit assigned-site boilers)

---

## Impact on "Wrong Site" Failures

The ambiguities above directly explain recent test failures mentioned in `docs/06-multi-site-resolution-pattern.md`:

> - **PKRep boiler-creation:** Expected site PKRI2O5Q, got PKR25KBK (both PKRep sites, wrong one selected)
> - **Site Manager site-update:** Expected "Updated Automation site CGSO6", got "Automation site Q3E77"
> - **Site Supervisor site-update:** Expected "Updated Automation site RAT4W", got "Automation site HE0IN"

If the new rules are correct and require cross-site access:
- Tests must explicitly track and target THREE named sites (PKAdmin, PKTech, PKRep) by ID
- Cannot rely on "latest available site" or name-based matching
- Need to verify users can actually SEE the target site before attempting operations

If the new rules are incorrect:
- Current implementation is correct
- No code changes needed beyond ID-based site resolution (already documented in 06-multi-site-resolution-pattern.md)

---

## Reconciliation with Existing Documentation

### docs/02-access-matrix.md (Lines 16-17)

| Capability | SiteSupervisor | SiteUser |
|-----------|----------------|----------|
| Create boiler on assigned site | Yes | No |
| Edit boiler information on assigned site | Yes | Read only |

**Key phrase:** "on assigned site"

**Current interpretation:** Can ONLY operate on sites they are assigned to.

**New requirements interpretation:** May need to operate on non-assigned sites.

**Resolution needed:** Clarify whether "assigned site" is:
- **Restrictive:** ONLY sites explicitly assigned via invitation
- **Permissive:** Any site visible to that user's role level

### docs/01-inception-requirements.md (Lines 106-108)

> - PKAdmin selects the latest PKAdmin-created Site, PKTech selects the latest PKTech-created Site, and PKRep selects the latest PKRep-created Site.
> - Site Manager and Site Supervisor can create Boilers only for Sites directly assigned to them.
> - Site User cannot create Boilers. Site User Boiler information must be read-only and the Save control must not be visible.

**Conflict:** "can create Boilers only for Sites directly assigned to them" contradicts new rule for SiteSupervisor to create under PKRep (unassigned).

---

## Recommended Next Steps (Before Implementation)

### Option A: Validate Against Actual Application
1. Run manual test in target environment:
   - Complete site creation (PKAdmin, PKTech, PKRep)
   - Complete all current assignments (rules 1-6)
   - Log in as SiteSupervisor → Check site dropdown → Can PKRep's site be selected?
   - Log in as SiteUser → Check boiler search/list → Are PKTech's boilers visible?
2. Document actual app behavior as source of truth
3. Update requirements/tests to match reality

### Option B: Confirm Business Intent with Product Owner
Present this document to product/business owner with questions:
1. **SiteSupervisor + PKRep:** Is this a new feature requirement (needs app enhancement) or existing capability (needs assignment rule added)?
2. **SiteUser + PKTech:** Is cross-site read-only access intentional, or should SiteUser only see PKRep boilers?
3. Should we add missing assignment steps, or is role-based access sufficient?

### Option C: Assume Errors in New Requirements
If new requirements cannot be validated:
- Revert to current documented behavior (SiteSupervisor on PKTech, SiteUser on PKRep)
- Proceed with implementing ID-based site resolution per `06-multi-site-resolution-pattern.md`
- Focus on fixing "wrong site selection" rather than changing which sites roles access

---

## Decision Required

**Before proceeding to STEP 1 (documentation) or STEP 3 (implementation), I need explicit direction:**

1. **Should I validate against the actual application?** (Option A - requires access to test environment)
2. **Should I ask you to confirm business intent?** (Option B - requires product owner input)
3. **Should I proceed with current documented behavior?** (Option C - safest path, keeps existing business rules)
4. **Should I implement the new rules AS STATED with additional assignment steps?** (Requires adding 2 new invitation scenarios)

**Please advise which path to take before I continue with STEP 1 documentation and STEP 2 audit.**
