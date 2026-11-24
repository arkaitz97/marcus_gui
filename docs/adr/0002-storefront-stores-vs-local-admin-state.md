# 2. Storefront state in Pinia, admin state local to each view

- Status: accepted
- Date: 2026-11-24
- Deciders: Arkaitz Molinuevo
- Consulted: `docs/design.md`, `docs/adr/0001-server-authoritative-validation.md`

## Context and problem statement

The app has two areas with different state lifetimes. The storefront moves a
selection and a cart between routes: the detail view fills the cart, the cart view
reads it, and the catalogue is read by both the list and the detail view. The
admin area has one layout and ten child routes, each of which loads, edits or
saves one resource, and no admin screen reads another admin screen's data.

Where should state live, and should both areas follow the same pattern?

## Considered options

1. Pinia stores for every resource and every screen.
2. Pinia only for cross-route storefront state; `ref()` inside each admin view.
3. Component-local state everywhere, lifting the cart into `provide`/`inject` or
   route params.

## Decision

Use Pinia for the three storefront concerns that cross a route boundary:
`productStore` (catalogue and current product), `customizationStore` (selection,
validity, price) and `cartStore` (items, total, order placement). Keep admin
state inside each admin view with `ref()`, and let those views call
`apiService` directly, because each one owns one resource for the lifetime of its
route. The HTTP boundary stays single either way: only `apiService` knows the URL
layout and the payload shape.

## Consequences

- Good: the detail and cart views share one source of truth; an added
  configuration survives navigation without serialising it into the URL or
  storage.
- Good: the three stores hold all the behaviour that needs a test, and the Vitest
  suites mock `apiService`.
- Good: an admin screen can be read top to bottom: load, edit, submit, leave.
- Bad: each admin view repeats the loading and error boilerplate (`isLoading`,
  `error`, try/catch). Extracting it is worthwhile when a shared refresh or a
  cross-screen widget appears.
- Bad: admin screens have no store tests; only the lint, build and manual run
  cover them.
- Neutral: moving an admin screen into a store later is a local change; nothing
  outside the view imports its state.
