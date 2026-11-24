# Design: configurator GUI

Status: accepted · Scope: `marcus_gui` (the API lives in `marcus_api`)

## Context and scope

The configurator has two audiences and one data source. A customer browses
products, chooses one option per part, sees whether the selection is allowed and
what it costs, and orders it. An administrator maintains products, parts,
options, incompatibility pairs, price rules and orders. Both audiences work
against the Rails API in `marcus_api`; nothing is persisted in the browser.

In scope: the storefront (list, detail, cart), the admin CRUD screens, the client
state that connects them, and the HTTP client.

Out of scope: authentication, checkout and payment, customer accounts, image
upload, search, pagination, server-side rendering, and offline use.

## Goals

1. The browser never decides validity or price. It asks the API and renders the
   answer.
2. The same code serves the storefront and the admin area without a second build
   or a second deploy.
3. State that more than one route needs lives in one place; state that belongs to
   one screen stays in that screen.
4. The build is static: `dist/` can be served by any host.

## Non-goals

- A component library or a design system. Tailwind classes are written per view.
- Type safety. The project is JavaScript, not TypeScript.
- Admin authentication. The `/admin` routes are open in this demo.
- Optimistic updates. The UI waits for the API on validation, price and writes.

## The design

**Routing.** `src/router/index.js` defines one storefront branch (`/`,
`/products/:id`, `/cart`) and one admin branch (`/admin` with a layout and child
routes for products, parts, options, restrictions, price rules and orders). Every
view is a dynamic import, so Vite emits one chunk per screen.

**Storefront state.** Three Pinia stores carry state across routes:

- `productStore`: the product list and the current product with its parts and
  options. A detail load is one product request, one parts request and then one
  options request per part, run in parallel.
- `customizationStore`: one option id per part, plus `isValidSelection`,
  `validationErrors`, `calculatedPrice` and the two loading flags. `selectOption`
  calls `validate_selection` and `calculate_price` after each change.
- `cartStore`: configured bikes with a generated item id, a computed total, and
  `placeOrderFromCart`, which posts one order per item and clears the cart only
  when every post succeeds.

**Admin state.** Each admin view owns its data with `ref()` and calls
`apiService` directly. Nothing on those screens is shared with another route, so
a store would add indirection without removing duplication. See ADR 0002.

**API boundary.** `src/services/apiService.js` creates one Axios instance with
the base URL from `VITE_API_BASE_URL` (falling back to
`http://localhost:3001/api/v1`) and one method per endpoint. It is the only module
that knows the URL layout or the JSON shape. Views and stores pass plain values
and read `response.data`.

**Feedback.** The detail view disables out-of-stock options, disables the
add-to-cart button until the selection is valid, priced and complete, and shows
the validation errors returned by the API. The cart disables checkout until a
name and an email are present.

## Alternatives considered

**Server-rendered views in the Rails app (Hotwire).** Would remove the separate
deploy and the CORS hop. Rejected because the configurator is stateful: each radio
change must re-validate and re-price, and the admin area is a set of forms over
the same JSON API. The team already had the API contract; a SPA keeps the two
deployments independent.

**Pinia stores for the admin screens too.** Consistent at first glance, but the
admin screens do not share state: each route loads one resource and leaves. A
store per resource would add actions and getters that no second view calls. The
cost is visible duplication of loading and error flags, which is cheaper than an
unused abstraction (ADR 0002).

**Component-local state everywhere, with stores only for the cart.** Rejected:
the selected configuration must survive a move from the detail view to the cart
view, and the product catalogue is read by both the list and the detail view.
That is exactly the cross-route state Pinia exists for.

**A generated JSON:API client or an OpenAPI client.** The contract is small and
hand-written in `apiService`; code generation would add a build step and a
dependency for the endpoints the app already calls. Revisit if the API grows or a second client has
to stay in sync.

**Nuxt for SSR and SEO.** A shop benefits from server rendering, but this is a
demo whose value is the configurator interaction behind a login-free admin. SSR
would add a Node server and a second data-loading model for no current audience.

## Cross-cutting concerns

**Error handling.** The Axios interceptor logs the response body or the message;
each store and view then sets a user-facing message and keeps the previous state
or an empty list. A failed order keeps the cart intact.

**Accessibility.** Option inputs are real radio buttons inside labels, the
out-of-stock state is disabled and labelled, and admin forms use labelled inputs.
There is no automated accessibility test.

**Performance.** Route-level code splitting limits the initial bundle. The detail
view makes 1 + 1 + N requests (product, parts, options per part); the API's
nested routes make that shape natural, and the calls run in parallel.

**Security.** The API URL is build-time configuration, not a secret. There is no
token handling and no admin authentication; the app must not be deployed as a
public admin panel without an auth layer in front of it.

**Deployment.** `npm run build` produces static files. The origin must match the
API CORS configuration. No CI job deploys the app.
