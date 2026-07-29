# Custom commands

The commands live under `cypress/support/`, one file per API resource, registered
globally by [cypress/support/e2e.js](../cypress/support/e2e.js) — which makes them
available as `cy.<command>()` in any spec.

| File | Resource |
| --- | --- |
| [products_commands.js](../cypress/support/products_commands.js) | `/products` |
| [carts_commands.js](../cypress/support/carts_commands.js) | `/carts` |
| [users_commands.js](../cypress/support/users_commands.js) | `/users` |
| [auth_commands.js](../cypress/support/auth_commands.js) | `/auth/login` |

Every command yields whatever `cy.request()` yields: a response object carrying `status`,
`body`, `headers` and `duration`. Assertions happen in the spec's `.then()`.

All 27 commands are typed in [cypress/support/index.d.ts](../cypress/support/index.d.ts),
so editors autocomplete them and show their parameters.

## Products

| Command | Request |
| --- | --- |
| `cy.getAllProducts()` | `GET /products` |
| `cy.getSingleProduct(id)` | `GET /products/{id}` |
| `cy.getProductsLimitResult(limit)` | `GET /products?limit={limit}` |
| `cy.getProductsSortResult(direction)` | `GET /products?sort={asc\|desc}` |
| `cy.getAllCategories()` | `GET /products/categories` |
| `cy.getSpecificCategory(name)` | `GET /products/category/{name}` |
| `cy.postAddNewProduct(jsonBody)` | `POST /products` |
| `cy.putUpdateProduct(id, jsonBody)` | `PUT /products/{id}` |
| `cy.patchUpdateProduct(id, jsonBody)` | `PATCH /products/{id}` |
| `cy.deleteProduct(id)` | `DELETE /products/{id}` |

```js
cy.getSingleProduct(9).then(response => {
  expect(response.body.category).to.equal('electronics')
})
```

`getSpecificCategory` runs the name through `encodeURIComponent`, which is what makes
categories containing a space and an apostrophe — such as `men's clothing` — testable.

## Carts

| Command | Request |
| --- | --- |
| `cy.getAllCarts()` | `GET /carts` |
| `cy.getSingleCart(id)` | `GET /carts/{id}` |
| `cy.getCartsByUser(userId)` | `GET /carts/user/{userId}` |
| `cy.getCartsLimitResult(limit)` | `GET /carts?limit={limit}` |
| `cy.getCartsSortResult(direction)` | `GET /carts?sort={asc\|desc}` |
| `cy.getCartsByDateRange(start, end)` | `GET /carts?startdate={start}&enddate={end}` |
| `cy.postAddNewCart(jsonBody)` | `POST /carts` |
| `cy.putUpdateCart(id, jsonBody)` | `PUT /carts/{id}` |
| `cy.deleteCart(id)` | `DELETE /carts/{id}` |

## Users

| Command | Request |
| --- | --- |
| `cy.getAllUsers()` | `GET /users` |
| `cy.getSingleUser(id)` | `GET /users/{id}` |
| `cy.getUsersLimitResult(limit)` | `GET /users?limit={limit}` |
| `cy.getUsersSortResult(direction)` | `GET /users?sort={asc\|desc}` |
| `cy.postAddNewUser(jsonBody)` | `POST /users` |
| `cy.putUpdateUser(id, jsonBody)` | `PUT /users/{id}` |
| `cy.deleteUser(id)` | `DELETE /users/{id}` |

## Authentication

| Command | Request |
| --- | --- |
| `cy.postLogin(jsonBody)` | `POST /auth/login` |

The only command carrying `failOnStatusCode: false`, so the negative scenarios (`401` for
bad credentials, `400` for a malformed payload) reach the `.then()` instead of making
Cypress fail on its own.

```js
cy.postLogin({ username: 'johnd', password: 'wrong' }).then(response => {
  expect(response.status).to.equal(401)
})
```

## Adding a new command

1. Declare it in the matching resource file with `Cypress.Commands.add`. A new resource
   gets a new file, imported from `cypress/support/e2e.js`.
2. Use a relative path (`/products/...`) so the `baseUrl` applies.
3. Keep assertions out of the command — it only carries the response.
4. If the API may answer with an error (4xx/5xx) and the test expects that, add
   `failOnStatusCode: false`.
5. Write commands take the payload as a parameter; never hardcode a body inside the
   command.
6. Declare the command in `cypress/support/index.d.ts` as well.

```js
Cypress.Commands.add('putUpdateProduct', (productId, jsonBody) => {
    cy.request({
        method: 'PUT',
        url: '/products/' + productId,
        body: jsonBody
    })
})
```
