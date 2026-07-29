# Casos de teste

**40 testes** distribuídos em quatro specs, uma por recurso da API.

| Spec | Recurso | Testes |
| --- | --- | --- |
| [products.cy.js](../cypress/e2e/products/products.cy.js) | `/products` | 15 |
| [carts.cy.js](../cypress/e2e/carts/carts.cy.js) | `/carts` | 12 |
| [users.cy.js](../cypress/e2e/users/users.cy.js) | `/users` | 9 |
| [auth.cy.js](../cypress/e2e/auth/auth.cy.js) | `/auth/login` | 4 |

Cada spec agrupa os testes em `context` internos — **Leitura**, **Categorias** e
**Escrita** — para separar o que consulta do que altera.

## Produtos — 15 testes

### Leitura

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Buscar todos os produtos | `GET /products` | `200`, array com 20 itens |
| Validar o contrato de um produto da listagem | `GET /products` | Chaves e tipos do objeto, incluindo `rating.rate` e `rating.count` |
| Buscar por um produto | `GET /products/9` | Compara `title`, `description`, `price` e `category` com a fixture |
| Buscar por produto inexistente | `GET /products/-1` | `200` com body vazio (`''`) |
| Limitar a quantidade de produtos | `GET /products?limit=3` | Retorna exatamente 3 itens |
| Ordenar de forma crescente | `GET /products?sort=asc` | Ids em ordem crescente |
| Ordenar de forma decrescente | `GET /products?sort=desc` | Ids em ordem decrescente |

### Categorias

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Buscar todas as categorias | `GET /products/categories` | As 4 categorias, **sem depender da ordem** |
| Buscar por uma categoria | `GET /products/category/electronics` | Todo item retornado tem `category === 'electronics'` |
| Buscar por uma categoria com espaço no nome | `GET /products/category/men's clothing` | O encode da URL funciona |
| Buscar por uma categoria inexistente | `GET /products/category/noneC` | `200` com array vazio |

### Escrita

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Cadastrar um novo produto | `POST /products` | `201`, id gerado, campos ecoados |
| Atualizar um produto por completo | `PUT /products/7` | `200`, id preservado, campos atualizados |
| Atualizar apenas o preço | `PATCH /products/7` | `200`, só o preço muda |
| Excluir um produto | `DELETE /products/6` | `200`, resposta traz o produto excluído |

## Carrinhos — 12 testes

### Leitura

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Buscar todos os carrinhos | `GET /carts` | `200`, array com 7 itens |
| Validar o contrato de um carrinho | `GET /carts` | `id`, `userId`, `date` e cada item de `products` com `productId`/`quantity` |
| Buscar por um carrinho | `GET /carts/1` | `200`, id correto, lista de produtos preenchida |
| Buscar por carrinho inexistente | `GET /carts/999` | `200` com body **`null`** |
| Buscar os carrinhos de um usuário | `GET /carts/user/1` | Todo carrinho tem `userId === 1` |
| Buscar os carrinhos de um usuário sem compras | `GET /carts/user/999` | `200` com array vazio |
| Limitar a quantidade de carrinhos | `GET /carts?limit=2` | Retorna 2 itens |
| Ordenar de forma decrescente | `GET /carts?sort=desc` | Ids em ordem decrescente |
| Buscar por intervalo de datas | `GET /carts?startdate=&enddate=` | `200` e array (ver ressalva abaixo) |

### Escrita

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Cadastrar um novo carrinho | `POST /carts` | `201`, id gerado, `products` ecoado |
| Atualizar um carrinho | `PUT /carts/3` | `200`, id preservado |
| Excluir um carrinho | `DELETE /carts/2` | `200`, resposta traz o carrinho excluído |

> **Ressalva sobre o filtro de datas:** o teste verifica apenas status e tipo, porque a
> API ignora o intervalo — `startdate=2019-12-10&enddate=2020-10-10` devolve os 7
> carrinhos, incluindo os de fora da faixa. Asseverar a filtragem faria o teste falhar
> contra o comportamento real.

## Usuários — 9 testes

### Leitura

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Buscar todos os usuários | `GET /users` | `200`, array com 10 itens |
| Validar o contrato de um usuário | `GET /users` | `name.firstname/lastname`, `address` e `address.geolocation` aninhados |
| Buscar por um usuário | `GET /users/1` | `200`, id correto |
| Buscar por usuário inexistente | `GET /users/999` | `200` com body **`null`** |
| Limitar a quantidade de usuários | `GET /users?limit=2` | Retorna 2 itens |
| Ordenar de forma decrescente | `GET /users?sort=desc` | Ids em ordem decrescente |

### Escrita

| Teste | Endpoint | Valida |
| --- | --- | --- |
| Cadastrar um novo usuário | `POST /users` | `201` — a resposta traz **apenas** `{ id }` |
| Atualizar um usuário | `PUT /users/1` | `200`, campos ecoados (sem `id` na resposta) |
| Excluir um usuário | `DELETE /users/2` | `200`, resposta traz o usuário excluído |

## Autenticação — 4 testes

| Teste | Cenário | Valida |
| --- | --- | --- |
| Autenticar com credenciais válidas | `johnd` / senha correta | `201` e token no formato JWT (`x.y.z`) |
| Rejeitar credenciais inválidas | usuário inexistente | `401`, corpo contém `incorrect` |
| Rejeitar login com a senha errada | usuário válido, senha errada | `401` |
| Rejeitar login sem username e password | body `{}` | `400`, corpo contém `not provided` |

O comando `cy.postLogin()` usa `failOnStatusCode: false`, sem o qual o Cypress falharia
sozinho ao receber `401`/`400` — que é exatamente o esperado nesses cenários.

## Comportamentos da API que os testes documentam

A suíte serve também como registro de peculiaridades da Fake Store API, descobertas ao
sondar os endpoints antes de escrever as asserções:

| Situação | Resposta |
| --- | --- |
| `GET /products/{id inexistente}` | `200` com body **vazio** (`''`) |
| `GET /carts/{id inexistente}` | `200` com body **`null`** |
| `GET /users/{id inexistente}` | `200` com body **`null`** |
| `GET /products/category/{inexistente}` | `200` com **array vazio** |
| `POST` em qualquer recurso | **`201`** |
| `PUT` / `PATCH` / `DELETE` | **`200`** |
| `DELETE` | Retorna o recurso excluído, não um corpo vazio |
| `POST /users` | Retorna só `{ id }`, diferente dos outros POSTs |
| `POST /auth/login` com erro | `401` / `400` com corpo em **texto puro**, não JSON |

Nenhum `4xx` é devolvido para recurso inexistente em `GET` — só a autenticação usa
códigos de erro de verdade.

## Fixtures

| Arquivo | Conteúdo | Usada por |
| --- | --- | --- |
| `hard_drive_portable_2t.json` | Produto completo (id 9) | Buscar por um produto |
| `all_categories.json` | As 4 categorias nomeadas | Buscar todas as categorias |
| `new_product.json` | Payload de produto para `POST`/`PUT` | Testes de escrita de produtos |
| `new_cart.json` | Payload de carrinho | Testes de escrita de carrinhos |
| `new_user.json` | Payload de usuário | Testes de escrita de usuários |
| `credentials.json` | Credenciais válidas e inválidas | Todos os testes de autenticação |
| `all_electronics_products.json` | Array de produtos electronics | **Nenhuma** |
| `all_jewelery_products.json` | Array de produtos jewelery | **Nenhuma** |

As duas últimas continuam ociosas de propósito: o teste de categoria valida que **todo**
item retornado pertence à categoria pedida, em vez de comparar com uma lista fixa. Isso
não quebra quando o catálogo da API muda.

> As credenciais em `credentials.json` são as de demonstração publicadas pela própria
> Fake Store API — não são segredos.

## Tags

| Tag | Alcance | Testes |
| --- | --- | --- |
| `@regression` | Todas as specs | 40 |
| `@products` | Spec de produtos | 15 |
| `@carts` | Spec de carrinhos | 12 |
| `@users` | Spec de usuários | 9 |
| `@smoke` | Um caso principal por recurso | 7 |
| `@auth` | Spec de autenticação | 4 |
| `@activities` | Spec de produtos (herdada do projeto original) | 15 |

```bash
npx cypress run --expose grepTags=@smoke
```

Detalhes de sintaxe em [Execução e CI](execucao-e-ci.md#filtrar-testes-por-tag).
