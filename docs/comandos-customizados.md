# Comandos customizados

Todos os comandos ficam em [cypress/support/products_commands.js](../cypress/support/products_commands.js)
e são registrados globalmente por [cypress/support/e2e.js](../cypress/support/e2e.js),
ficando disponíveis como `cy.<comando>()` em qualquer spec.

Cada comando devolve o *yield* de `cy.request()`, ou seja, um objeto de resposta com
`status`, `body`, `headers` e `duration`. As asserções acontecem no `.then()` da spec.

## Referência

### `cy.getAllProductos()`

`GET /products` — retorna a lista completa de produtos.

```js
cy.getAllProductos().then(response => {
  expect(response.status).to.equal(200)
})
```

> O nome mistura português e inglês (`Productos`). Mantido como está para não quebrar as
> specs existentes; a padronização para `getAllProducts` está listada em
> [Melhorias conhecidas](melhorias-conhecidas.md).

### `cy.getSingleProduct(queryString)`

`GET /products/{queryString}` — busca um produto por id.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `queryString` | `number \| string` | Id do produto |

```js
cy.getSingleProduct(9).then(response => {
  expect(response.body.category).to.equal('electronics')
})
```

### `cy.getProductsLimitResult(queryString)`

`GET /products?limit={queryString}` — limita a quantidade de produtos retornados.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `queryString` | `number` | Quantidade máxima de itens |

### `cy.getProductsSortResult(queryString)`

`GET /products?sort={queryString}` — ordena o resultado.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `queryString` | `'asc' \| 'desc'` | Direção da ordenação |

### `cy.getAllCategories()`

`GET /products/categories` — retorna o array de nomes de categoria.

### `cy.getSpecificCategory(queryString)`

`GET /products/category/{queryString}` — retorna os produtos de uma categoria.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `queryString` | `string` | `electronics`, `jewelery`, `men's clothing` ou `women's clothing` |

### `cy.postAddNewProduct(jsonBody)`

`POST /products` — cria um produto.

| Parâmetro | Tipo | Descrição |
| --- | --- | --- |
| `jsonBody` | `object` | Corpo do produto a criar |

### `cy.putUpdateProduct(productId)`

`PUT products/{productId}` — atualiza um produto.

> ⚠️ Duas limitações: o comando **não envia body**, então não há o que atualizar; e a URL
> é `'products/' + productId` (sem a barra inicial), o que resolve de forma diferente das
> demais em relação à `baseUrl`.

### `cy.deleteProduct(productId)`

`DELETE` de um produto.

> ⚠️ **Comando quebrado.** A URL é montada com `getUrlAllProducts()`, uma função que não
> existe no projeto. Qualquer chamada lança `ReferenceError`.

## Cobertura atual

| Comando | Usado em teste |
| --- | --- |
| `getAllProductos` | ✅ |
| `getSingleProduct` | ✅ |
| `getAllCategories` | ✅ |
| `getSpecificCategory` | ⚠️ apenas em testes comentados |
| `getProductsLimitResult` | ❌ |
| `getProductsSortResult` | ❌ |
| `postAddNewProduct` | ❌ |
| `putUpdateProduct` | ❌ |
| `deleteProduct` | ❌ |

## Como adicionar um novo comando

1. Declare-o em `cypress/support/products_commands.js` usando `Cypress.Commands.add`.
2. Use caminho relativo (`/products/...`) para respeitar a `baseUrl` da configuração.
3. Não coloque asserções dentro do comando — ele apenas transporta a resposta.
4. Se a API puder retornar erro (4xx/5xx) e isso for o esperado no teste, adicione
   `failOnStatusCode: false` ao objeto de request.

```js
Cypress.Commands.add('getProductsSortResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/products?sort=' + queryString
    })
})
```
