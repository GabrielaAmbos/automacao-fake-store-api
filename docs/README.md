# Documentation — Fake Store API Test Automation

Automated API test suite for the [Fake Store API](https://fakestoreapi.com), written in
JavaScript with the [Cypress](https://www.cypress.io) framework (v15).

The project is a test-automation study: **40 tests** covering every public endpoint of
the Fake Store API — products, categories, carts, users and authentication — using
`cy.request()`, custom commands and fixtures as test data.

## Index

| Document | Contents |
| --- | --- |
| [Architecture](architecture.md) | Folder layout, configuration and technical decisions |
| [Custom commands](custom-commands.md) | Reference for every `cy.*` command in the project |
| [Test cases](test-cases.md) | What each test verifies and which fixture it uses |
| [Running and CI](running-and-ci.md) | Local runs, reports and GitHub Actions |
| [Known issues](known-issues.md) | Mapped open points and inconsistencies |

## Quick start

```bash
# install the dependencies (requires Node >= 20)
npm i

# open the Test Runner (interactive mode)
npm run cy:open

# run the tests headless
npm test
```

No environment variable, authentication or database is needed — the Fake Store API is
public and the `baseUrl` is already set in `cypress.config.js`.

## System under test

The Fake Store API is a public fake e-commerce REST API used for prototyping and
learning. Every endpoint below is exercised by the suite:

**Products**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/products` | Lists every product (20) |
| `GET` | `/products/{id}` | Looks a product up by id |
| `GET` | `/products?limit={n}` | Lists products capping the amount |
| `GET` | `/products?sort={asc\|desc}` | Lists products sorted |
| `GET` | `/products/categories` | Lists every category |
| `GET` | `/products/category/{name}` | Lists the products of a category |
| `POST` | `/products` | Creates a product |
| `PUT` | `/products/{id}` | Replaces a product |
| `PATCH` | `/products/{id}` | Updates specific fields |
| `DELETE` | `/products/{id}` | Removes a product |

**Carts**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/carts` | Lists every cart (7) |
| `GET` | `/carts/{id}` | Looks a cart up by id |
| `GET` | `/carts/user/{userId}` | A user's carts |
| `GET` | `/carts?limit={n}` / `?sort=` | Caps and sorts |
| `GET` | `/carts?startdate=&enddate=` | Filters by period |
| `POST` / `PUT` / `DELETE` | `/carts[/{id}]` | Creates, updates and removes |

**Users and authentication**

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/users` | Lists every user (10) |
| `GET` | `/users/{id}` | Looks a user up by id |
| `GET` | `/users?limit={n}` / `?sort=` | Caps and sorts |
| `POST` / `PUT` / `DELETE` | `/users[/{id}]` | Creates, updates and removes |
| `POST` | `/auth/login` | Authenticates and returns a JWT |

> The Fake Store API is read-only in practice: `POST`, `PUT`, `PATCH` and `DELETE` answer
> successfully and return the simulated object, but the server state never changes. That
> is why the write tests assert only on the response — reading the resource again would
> confirm nothing.
>
> Only `/auth/login` returns real error codes (`401`/`400`). On the other resources, a
> `GET` for a nonexistent id answers `200` — with an empty body, `null` or `[]` depending
> on the endpoint. Each of those variations is documented in
> [Test cases](test-cases.md#api-behaviours-the-tests-pin-down).
