# Locator Strategy

## Priority

1. `data-testid` selectors for stable automation contracts.
2. Accessible roles and labels.
3. User-visible text scoped to the smallest stable region.
4. CSS selectors only for stable semantic attributes.

## Login Exclusion

Login locators are intentionally excluded from the automation contract. Authentication must be completed through the login API only, and UI-based login must not be used by tests, fixtures, helpers, or setup flows.

## Current Contract

The POMs prefer selectors such as:

- `site-create`, `site-name`, `site-description`, `site-city`, `site-province`, `site-zip`, `site-save`
- `site-search`, `site-result-{siteName}`
- Site Search filter locators prefer `site-search-filter-name`, `site-search-filter-description`, and `site-search-filter-address`, with accessible controls named `Name`, `Description`, or `Address` as fallbacks. If no explicit filter control exists, the generic `site-search` input is treated as the filter surface.
- Site Update uses `vm.site.name`, `vm.site.description`, `vm.site.address`, `vm.site.city`, `vm.site.state`, `vm.site.zip`, `vm.site.fuel`, `vm.site.timeZone`, and `vm.SiteInfo_Save()`.
- The Boiler Alerts permission check uses the visible option text `Don't notify anyone on Boiler Alerts from this site`.
- No-result validation prefers a visible no-site/no-record message and otherwise verifies that no `.sites-list .each-site` result is visible.
- `site-invite`, `invite-email`, `invite-role`, `invite-submit`
- Access Control navigation uses the `Access Control` button on the Site Info page.
- Invite flow locators use the floating `+` control, `vm.email`, `vm.role`, and the `Invite` button where stable test ids are not available.
- Assigned-role permission checks verify the Access Control floating `+` invite control is visible/enabled for Site Manager and hidden for Site Supervisor and Site User.
- Access Control removal locators are scoped to the matching `.each-user` row. The current delete control uses `button[ng-click="vm.delete($event,site)"]`, with test-id, accessible-label, and visible-text fallbacks.
- Confirmation handling supports native browser dialogs and Angular Material dialogs.
- `site-assign-user`, `site-delete`, `site-confirm-delete`
- Boiler Management prefers `boiler-create`, `boiler-code`, `boiler-add-submit`, `boiler-name`, `boiler-description`, `boiler-site`, `boiler-save`, `boiler-search`, `boiler-result-{boilerName}`, `boiler-sola`, and `boiler-nuro`.
- Boiler Add flow uses the visible `Add a new boiler` control and `ADD BOILER` action when stable test ids are not available.
- Boiler search uses the runtime Nuro Number. The matching `md-list-item` details control uses `button[ng-click*="goToDetailsPage"]`, with boiler-details anchor fallbacks.
- Boiler Info validation scopes assertions to the summary region containing `Site`, `State`, `Status`, `Brand`, and `Updated` labels.
- Temperature Sensor assertions locate each exact visible UI label, scroll it into view, and resolve its nearest container containing the reference displayed value. Read-only validation checks that the resolved row has no enabled form or content-editable control and no named edit/save action.

If app markup differs, update only the page objects.
