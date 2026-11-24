# 1. Server-authoritative validation and pricing in the SPA

- Status: accepted
- Date: 2026-11-24
- Deciders: Arkaitz Molinuevo
- Consulted: `marcus_api/docs/design.md`

## Context and problem statement

When a customer changes an option, the UI must say whether the configuration is
still valid and what it now costs. The rules (incompatible pairs, price premiums,
stock) already live in the API database and are edited from the admin area.

Should the SPA evaluate the rules locally for instant feedback, or ask the API on
every change?

## Considered options

1. Ask the API: call `validate_selection` and `calculate_price` after each change.
2. Load the rules once and evaluate them in the browser.
3. Ask the API only at checkout, with no live feedback.

## Decision

Ask the API on every change. `customizationStore.selectOption` updates the local
selection and immediately calls both endpoints. The response drives
`isValidSelection`, `validationErrors` and `calculatedPrice`; the add-to-cart
button is disabled while the selection is invalid or the price is unknown. The
order request re-validates on the server, so the client state is a convenience,
not a guarantee.

## Consequences

- Good: one implementation of the rules. A new restriction row in the admin area
  takes effect in the storefront without a front-end release.
- Good: the UI cannot show a price the order endpoint would not charge, except
  for the race described below.
- Good: the store stays small and testable; the tests mock two endpoints.
- Bad: two HTTP calls per option change. On a slow link the feedback lags, and
  `isValidating` / `isCalculatingPrice` must gate the UI.
- Bad: responses can arrive out of order when the user changes options quickly.
  The store keeps the last response it receives, not the last request it sent; a
  request counter or an `AbortController` is the fix if this becomes visible.
- Neutral: the client duplicates none of the rule data, so offline configuration
  is not supported.
