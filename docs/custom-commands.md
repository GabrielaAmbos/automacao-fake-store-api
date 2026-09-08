# Comandos customizados

Os comandos vivem em `cypress/support/`, um arquivo por recurso da API, registrados
globalmente por [cypress/support/e2e.js](../cypress/support/e2e.js) — o que os deixa
disponíveis como `cy.<comando>()` em qualquer spec.

| Arquivo | Recurso |
| --- | --- |
| [products_commands.js](../cypress/support/products_commands.js) | `/products` |
| [carts_commands.js](../cypress/support/carts_commands.js) | `/carts` |
| [users_commands.js](../cypress/support/users_commands.js) | `/users` |
| [auth_commands.js](../cypress/support/auth_commands.js) | `/auth/login` |

Todo comando devolve exatamente o que `cy.request()` devolve: um objeto de resposta com
`status`, `body`, `headers` e `duration`. As asserções ficam no `.then()` da spec.

Os 27 comandos estão tipados em
[cypress/support/index.d.ts](../cypress/support/index.d.ts), então os editores dão
autocomplete e mostram os parâmetros.

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

`getSpecificCategory` passa o nome por `encodeURIComponent`, o que é o que torna
testável uma categoria com espaço e apóstrofo, como `men's clothing`.

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

O único comando que carrega `failOnStatusCode: false`, para que os cenários negativos
(`401` para credencial errada, `400` para payload malformado) cheguem ao `.then()` em vez
de fazer o Cypress falhar sozinho.

```js
cy.postLogin({ username: 'johnd', password: 'errada' }).then(response => {
  expect(response.status).to.equal(401)
})
```

## Adicionando um novo comando

1. Declare-o no arquivo do recurso correspondente com `Cypress.Commands.add`. Um recurso
   novo ganha um arquivo novo, importado em `cypress/support/e2e.js`.
2. Use um caminho relativo (`/products/...`) para que a `baseUrl` seja respeitada.
3. Não coloque asserção no comando — ele só carrega a resposta.
4. Se a API puder responder com erro (4xx/5xx) e o teste esperar isso, adicione
   `failOnStatusCode: false`.
5. Comandos de escrita recebem o payload como parâmetro; nunca deixe o corpo fixo dentro
   do comando.
6. Declare o comando também em `cypress/support/index.d.ts`.

```js
Cypress.Commands.add('putUpdateProduct', (productId, jsonBody) => {
    cy.request({
        method: 'PUT',
        url: '/products/' + productId,
        body: jsonBody
    })
})
```
