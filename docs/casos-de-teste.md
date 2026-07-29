# Casos de teste

Arquivo: [cypress/e2e/products/products.cy.js](../cypress/e2e/products/products.cy.js)

Todos os testes estão sob o `context('Produtos')`, marcado com as tags
`@regression` e `@activities`.

## Resumo

| # | Teste | Endpoint | Fixture | Status |
| --- | --- | --- | --- | --- |
| 1 | Buscar todos os produtos | `GET /products` | — | ativo |
| 2 | Buscar por um produto | `GET /products/9` | `hard_drive_portable_2t.json` | ativo |
| 3 | Buscar por produto inexistente | `GET /products/-1` | — | ativo |
| 4 | Buscar todas as categorias | `GET /products/categories` | `all_categories.json` | ativo |
| 5 | Buscar por uma categoria | `GET /products/category/{nome}` | `all_electronics_products.json` | comentado |
| 6 | Buscar por uma categoria inexistente | `GET /products/category/noneC` | — | comentado |

## Detalhamento

### 1. Buscar todos os produtos

Valida apenas o contrato mínimo: a listagem responde `200`.

```js
cy.getAllProductos().then(response => {
  expect(response.status).to.equal(200)
})
```

Não há asserção sobre o corpo — nem tamanho da lista, nem formato dos itens.

### 2. Buscar por um produto

Carrega a fixture `hard_drive_portable_2t.json` (produto de id `9`), consulta o produto
por esse id e compara campo a campo:

- `status` = `200`
- `body.title`, `body.description`, `body.price`, `body.category` iguais aos da fixture

Os campos `image` e `rating` não são verificados — `rating` muda ao longo do tempo na
API pública, então mantê-lo fora da asserção evita falha intermitente.

### 3. Buscar por produto inexistente

Consulta o id `-1` e espera:

- `status` = `200`
- `body` = `''` (string vazia)

Este é o comportamento real da Fake Store API: em vez de `404`, ela responde `200` com
corpo vazio para ids inexistentes. O teste documenta essa peculiaridade.

### 4. Buscar todas as categorias

Compara o array retornado, **posição a posição**, com os valores da fixture
`all_categories.json`:

| Índice | Valor esperado |
| --- | --- |
| `0` | `electronics` |
| `1` | `jewelery` |
| `2` | `men's clothing` |
| `3` | `women's clothing` |

O teste depende da ordem em que a API devolve as categorias — se ela mudar, o teste
quebra mesmo com o conteúdo correto.

### 5 e 6. Testes de categoria (comentados)

Ficam no fim do arquivo, desativados. Dois problemas os impedem de rodar como estão:

- **Teste 5** — perdeu o prefixo `it(`, então é apenas uma expressão solta. Além disso
  usa `'eletronic'` (grafia incorreta; a categoria válida é `electronics`) e busca a
  fixture `all_eletronic_products.json`, enquanto o arquivo existente chama-se
  `all_electronics_products.json`. Sua asserção `expect(response.body)` também não
  compara nada.
- **Teste 6** — assume corpo vazio para categoria inexistente, replicando a expectativa
  do teste 3.

## Fixtures

| Arquivo | Conteúdo | Usada por |
| --- | --- | --- |
| `hard_drive_portable_2t.json` | Um produto completo (id 9, categoria electronics) | Teste 2 |
| `all_categories.json` | Objeto com as 4 categorias nomeadas | Teste 4 |
| `all_electronics_products.json` | Array de produtos da categoria electronics | Nenhuma (prevista para o teste 5) |
| `all_jewelery_products.json` | Array de produtos da categoria jewelery | Nenhuma |

Em `all_categories.json` as categorias são **chaves nomeadas** (`category_electronics`),
não um array — por isso o teste 4 acessa `expectBody.category_electronics` e compara com
`response.body[0]`.

## Tags

O `context` e o teste 2 declaram tags no segundo argumento:

```js
context('Produtos', { tags: ['@regression', '@activities'] }, () => { ... })
it('Buscar por um produto', { tags: ['@regression'] }, () => { ... })
```

Essas tags são consumidas pelo `@cypress/grep`, registrado em
[cypress/support/e2e.js](../cypress/support/e2e.js). Para filtrar:

```bash
npx cypress run --expose grepTags=@regression
```

Como o `context` inteiro está marcado, `@regression` e `@activities` selecionam os quatro
testes. Detalhes de sintaxe em [Execução e CI](execucao-e-ci.md#filtrar-testes-por-tag).
