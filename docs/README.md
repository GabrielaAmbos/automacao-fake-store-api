# Documentação — Automação Fake Store API

Suíte de testes automatizados de API para a [Fake Store API](https://fakestoreapi.com),
escrita em JavaScript com o framework [Cypress](https://www.cypress.io) (v15).

O projeto é um estudo de automação de testes de API: **40 testes** cobrindo todos os
endpoints públicos da Fake Store API — produtos, categorias, carrinhos, usuários e
autenticação — usando `cy.request()`, comandos customizados e fixtures como massa de
dados.

## Índice

| Documento | Conteúdo |
| --- | --- |
| [Arquitetura](arquitetura.md) | Estrutura de pastas, configuração e decisões técnicas |
| [Comandos customizados](comandos-customizados.md) | Referência de todos os comandos `cy.*` do projeto |
| [Casos de teste](casos-de-teste.md) | O que cada teste valida e quais fixtures utiliza |
| [Execução e CI](execucao-e-ci.md) | Como rodar localmente, relatórios e GitHub Actions |
| [Melhorias conhecidas](melhorias-conhecidas.md) | Pontos em aberto e inconsistências mapeadas |

## Início rápido

```bash
# instalar dependências (requer Node >= 20)
npm i

# abrir o Test Runner (modo interativo)
npm run cy:open

# executar os testes em modo headless
npm run cy:run
```

Nenhuma variável de ambiente, autenticação ou banco de dados é necessária — a Fake Store
API é pública e a `baseUrl` já está definida em `cypress.config.js`.

## Sistema sob teste

A Fake Store API é uma API REST pública de e-commerce fake, usada para prototipagem e
estudos. Todos os endpoints abaixo são exercitados pela suíte:

**Produtos**

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/products` | Lista todos os produtos (20) |
| `GET` | `/products/{id}` | Busca um produto por id |
| `GET` | `/products?limit={n}` | Lista produtos limitando a quantidade |
| `GET` | `/products?sort={asc\|desc}` | Lista produtos ordenados |
| `GET` | `/products/categories` | Lista todas as categorias |
| `GET` | `/products/category/{nome}` | Lista produtos de uma categoria |
| `POST` | `/products` | Cria um produto |
| `PUT` | `/products/{id}` | Atualiza um produto por completo |
| `PATCH` | `/products/{id}` | Atualiza campos específicos |
| `DELETE` | `/products/{id}` | Remove um produto |

**Carrinhos**

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/carts` | Lista todos os carrinhos (7) |
| `GET` | `/carts/{id}` | Busca um carrinho por id |
| `GET` | `/carts/user/{userId}` | Carrinhos de um usuário |
| `GET` | `/carts?limit={n}` / `?sort=` | Limita e ordena |
| `GET` | `/carts?startdate=&enddate=` | Filtra por período |
| `POST` / `PUT` / `DELETE` | `/carts[/{id}]` | Cria, atualiza e remove |

**Usuários e autenticação**

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/users` | Lista todos os usuários (10) |
| `GET` | `/users/{id}` | Busca um usuário por id |
| `GET` | `/users?limit={n}` / `?sort=` | Limita e ordena |
| `POST` / `PUT` / `DELETE` | `/users[/{id}]` | Cria, atualiza e remove |
| `POST` | `/auth/login` | Autentica e devolve um token JWT |

> A Fake Store API é somente-leitura na prática: `POST`, `PUT`, `PATCH` e `DELETE`
> respondem com sucesso e devolvem o objeto simulado, mas não alteram o estado do
> servidor. Por isso os testes de escrita validam apenas a resposta — releitura não
> confirmaria nada.
>
> Só `/auth/login` devolve códigos de erro de verdade (`401`/`400`). Nos demais recursos,
> um `GET` para id inexistente responde `200` — com corpo vazio, `null` ou `[]` conforme
> o endpoint. Cada uma dessas variações está documentada em
> [Casos de teste](casos-de-teste.md#comportamentos-da-api-que-os-testes-documentam).
