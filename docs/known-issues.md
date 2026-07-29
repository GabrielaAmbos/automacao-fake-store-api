# Known issues

A survey of the project's current state — a map of what exists, to guide the next steps.

## Suite fragilities

### Hardcoded counts

Three tests assert the exact size of the collections (20 products, 7 carts, 10 users)
through the `TOTAL_PRODUCTS`, `TOTAL_CARTS` and `TOTAL_USERS` constants. That is
deliberate — it catches changes to the API's catalogue — but it breaks if the Fake Store
alters its dataset. If it turns into noise, swap it for
`expect(response.body).to.not.be.empty`.

### The cart date filter is not really verified

`GET /carts?startdate=2019-12-10&enddate=2020-10-10` returns all **7** carts, ignoring
the range. The test checks status and type only, because asserting the filtering would
fail against the API's real behaviour. If the API is fixed, the test should be
strengthened.

### Fixed ids in the write tests

`PUT`, `PATCH` and `DELETE` use fixed ids (6, 7, 2, 3). Since the API persists nothing,
there is no side effect between runs — but the ids do have to exist in the dataset.

## The API blocks GitHub runners

The Fake Store API answers **403 Forbidden** to requests coming from GitHub-hosted
runners. Confirmed on the workflow's first real run: 40 of 40 tests failed with 403, with
the User-Agent already presenting itself as Chrome — meaning the block is on the
datacenter IP ranges, not on the client.

The API suite moved to manual dispatch and pull requests run lint only. Routes back to
automated runs, by effort:

1. **Self-hosted runner** — keeps the tests against the real API; needs infrastructure.
2. **Mock with `cy.intercept()`** and recorded responses — runs anywhere, but turns into
   contract testing against frozen data rather than the live API.
3. **Switch targets** to a public API that does not block datacenter ranges.

What **not** to do: disguise the request origin to get around the protection, or mark the
job as `continue-on-error` — a check that always fails is a check nobody reads.

## Dependency security

`npm audit` reports **8 residual advisories** (0 critical), all transitive through
`mocha`/`mochawesome` and confined to report-generation devDependencies.

npm's `fixAvailable` proposes a **downgrade** — `mocha@11.3` (older than the installed
one) and `mochawesome@1.5.5` — which would be a large regression to address a theoretical
risk in a reporting tool. **Do not run `npm audit fix --force` here.** If the advisories
become a problem, the way out is swapping the reporter for
`cypress-mochawesome-reporter`, maintained specifically for Cypress.

## Coverage

- **Schema-based contract validation**: the contract assertions are manual
  (`to.have.all.keys` plus type checks). A schema per resource would make the tests more
  declarative.
- **The JWT is never reused**: the login test validates the token's shape, but no test
  uses it on an authenticated request — the Fake Store API does not require auth on the
  other endpoints.
- **`PATCH` only exists for products**: carts and users accept it too, untested.

## Configuration and CI

| Item | Situation |
| --- | --- |
| `config/dev.config.js` | The only environment that exists; `hlg.config.js` and `prd.config.js`, implied by the workflow's `amb` input, are missing |
| `static.yml` | Publishes the whole repository to Pages, not just the reports |
| Prettier | Not adopted — style is covered by `.editorconfig` plus the ESLint rules. Adopting it would reformat the entire base at once |

## Maintenance

- **Idle fixtures**: `all_electronics_products.json` and `all_jewelery_products.json` are
  unused. That was a deliberate call — the category test asserts that *every* returned
  item belongs to the requested category, which does not break when the catalogue changes.
  Both files can be removed.
- **Bilingual README**: `README.md` (English) and `README.pt-BR.md` (Portuguese) must be
  kept in sync by hand. Any change to one belongs in the other.

## Resolved

### While standardising (tooling and conventions)

- ~~No linter in the project~~ → ESLint with `eslint-plugin-cypress` and
  `eslint-plugin-mocha`, running in CI on every pull request.
- ~~7 idle dependencies, 2 critical vulnerabilities~~ → removed; `npm audit` dropped from
  22 advisories (2 critical) to 8 (none critical).
- ~~No autocomplete for the custom commands~~ → `cypress/support/index.d.ts` typing all 27
  commands, plus `jsconfig.json`.
- ~~`package.json` pointed at the wrong repository~~ (`GabrielaAmbos/cypress`) → fixed,
  with `bugs`, `keywords` and `private: true`.
- ~~`main: index.js` referenced a nonexistent file~~ → removed.
- ~~`commands.js` was 100% comments and still imported~~ → removed.
- ~~npm scripts carried a redundant `npx`~~ → `cypress` resolves straight from `.bin`;
  added `test`, `test:smoke`, `lint` and `lint:fix`.
- ~~The Node version was repeated in the workflow~~ → centralised in `.nvmrc`.
- ~~No shared file style~~ → `.editorconfig`.

### While growing coverage (products → the whole API)

- ~~`deleteProduct` called `getUrlAllProducts()`, a nonexistent function~~ → fixed to
  `'/products/' + productId`.
- ~~`putUpdateProduct` sent a `PUT` with no body~~ → now takes the payload as a parameter.
- ~~The "Buscar por uma categoria" test was commented out and missing its `it(`~~ →
  rewritten and active, alongside the nonexistent-category one.
- ~~`getAllProductos` mixed Portuguese and English~~ → renamed to `getAllProducts`.
- ~~`getSpecificCategory` did not encode the URL~~ → uses `encodeURIComponent`, which made
  the `men's clothing` test possible.
- ~~The categories test compared by index, depending on the API's ordering~~ → switched to
  `to.have.members`, which ignores order.
- ~~6 of the 9 product commands had no test~~ → all covered.

### While migrating to Cypress 15

- ~~`cypress-grep` was never registered~~ → replaced with `@cypress/grep` and registered.
- ~~The CI default tag (`@regressivo`) matched nothing in the specs~~ → changed to
  `@regression`.
- ~~The PR trigger pointed at `master`~~ → fixed to `main`.
- ~~An Allure step with no `allure-results`~~ → replaced by uploading the mochawesome
  report as an artifact.
- ~~Legacy Cypress 9 layout~~ → migrated to `cypress.config.js`, `cypress/e2e/` and
  `cypress/support/e2e.js`.
- ~~`cypress.json` and `config/dev.json` were duplicates~~ → configuration unified in
  `config/base.js`.
- ~~`node_modules/` was version-controlled (11,851 files)~~ → untracked and ignored.
