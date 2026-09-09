---
noteId: "7a76f1a080fe11f18ae5f59843a20cbf"
tags: []

---

# CONTRADICTION REPORT: Business Rules Conflict

## Critical Finding: Direct Contradiction Between Original Task and Current Investigation

**Status:** ⚠️ BLOCKING - Cannot proceed with items 5-6 until resolved

---

## The Contradiction

### Original Task Requirements (First Message)
You provided "new business rules" stating:

**Boiler Creation Rule 5:**
> "SiteSupervisor creates a boiler under the site PKRep created"

**Boiler Creation Rule 6:**
> "SiteUser only performs READ-ONLY verification of boiler-info under the site PKTech created"

### Current Investigation Expectations (Second Message)
You stated the expected behavior as:

**Item 5:**
> "SiteSupervisor created a boiler under incorrect site... where as per the rule SiteSupervisor will create a boiler under the site created by PKTech"

**Item 6:**
> "SiteUser verified a boiler info under the correct site PKRPGPJ9 [PKRep's site]"

### Current Authoritative Documentation
**File:** `docs/02-access-matrix.md:89`

```
- Site Supervisor creates a Boiler under the assigned PKTech-created Site.
```

**File:** `docs/02-access-matrix.md:90`
```
- Site User cannot create a Boiler and Boiler information is read-only.
```

**Note:** The docs don't explicitly state WHICH site SiteUser verifies boilers on, but the implication from "assigned site" pattern + current test implementation (line 285 of boiler-creation.spec.ts: `const pkRepSite = runtimeSites['pkRep']`) is **PKRep's site**.

---

## Conflict Summary Table

| Role | Original "New Rules" | Current Investigation | Current Docs | Current Implementation |
|------|---------------------|----------------------|--------------|----------------------|
| **SiteSupervisor** | PKRep site | **PKTech site** | **PKTech site** | PKTech site |
| **SiteUser** | PKTech site | **PKRep site** | (implicit) PKRep | **PKRep site** |

---

## Resolution Needed

**THREE POSSIBLE INTERPRETATIONS:**

### Interpretation A: Original Task Had Errors
- The "new business rules" in the first message were **incorrect**
- Current docs (PKTech for SiteSupervisor, PKRep for SiteUser) are **authoritative**
- My STEP-0 ambiguity analysis was correct to flag this as problematic
- **Action:** Proceed with current documented rules; treat original task as containing errors

### Interpretation B: Rules Changed Between Tasks
- Something happened between the two messages (product decision, docs update, etc.)
- Original rules were intended but have since been superseded
- **Action:** Confirm which version is current and update docs/tests accordingly

### Interpretation C: Misunderstanding in Original Task
- The original task may have swapped the two roles accidentally
- Or the assignment rules (3-5) were meant to be different than stated
- **Action:** Clarify intent and reconcile

---

## Impact on STEP-0 Ambiguity Analysis

My `docs/STEP-0-AMBIGUITY-RESOLUTION.md` identified the EXACT same conflict:

> **Ambiguity #1:** SiteSupervisor creating boiler under PKRep's site when no assignment path exists
> **Ambiguity #2:** SiteUser verifying boiler under PKTech's site when no assignment path exists

**If the current docs are authoritative (Interpretation A), then:**
- ✅ My ambiguity analysis was CORRECT
- ✅ No assignment gaps exist (SiteSupervisor is assigned to PKTech, SiteUser to PKRep)
- ✅ Current implementation matches business rules
- ❌ **BUT** items 1-5 show the implementation is BROKEN (wrong site selection)

---

## Explicit Questions for Resolution

**Please confirm:**

1. **Which rule set is authoritative?**
   - [ ] Current docs: SiteSupervisor→PKTech, SiteUser→PKRep (Interpretation A)
   - [ ] Original "new rules": SiteSupervisor→PKRep, SiteUser→PKTech (Interpretation B)
   - [ ] Neither - there's a third version I should follow

2. **If current docs are correct:**
   - [ ] Should I discard the "new rules" from the original task?
   - [ ] Should I proceed with investigating why the implementation ISN'T following the current docs?

3. **For item 5 (SiteSupervisor under PKTEBYBN5):**
   - [ ] This is WRONG - should be under PKTech's site PKTENXXK0
   - [ ] This is WRONG - should be under PKRep's site PKRPGPJ9
   - [ ] Need to verify which site PKTEBYBN5 actually is before judging

4. **For item 6 (SiteUser under PKRPGPJ9):**
   - [ ] This is CORRECT - PKRep's site is the right target
   - [ ] This is WRONG - should be under PKTech's site PKTENXXK0
   - [ ] Need more investigation

---

## My Recommendation

**Proceed with Interpretation A:**
- Treat current docs (`02-access-matrix.md`) as authoritative
- Discard the contradictory "new rules" from the original task as errors
- Investigate why NONE of the tests (items 1-5) are following the documented rules
- Focus on fixing the broken site-selection mechanism rather than changing business rules

**Rationale:**
1. Current docs are internally consistent (no assignment gaps)
2. Current implementation was designed around these rules
3. The "new rules" created logical impossibilities (no assignment paths)
4. The real problem appears to be site-selection bugs (items 1-3 prove this - even simple creator-own-site cases are broken)

---

## Next Steps (Pending Your Confirmation)

**Once you confirm Interpretation A:**
- Mark STEP-0 todos as complete (ambiguity was correctly identified and resolved)
- Proceed with items 1-3 investigation (not affected by this contradiction)
- Verify item 4
- Investigate items 5-6 using **current docs as the expected behavior**
- Fix the site-selection mechanism
- Update `docs/role-site-boiler-matrix.md` to formalize current rules

**If you choose a different interpretation:**
- I'll adjust course accordingly and document the authoritative rules before proceeding

---

## Status: ⚠️ AWAITING CONFIRMATION

**I will NOT proceed with items 5-6 or write any fixes until you explicitly confirm which rule set is correct.**

**Items 1-4 investigation can proceed immediately since they're unaffected by this contradiction.**
