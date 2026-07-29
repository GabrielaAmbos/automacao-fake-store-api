# Test cases

**40 tests** across four specs, one per API resource.

| Spec | Resource | Tests |
| --- | --- | --- |
| [products.cy.js](../cypress/e2e/products/products.cy.js) | `/products` | 15 |
| [carts.cy.js](../cypress/e2e/carts/carts.cy.js) | `/carts` | 12 |
| [users.cy.js](../cypress/e2e/users/users.cy.js) | `/users` | 9 |
| [auth.cy.js](../cypress/e2e/auth/auth.cy.js) | `/auth/login` | 4 |

Each spec groups its tests into inner `context` blocks — **Leitura** (read),
**Categorias** (categories) and **Escrita** (write) — separating what queries from what
changes.

> Test titles are written in Portuguese in the code, and are quoted verbatim below so
> that the tables line up with the runner output.

## Products — 15 tests

### Leitura (read)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Buscar todos os produtos | `GET /products` | `200`, array of 20 items |
| Validar o contrato de um produto da listagem | `GET /products` | Object keys and types, including `rating.rate` and `rating.count` |
| Buscar por um produto | `GET /products/9` | Compares `title`, `description`, `price` and `category` against the fixture |
| Buscar por produto inexistente | `GET /products/-1` | `200` with an empty body (`''`) |
| Limitar a quantidade de produtos | `GET /products?limit=3` | Returns exactly 3 items |
| Ordenar de forma crescente | `GET /products?sort=asc` | Ids in ascending order |
| Ordenar de forma decrescente | `GET /products?sort=desc` | Ids in descending order |

### Categorias (categories)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Buscar todas as categorias | `GET /products/categories` | All 4 categories, **regardless of order** |
| Buscar por uma categoria | `GET /products/category/electronics` | Every returned item has `category === 'electronics'` |
| Buscar por uma categoria com espaço no nome | `GET /products/category/men's clothing` | URL encoding works |
| Buscar por uma categoria inexistente | `GET /products/category/noneC` | `200` with an empty array |

### Escrita (write)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Cadastrar um novo produto | `POST /products` | `201`, generated id, fields echoed back |
| Atualizar um produto por completo | `PUT /products/7` | `200`, id preserved, fields updated |
| Atualizar apenas o preço | `PATCH /products/7` | `200`, only the price changes |
| Excluir um produto | `DELETE /products/6` | `200`, the response carries the deleted product |

## Carts — 12 tests

### Leitura (read)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Buscar todos os carrinhos | `GET /carts` | `200`, array of 7 items |
| Validar o contrato de um carrinho | `GET /carts` | `id`, `userId`, `date` and each `products` entry with `productId`/`quantity` |
| Buscar por um carrinho | `GET /carts/1` | `200`, correct id, product list populated |
| Buscar por carrinho inexistente | `GET /carts/999` | `200` with a **`null`** body |
| Buscar os carrinhos de um usuário | `GET /carts/user/1` | Every cart has `userId === 1` |
| Buscar os carrinhos de um usuário sem compras | `GET /carts/user/999` | `200` with an empty array |
| Limitar a quantidade de carrinhos | `GET /carts?limit=2` | Returns 2 items |
| Ordenar de forma decrescente | `GET /carts?sort=desc` | Ids in descending order |
| Buscar por intervalo de datas | `GET /carts?startdate=&enddate=` | `200` and an array (see the caveat below) |

### Escrita (write)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Cadastrar um novo carrinho | `POST /carts` | `201`, generated id, `products` echoed back |
| Atualizar um carrinho | `PUT /carts/3` | `200`, id preserved |
| Excluir um carrinho | `DELETE /carts/2` | `200`, the response carries the deleted cart |

> **Caveat on the date filter:** the test checks status and type only, because the API
> ignores the range — `startdate=2019-12-10&enddate=2020-10-10` returns all 7 carts,
> including the ones outside it. Asserting the filtering would make the test fail against
> real behaviour.

## Users — 9 tests

### Leitura (read)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Buscar todos os usuários | `GET /users` | `200`, array of 10 items |
| Validar o contrato de um usuário | `GET /users` | Nested `name.firstname/lastname`, `address` and `address.geolocation` |
| Buscar por um usuário | `GET /users/1` | `200`, correct id |
| Buscar por usuário inexistente | `GET /users/999` | `200` with a **`null`** body |
| Limitar a quantidade de usuários | `GET /users?limit=2` | Returns 2 items |
| Ordenar de forma decrescente | `GET /users?sort=desc` | Ids in descending order |

### Escrita (write)

| Test | Endpoint | Verifies |
| --- | --- | --- |
| Cadastrar um novo usuário | `POST /users` | `201` — the response carries **only** `{ id }` |
| Atualizar um usuário | `PUT /users/1` | `200`, fields echoed back (no `id` in the response) |
| Excluir um usuário | `DELETE /users/2` | `200`, the response carries the deleted user |

## Authentication — 4 tests

| Test | Scenario | Verifies |
| --- | --- | --- |
| Autenticar com credenciais válidas | `johnd` / correct password | `201` and a token in JWT shape (`x.y.z`) |
| Rejeitar credenciais inválidas | nonexistent user | `401`, body contains `incorrect` |
| Rejeitar login com a senha errada | valid user, wrong password | `401` |
| Rejeitar login sem username e password | body `{}` | `400`, body contains `not provided` |

The `cy.postLogin()` command uses `failOnStatusCode: false`; without it Cypress would
fail on its own upon receiving `401`/`400` — which is exactly what these scenarios
expect.

## API behaviours the tests pin down

The suite doubles as a record of the Fake Store API's quirks, found by probing the
endpoints before writing any assertion:

| Situation | Response |
| --- | --- |
| `GET /products/{nonexistent id}` | `200` with an **empty** body (`''`) |
| `GET /carts/{nonexistent id}` | `200` with a **`null`** body |
| `GET /users/{nonexistent id}` | `200` with a **`null`** body |
| `GET /products/category/{nonexistent}` | `200` with an **empty array** |
| `POST` on any resource | **`201`** |
| `PUT` / `PATCH` / `DELETE` | **`200`** |
| `DELETE` | Returns the deleted resource, not an empty body |
| `POST /users` | Returns only `{ id }`, unlike the other POSTs |
| `POST /auth/login` on error | `401` / `400` with a **plain-text** body, not JSON |

No `4xx` is ever returned for a nonexistent resource on `GET` — only authentication uses
real error codes.

## Fixtures

| File | Contents | Used by |
| --- | --- | --- |
| `hard_drive_portable_2t.json` | A complete product (id 9) | Buscar por um produto |
| `all_categories.json` | The 4 named categories | Buscar todas as categorias |
| `new_product.json` | Product payload for `POST`/`PUT` | Product write tests |
| `new_cart.json` | Cart payload | Cart write tests |
| `new_user.json` | User payload | User write tests |
| `credentials.json` | Valid and invalid credentials | Every authentication test |
| `all_electronics_products.json` | Array of electronics products | **None** |
| `all_jewelery_products.json` | Array of jewelery products | **None** |

The last two stay idle on purpose: the category test asserts that **every** returned item
belongs to the requested category rather than comparing against a fixed list. That does
not break when the API's catalogue changes.

> The credentials in `credentials.json` are the public demo ones published by the Fake
> Store API itself — they are not secrets.

## Tags

| Tag | Scope | Tests |
| --- | --- | --- |
| `@regression` | Every spec | 40 |
| `@products` | Products spec | 15 |
| `@carts` | Carts spec | 12 |
| `@users` | Users spec | 9 |
| `@smoke` | One key case per resource | 7 |
| `@auth` | Authentication spec | 4 |
| `@activities` | Products spec (inherited from the original project) | 15 |

```bash
npx cypress run --expose grepTags=@smoke
```

Syntax details in [Running and CI](running-and-ci.md#filtering-tests-by-tag).
