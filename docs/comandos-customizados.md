# Comandos customizados

Os comandos ficam em `cypress/support/`, um arquivo por recurso da API, e são registrados
globalmente por [cypress/support/e2e.js](../cypress/support/e2e.js) — ficando disponíveis
como `cy.<comando>()` em qualquer spec.

| Arquivo | Recurso |
| --- | --- |
| [products_commands.js](../cypress/support/products_commands.js) | `/products` |
| [carts_commands.js](../cypress/support/carts_commands.js) | `/carts` |
| [users_commands.js](../cypress/support/users_commands.js) | `/users` |
| [auth_commands.js](../cypress/support/auth_commands.js) | `/auth/login` |

Cada comando devolve o *yield* de `cy.request()`, ou seja, um objeto de resposta com
`status`, `body`, `headers` e `duration`. As asserções acontecem no `.then()` da spec.

## Produtos

| Comando | Requisição |
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

`getSpecificCategory` aplica `encodeURIComponent` no nome, o que é necessário para
categorias com espaço e apóstrofo como `men's clothing`.

## Carrinhos

| Comando | Requisição |
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

## Usuários

| Comando | Requisição |
| --- | --- |
| `cy.getAllUsers()` | `GET /users` |
| `cy.getSingleUser(id)` | `GET /users/{id}` |
| `cy.getUsersLimitResult(limit)` | `GET /users?limit={limit}` |
| `cy.getUsersSortResult(direction)` | `GET /users?sort={asc\|desc}` |
| `cy.postAddNewUser(jsonBody)` | `POST /users` |
| `cy.putUpdateUser(id, jsonBody)` | `PUT /users/{id}` |
| `cy.deleteUser(id)` | `DELETE /users/{id}` |

## Autenticação

| Comando | Requisição |
| --- | --- |
| `cy.postLogin(jsonBody)` | `POST /auth/login` |

Único comando com `failOnStatusCode: false`, para que os cenários negativos (`401` de
credencial inválida, `400` de payload malformado) cheguem ao `.then()` em vez de o
Cypress falhar sozinho.

```js
cy.postLogin({ username: 'johnd', password: 'errada' }).then(response => {
  expect(response.status).to.equal(401)
})
```

## Como adicionar um novo comando

1. Declare-o no arquivo do recurso correspondente usando `Cypress.Commands.add`. Recurso
   novo pede arquivo novo, importado em `cypress/support/e2e.js`.
2. Use caminho relativo (`/products/...`) para respeitar a `baseUrl`.
3. Não coloque asserções dentro do comando — ele apenas transporta a resposta.
4. Se a API puder retornar erro (4xx/5xx) e isso for o esperado no teste, adicione
   `failOnStatusCode: false`.
5. Comandos de escrita recebem o payload como parâmetro; não embuta corpo fixo no
   comando.

```js
Cypress.Commands.add('putUpdateProduct', (productId, jsonBody) => {
    cy.request({
        method: 'PUT',
        url: '/products/' + productId,
        body: jsonBody
    })
})
```
