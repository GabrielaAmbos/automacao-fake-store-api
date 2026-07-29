# Architecture

## Folder layout

```
automacao-fake-store-api/
├── config/
│   ├── base.js                   # Factory holding the shared configuration
│   └── dev.config.js             # dev environment
├── cypress/
│   ├── e2e/                      # Test specs, one folder per resource
│   │   ├── auth/auth.cy.js
│   │   ├── carts/carts.cy.js
│   │   ├── products/products.cy.js
│   │   └── users/users.cy.js
│   ├── fixtures/                 # Test data / expected responses
│   │   ├── all_categories.json
│   │   ├── all_electronics_products.json
│   │   ├── all_jewelery_products.json
│   │   ├── credentials.json
│   │   ├── hard_drive_portable_2t.json
│   │   ├── new_cart.json
│   │   ├── new_product.json
│   │   └── new_user.json
│   └── support/
│       ├── e2e.js                # Loaded before every spec; registers grep and commands
│       ├── index.d.ts            # Custom command typings (autocomplete)
│       ├── auth_commands.js      # Authentication commands
│       ├── carts_commands.js     # Cart commands
│       ├── products_commands.js  # Product commands
│       └── users_commands.js     # User commands
├── .github/workflows/
│   ├── lint.yml                  # ESLint on pull requests and pushes to main
│   └── main.yml                  # API suite, manual dispatch only
├── .editorconfig                 # File style shared across editors
├── .nvmrc                        # Node version used by the project and by CI
├── eslint.config.mjs             # ESLint configuration (flat config)
├── jsconfig.json                 # Makes editors apply the typings to .js files
├── cypress.config.js             # Default configuration (local runs)
└── package.json
```

## Layers

The project keeps a simple three-layer split, which avoids repeating HTTP calls inside
the tests:

```
spec (<resource>.cy.js)
   └── custom commands (<resource>_commands.js)  →  cy.request() against the API
   └── fixtures (*.json)                         →  payloads and expected data
```

- **Spec** — describes the scenario and holds the assertions (`expect`). One spec per API
  resource, with inner `context` blocks separating reads from writes.
- **Custom commands** — wrap the HTTP method, route and parameters. A test never builds a
  URL by hand. One file per resource.
- **Fixtures** — hold write payloads and expected values, keeping data out of the test
  code.

## Configuration

The configuration is defined once in [config/base.js](../config/base.js), which exports a
`createConfig({ baseUrl })` factory. Each environment only supplies its own `baseUrl`:

```js
// config/base.js
function createConfig({ baseUrl }) {
    return defineConfig({
        viewportWidth: 1920,
        viewportHeight: 1080,
        allowCypressEnv: false,
        reporter: 'mochawesome',
        reporterOptions: {
            reportDir: 'cypress/report/mochawesome-report',
            overwrite: false,
            html: true,
            json: true,
            timestamp: 'mmddyyyy_HHMMss'
        },
        e2e: {
            baseUrl,
            setupNodeEvents(on, config) {
                const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin')
                cypressGrepPlugin(config)
                return config
            }
        }
    })
}
```

| File | Role |
| --- | --- |
| `cypress.config.js` | Default configuration, picked up automatically on local runs |
| `config/dev.config.js` | dev environment; passed explicitly via `--config-file config/dev.config.js` |
| `config/base.js` | Shared configuration; not a Cypress config file itself |

To add a new environment, create `config/hlg.config.js` with the matching `baseUrl` — the
workflow's `amb` input already resolves to `config/{amb}.config.js`.

Because every command uses relative paths (`/products`), switching environments only
takes changing the `baseUrl`.

## Cypress version

The project runs **Cypress 15.19.0**. Migrating from Cypress 9 swapped these conventions:

| Before (Cypress 9) | Now (Cypress 15) |
| --- | --- |
| `cypress.json` | `cypress.config.js` |
| `cypress/integration/` | `cypress/e2e/` |
| `*_test.spec.js` | `*.cy.js` |
| `cypress/plugins/index.js` | `setupNodeEvents` inside the config |
| `cypress/support/index.js` | `cypress/support/e2e.js` |
| `cypress-grep` | `@cypress/grep` |
| `--env grepTags=...` | `--expose grepTags=...` |

The default `specPattern` is `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}` and the default
`supportFile` is `cypress/support/e2e.js` — which is why neither needs to be declared in
the config.

### `Cypress.env()` is deprecated

Cypress 15 discourages `Cypress.env()` because any browser code can read those values.
The config sets `allowCypressEnv: false`, and values now travel through `--expose`
(public) or `cy.env()` (sensitive). That is why the tag filter uses
`--expose grepTags=...` rather than `--env`.

## Environment requirements

Cypress 15 requires **Node.js `^20.1.0 || ^22.0.0 || >=24.0.0`**, declared under `engines`
in `package.json`. Node 14 and 16, used before, are no longer supported.

## Code quality

### ESLint

The configuration lives in [eslint.config.mjs](../eslint.config.mjs), in *flat config*
format (the default since ESLint 9). Four layers:

1. `js.configs.recommended` — the ESLint baseline.
2. **Node context** for `config/` and the root configuration files.
3. **Cypress context** (`eslint-plugin-cypress`) for `cypress/`, adding the `cy`,
   `Cypress` and `expect` globals on top of the browser ones.
4. **Test context** (`eslint-plugin-mocha`) for the specs only.

```bash
npm run lint       # check
npm run lint:fix   # apply the auto-fixable fixes
```

Lint runs in CI on every pull request.

Two `eslint-plugin-mocha` rules are disabled on purpose:

| Rule | Reason |
| --- | --- |
| `no-mocha-arrows` | Arrow callbacks are the Cypress idiom — there is no `this` to preserve |
| `no-async-in-sync-tests` | False positive: `cy.request().then()` is a chainable from the command queue, not a Promise. Making the test `async` would be the actual mistake |

The payoff is concrete rather than theoretical: the `no-undef` rule flags exactly the bug
that shipped in the `deleteProduct` command, which called a nonexistent
`getUrlAllProducts()` function.

### Command typings

[cypress/support/index.d.ts](../cypress/support/index.d.ts) declares all 27 custom
commands on `Cypress.Chainable`. Cypress picks the file up automatically, and
[jsconfig.json](../jsconfig.json) makes editors apply those typings to `.js` files too —
so typing `cy.` yields autocomplete and parameter hints.

Keep the `.d.ts` in sync whenever a command is added, renamed or removed.

### Style

[.editorconfig](../.editorconfig) pins charset, line endings and indentation (4 spaces in
JS, 2 in JSON/YAML) for any editor. The ESLint style rules mirror what the code already
did — single quotes, no semicolons, no trailing commas.

[.nvmrc](../.nvmrc) pins Node 22, used both locally (`nvm use`) and by CI through
`node-version-file`.

## Dependencies

| Package | Role |
| --- | --- |
| `cypress` | Test runner |
| `@cypress/grep` | Filtering tests by tag (replaces the deprecated `cypress-grep`) |
| `mochawesome` / `mochawesome-report-generator` | HTML and JSON report generation |
| `mocha` | Peer of mochawesome |
| `eslint` + `@eslint/js` + `globals` | Static analysis |
| `eslint-plugin-cypress` | Cypress globals and rules |
| `eslint-plugin-mocha` | Spec rules (forgotten `.only`, duplicate titles) |

Seven dependencies that no file in the project referenced — `dotenv`, `express`, `joi`,
`mongodb`, `mongoose`, `node-fetch` and `npm-run-all` — were removed. They were leftovers
from the original study project and accounted for most of the `npm audit` advisories,
including both criticals.
