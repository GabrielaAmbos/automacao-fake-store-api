<p align="right">
  <a href="README.md"><img src="https://flagcdn.com/24x18/us.png" alt="English" title="English"></a>
  &nbsp;
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/24x18/br.png" alt="Português (Brasil)" title="Português (Brasil)"></a>
</p>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=DF62F7&width=435&lines=Fake+Store+API+Test+Automation)](https://git.io/typing-svg)

![Cypress](https://img.shields.io/badge/Cypress-15.19.0-17202C?logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Node](https://img.shields.io/badge/Node.js-%E2%89%A5%2020-339933?logo=nodedotjs&logoColor=white)
![Tests](https://img.shields.io/badge/tests-40%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

**API** test automation project for the [Fake Store API](https://fakestoreapi.com),
written in JavaScript with the [Cypress](https://www.cypress.io) framework.

**40 tests** covering every public endpoint of the API — products, carts, users and
authentication. No front-end involved: the tests issue HTTP requests directly through
`cy.request()`, wrapped in custom commands.

---

## Table of contents

- [Coverage](#coverage)
- [Stack](#stack)
- [Scripts](#scripts)
- [Getting started](#getting-started)
- [Filtering tests by tag](#filtering-tests-by-tag)
- [Reports](#reports)
- [Project structure](#project-structure)
- [Continuous integration](#continuous-integration)
- [Documentation](#documentation)

## Coverage

| Resource | Tests | What is verified |
| --- | :---: | --- |
| **Products** | 15 | Listing, lookup by id, `limit`, `sort`, categories, object contract, `POST`, `PUT`, `PATCH` and `DELETE` |
| **Carts** | 12 | Listing, lookup by id and by user, `limit`, `sort`, date-range filter, `POST`, `PUT` and `DELETE` |
| **Users** | 9 | Listing, lookup by id, `limit`, `sort`, nested contract, `POST`, `PUT` and `DELETE` |
| **Authentication** | 4 | Valid login with a JWT, invalid credentials, wrong password and empty payload |

Each resource has its own spec under `cypress/e2e/`, with tests grouped into **Leitura**
(read) and **Escrita** (write).

> The Fake Store API only simulates writes: `POST`, `PUT`, `PATCH` and `DELETE` answer
> successfully and echo the object back, but **nothing is persisted**. The write tests
> assert on the response — reading the resource again would confirm nothing.

## Stack

| Tool | Purpose |
| --- | --- |
| [Cypress](https://www.cypress.io) 15 | Test runner |
| [@cypress/grep](https://github.com/cypress-io/cypress/tree/develop/npm/grep) | Filtering tests by tag |
| [Mochawesome](https://github.com/adamgruber/mochawesome) | HTML and JSON reports |
| [ESLint](https://eslint.org) | Static analysis, with the Cypress and Mocha plugins |
| GitHub Actions | Lint and test pipelines |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run cy:open` | Opens the Test Runner (interactive mode) |
| `npm test` | Runs the suite headless |
| `npm run test:smoke` | Runs only the `@smoke` tests |
| `npm run lint` | Runs ESLint |
| `npm run lint:fix` | Applies the auto-fixable ESLint fixes |

## Getting started

**Requirement:** Node.js 20, 22 or 24+ (Cypress 15 requires it). `.nvmrc` pins 22 — with
[nvm](https://github.com/nvm-sh/nvm) installed, `nvm use` is enough.

```bash
# install the dependencies
npm i

# open the Test Runner (interactive mode)
npm run cy:open

# run the tests headless
npm test
```

No environment variable, authentication or database is needed — the Fake Store API is
public and the `baseUrl` ships configured.

```bash
# run a single spec
npx cypress run --spec "cypress/e2e/carts/carts.cy.js"

# pick the browser
npx cypress run --browser chrome

# use a specific environment configuration
npx cypress run --config-file config/dev.config.js
```

> **Running from the VS Code terminal?** It sets `ELECTRON_RUN_AS_NODE=1`, which makes
> Cypress fail with `bad option: --no-sandbox`. Use
> `unset ELECTRON_RUN_AS_NODE && npx cypress run`, or an external terminal.

## Filtering tests by tag

| Tag | Tests |
| --- | :---: |
| `@regression` | 40 |
| `@products` | 15 |
| `@carts` | 12 |
| `@users` | 9 |
| `@smoke` | 7 |
| `@auth` | 4 |

```bash
npx cypress run --expose grepTags=@smoke              # only the main ones
npx cypress run --expose grepTags="@carts @users"     # @carts OR @users
npx cypress run --expose grep="categoria"             # by test title
```

Tests that do not match the filter show up as **pending**, not as failures.

## Reports

On every run Mochawesome writes HTML and JSON to `cypress/report/mochawesome-report/`,
timestamped — history accumulates instead of being overwritten. In CI the report is
published as a run artifact.

## Project structure

```
├── config/
│   ├── base.js                   # shared configuration
│   └── dev.config.js             # dev environment
├── cypress/
│   ├── e2e/                      # specs, one folder per resource
│   │   ├── auth/auth.cy.js
│   │   ├── carts/carts.cy.js
│   │   ├── products/products.cy.js
│   │   └── users/users.cy.js
│   ├── fixtures/                 # payloads and expected values
│   └── support/                  # custom commands, one file per resource
├── .github/workflows/            # pipelines
└── cypress.config.js             # default configuration
```

The rule is simple: **a spec never builds a URL**. Every request lives in a custom
command, and the data lives in fixtures.

## Continuous integration

| Workflow | When it runs |
| --- | --- |
| **Lint** | On every pull request to `main` and push to `main` |
| **Execução automação de testes** | Manually only, choosing browser, environment and tag |

> The API suite does not run on pull requests because the Fake Store API answers **403**
> to requests coming from GitHub-hosted runners — their datacenter IP ranges are blocked.
> The tests are correct and pass locally; running them in CI would leave a permanently red
> check. A [pre-push hook](.githooks/pre-push) runs lint and the suite locally instead, so
> the gap is covered at push time. Details in [Running and CI](docs/running-and-ci.md).

## Documentation

Full documentation lives in [docs/](docs/README.md):

| Document | Contents |
| --- | --- |
| [Architecture](docs/architecture.md) | Structure, configuration and technical decisions |
| [Custom commands](docs/custom-commands.md) | Reference for every `cy.*` in the project |
| [Test cases](docs/test-cases.md) | What each test verifies, and the API's quirks |
| [Running and CI](docs/running-and-ci.md) | Local runs, reports and GitHub Actions |
| [Known issues](docs/known-issues.md) | Mapped open points |

## License

[MIT](LICENSE) © Gabriela Ambos
