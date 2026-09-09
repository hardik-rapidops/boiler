# Access Matrix

| Capability | PKAdmin | PKTech | PKRep | Site Manager | Site Supervisor | Site User |
| --- | --- | --- | --- | --- | --- | --- |
| Create own site | Yes | Yes | Yes | No | No | No |
| Invite from own created site | Yes | Yes | Yes | Yes | Yes | Yes |
| Invite from assigned site | Yes | Yes | No | Yes | No | No |
| Remove user from own created site | Yes | Yes | Yes | N/A | N/A | N/A |
| Remove user from assigned site | Yes | Yes | No | Yes | No | No |
| Filter sites by name, description, address | Yes | Yes | No | No | No | No |
| Search all creator sites | Yes | Yes | No | No | No | No |
| View own or assigned sites | Yes | Yes | Yes | Yes | Yes | Yes |
| View unassigned sites created by other users | Yes | Yes | No | No | No | No |
| Update own created site | Yes | Yes | Yes | Yes | Yes | Yes |
| Update assigned site | Yes | Yes | No | Yes | Yes | Read only |
| Create boiler on own created site | Yes | Yes | Yes | No | No | No |
| Create boiler on assigned site | Yes | Yes | No | Yes | Yes | No |
| Edit boiler information on assigned site | Yes | Yes | No | Yes | Yes | Read only |
| Delete own created site | Yes | Yes | Yes | Yes | Yes | Yes |
| Delete assigned site | Yes | Yes | Yes | Yes | Yes | Yes |

## Deletion Validation

After deletion:

- The site is absent from the deleting user's account.
- Invited users are removed from that site.
- The deleted site is not visible in invited users' accounts.

## Role And Permission Freshness

When a new user is added or an existing user is updated with any role, the latest role and permission changes must be reflected immediately. Access validations must fetch current user, role, and permission data from the latest API response and must not rely on stale cached application, browser, user, role, or permission data.

## Invitation Coverage

The Site Invitation spec validates owner-site precondition invitations:

- PKAdmin invites Site Manager from the PKAdmin-created site.
- PKTech invites Site Supervisor from the PKTech-created site.
- PKRep invites Site User from the PKRep-created site.

Each scenario must verify that the invited email is displayed in the inviter's Access Control list, persist the invited email and role in runtime data, and verify the assigned Site in a fresh assignee session.

The same Site Invitation spec validates assigned-site invitation permissions:

- Site Manager can invite the existing Supervisor previously assigned by PKTech to the Manager's assigned PKAdmin site.
- Site Supervisor cannot invite users from an assigned site.
- Site User cannot invite users from an assigned site.

For Site Supervisor and Site User, the Access Control `+` invite button must be hidden.

## Site Unassignment Coverage

Removal restrictions are validated before any destructive unassignment. Site Supervisor and Site User must see no enabled remove control while they still have access to their assigned Sites.

Removal execution order is:

1. Site Manager removes the Supervisor assigned by that Manager.
2. PKAdmin removes Site Manager.
3. PKTech removes Site Supervisor.
4. PKRep removes Site User.

Each removal must update runtime assignment data and verify through a fresh API-authenticated session that the removed user can no longer find the Site.

## Site Search Coverage

- PKAdmin validates search visibility for Sites created by PKAdmin, PKTech, and PKRep.
- PKTech validates search visibility for Sites created by PKAdmin, PKTech, and PKRep.
- PKRep validates own or directly assigned Site visibility and verifies Sites assigned to other users are hidden unless PKRep is also assigned.
- Site Manager, Site Supervisor, and Site User validate directly assigned Site visibility and verify Sites assigned to other users are hidden unless the current role is also assigned.
- Restricted roles validate that the Name filter is hidden, disabled, or limited to permitted own/directly assigned Sites.
- Site Search uses runtime data from Site Creation and Site Invitation but must not execute those specs directly.

## Site Update Coverage

- PKAdmin, PKTech, and PKRep update their own created Sites.
- Site Manager updates the assigned PKAdmin Site.
- Site Supervisor updates the assigned PKTech Site.
- Site User cannot update assigned Site fields.
- The Site Update spec contains update validations only and must not execute Site Creation, Search, or Invitation scenarios.
- Site unassignment starts only after update-action tests have completed.

## Boiler Creation Coverage

- PKAdmin creates a Boiler under the latest PKAdmin-created Site.
- PKTech creates a Boiler under the latest PKTech-created Site.
- PKRep creates a Boiler under the latest PKRep-created Site.
- Site Manager creates a Boiler under the assigned PKAdmin-created Site.
- Site Supervisor creates a Boiler under the assigned PKTech-created Site.
- Site User cannot create a Boiler and Boiler information is read-only.
- Boiler Creation stores Boiler Name, Boiler ID when available, selected Site, Sola, Nuro, Register Code, Unique Key, software version, and settings type in runtime data.
