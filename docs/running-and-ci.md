# Running and CI

## Prerequisites

- **Node.js `^20.1.0 || ^22.0.0 || >=24.0.0`** — required by Cypress 15.
  [.nvmrc](../.nvmrc) pins 22; with `nvm` installed, `nvm use` is enough.
- Internet access — the tests call the public `https://fakestoreapi.com` API.

## Available scripts

| Script | What it does |
| --- | --- |
| `npm run cy:open` | Opens the Test Runner (interactive mode) |
| `npm run cy:run` | Runs the suite headless |
| `npm test` | Alias of `cy:run` — the entry point CI and other tools expect |
| `npm run test:smoke` | Runs only the `@smoke` tests |
| `npm run lint` | Runs ESLint |
| `npm run lint:fix` | Runs ESLint applying the auto-fixable fixes |

## Running locally

```bash
npm i            # install the dependencies
npm run cy:open  # open the Test Runner (interactive mode)
npm test         # run headless
```

### Useful variations

```bash
# run a single spec
npx cypress run --spec "cypress/e2e/products/products.cy.js"

# pick the browser
npx cypress run --browser chrome

# use a specific environment configuration
npx cypress run --config-file config/dev.config.js
```

### Filtering tests by tag

`@cypress/grep` is registered in [cypress/support/e2e.js](../cypress/support/e2e.js) and
in `setupNodeEvents`. Options are passed with **`--expose`** (in Cypress 15, `--env` is no
longer the recommended channel):

```bash
# only the tests tagged @regression
npx cypress run --expose grepTags=@regression

# @regression OR @activities
npx cypress run --expose grepTags="@regression @activities"

# @regression AND @activities
npx cypress run --expose grepTags="@regression+@activities"

# filter by test title
npx cypress run --expose grep="categorias"
```

Tests that do not match the filter show up as **pending**, not as failures.

> ⚠️ If the tag does not exist on any test, the run finishes successfully having executed
> nothing. Check the available tags in [test-cases.md](test-cases.md#tags).

## Reports

The configured reporter is **mochawesome**. Every run writes HTML and JSON to:

```
cypress/report/mochawesome-report/
```

With `"overwrite": false` and `"timestamp": "mmddyyyy_HHMMss"`, each run creates a new
file instead of overwriting the previous one — history accumulates in the folder.

To merge several JSON files into a single report:

```bash
npx mochawesome-merge "cypress/report/mochawesome-report/*.json" > merged.json
npx marge merged.json
```

> `mochawesome-merge` is not among the project's dependencies; install it if you need
> this step.

## GitHub Actions

> ### ⚠️ Why the suite does not run on pull requests
>
> The Fake Store API answers **403 Forbidden** to requests coming from GitHub-hosted
> runners — their datacenter IP ranges are blocked upstream. This was confirmed on the
> workflow's first real run: **40 of 40 tests failed with 403**, while the same tests pass
> locally.
>
> It is not the User-Agent: the log shows the request already going out as
> `Mozilla/5.0 ... HeadlessChrome/150` and still being refused. The block is on the
> request origin.
>
> Keeping the tests on pull requests would leave a permanently red check that means
> nothing — and a check that always fails is a check nobody reads. So pull requests run
> lint only, and the API suite moved to manual dispatch.
>
> To run against the real API: `npm test` locally, or trigger the workflow from a
> self-hosted runner whose IP the API accepts.

### `lint.yml` — Lint

Runs on every pull request to `main` and every push to `main`. Installs with
`npm ci --ignore-scripts` — linting does not need the Cypress binary, which keeps the job
around 10 seconds — and runs `npm run lint`.

### `main.yml` — Execução automação de testes

Runs the API suite. **Through `workflow_dispatch` only** (manual), for the reason above.

It takes three inputs at dispatch time:

| Input | Default | Description |
| --- | --- | --- |
| `browser` | `chrome` | `chrome` or `electron` |
| `amb` | `dev` | Environment → resolves to `config/{amb}.config.js` |
| `tag` | `@regression` | Tag used to filter the tests |

The job runs on `ubuntu-latest` with the `cypress-io/github-action@v6` action, which takes
care of caching the Cypress binary. Command executed:

```bash
npx cypress run \
  --config-file config/${amb}.config.js \
  --browser ${browser} \
  --expose grepTags=${tag}
```

At the end, the mochawesome report is published as a run artifact
(`actions/upload-artifact@v4`, 20-day retention), downloadable from the run page.

### GitHub Pages (disabled)

The repository used to publish a Pages site, built by GitHub's legacy Jekyll mode from
the root of `main`. It has been **turned off**, along with the `static.yml` workflow that
was meant to feed it.

Both were dropped for the same reason: neither did anything worth keeping.

- `static.yml` failed on **every** push. `upload-pages-artifact@v2` depends on the
  deprecated `upload-artifact@v3`, which GitHub now fails automatically.
- The site did not depend on that workflow anyway — the legacy build served it — and all
  it rendered was the README, which GitHub already displays better.
- Nothing in the repository linked to the Pages URL.
- It served the whole repository as static files, which is a distribution surface with no
  purpose behind it.

Publishing the test report through Pages would have needed a different design regardless:
`cypress/report/` is gitignored, so no report is ever committed. The `main.yml` workflow
already uploads the mochawesome report as a run artifact, which covers that need.

To bring a site back, re-enable Pages under **Settings → Pages** and pick a source.

## Troubleshooting

### `bad option: --no-sandbox` when running from the VS Code terminal

The integrated VS Code terminal sets `ELECTRON_RUN_AS_NODE=1`, which makes the Cypress
binary start as plain Node and reject the Electron flags. Fix:

```bash
unset ELECTRON_RUN_AS_NODE && npx cypress run
```

Or run from an external terminal, where the variable is not set. CI is unaffected.

## What `.gitignore` covers

```
# Dependencies
node_modules/

# Cypress artifacts
cypress/report/
**/*.mp4
**/*.png
videos
screenshots

# Editors / OS
.ideia/
.DS_Store
```

Dependencies, reports, videos and screenshots stay out of version control. Note that
video recording has been **off by default** since Cypress 13.
