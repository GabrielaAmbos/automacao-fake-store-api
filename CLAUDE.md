# CLAUDE.md

Contexto do projeto para o Claude Code.

## Convenções de idioma

- **Converse com a usuária sempre em português.**
- **Documentação (`docs/`, `README.md`, este arquivo): português.**
- **Código em inglês** — nomes de variáveis, funções, comandos customizados, comentários
  e mensagens de commit.
- Exceção histórica: os títulos dos testes (`context` / `it`) estão em português e os
  arquivos de teste seguem esse padrão. Manter a consistência dentro das specs
  existentes; o código ao redor (comandos, helpers) permanece em inglês.

## O que é o projeto

Suíte de testes automatizados de **API** para a [Fake Store API](https://fakestoreapi.com)
(`https://fakestoreapi.com`), escrita em JavaScript com **Cypress 15.19.0**. Projeto de
estudo de automação, focado nos endpoints de produtos e categorias.

Não há aplicação front-end, servidor ou banco de dados — apenas testes que fazem
`cy.request()` contra uma API pública. Nenhuma autenticação é necessária.

## Estrutura

```
config/base.js                             # factory da config compartilhada
config/dev.config.js                       # ambiente dev (usado no CI)
cypress.config.js                          # config padrão (execuções locais)
cypress/e2e/products/products.cy.js        # única spec do projeto
cypress/fixtures/*.json                    # massa de dados / valores esperados
cypress/support/e2e.js                     # registra o grep e os commands
cypress/support/products_commands.js       # todos os comandos customizados
.github/workflows/main.yml                 # pipeline de testes
.github/workflows/static.yml               # deploy no GitHub Pages
```

Documentação completa em [docs/](docs/README.md).

## Comandos

```bash
npm i             # instalar dependências (Node >= 20)
npm run cy:open   # abrir o Test Runner
npm run cy:run    # executar headless

npx cypress run --expose grepTags=@regression          # filtrar por tag
npx cypress run --config-file config/dev.config.js     # ambiente específico
```

## Padrões a seguir

- **Nunca monte URL dentro da spec.** Chamadas HTTP ficam em
  `cypress/support/products_commands.js` como `Cypress.Commands.add`, sempre com caminho
  relativo (`/products/...`) para respeitar a `baseUrl`.
- **Comandos não fazem asserção.** Eles só devolvem a resposta do `cy.request()`; o
  `expect` fica na spec, dentro do `.then()`.
- **Dados esperados vão em fixtures**, não hardcoded na spec. Carregue com
  `cy.fixture('arquivo.json').then(expectBody => { ... })`.
- Ao adicionar uma spec, siga a estrutura `cypress/e2e/<recurso>/<recurso>.cy.js`.
- Se um teste espera resposta de erro (4xx/5xx), passe `failOnStatusCode: false` no
  `cy.request()`.
- Config nova vai em `config/base.js` (compartilhada por todos os ambientes), não
  duplicada em cada arquivo de ambiente.

## Particularidades da Fake Store API

- Id inexistente retorna **`200` com body vazio (`''`)**, não `404`. Há um teste que
  documenta isso.
- `POST`, `PUT` e `DELETE` respondem com sucesso mas **não persistem** nada. Não é
  possível validar escrita relendo o recurso.
- O campo `rating` dos produtos muda com o tempo — evite asserções sobre ele.
- `GET /products/categories` devolve um array; a ordem não é garantida por contrato.

## Particularidades do Cypress 15

- **`Cypress.env()` está depreciado.** A config define `allowCypressEnv: false`. Valores
  públicos passam por `--expose` / `Cypress.expose()`; sensíveis, por `cy.env()`.
  Consequência prática: o filtro de tags usa `--expose grepTags=...`, **não** `--env`.
- **`@cypress/grep` v6** usa named exports:
  `const { register } = require('@cypress/grep')` no support e
  `const { plugin } = require('@cypress/grep/plugin')` no `setupNodeEvents`.
  O pacote antigo `cypress-grep` está depreciado — não voltar a ele.
- **Node >= 20** é obrigatório (`engines` no `package.json`).
- Gravação de vídeo vem desabilitada por padrão.

### Rodando no terminal do VS Code

O terminal integrado define `ELECTRON_RUN_AS_NODE=1`, o que faz o binário do Cypress
subir como Node puro e falhar com `bad option: --no-sandbox`. Antes de rodar:

```bash
unset ELECTRON_RUN_AS_NODE && npx cypress run
```

## Estado conhecido

Pontos em aberto mapeados em [docs/melhorias-conhecidas.md](docs/melhorias-conhecidas.md).
Os mais relevantes ao mexer no código:

- `deleteProduct` chama `getUrlAllProducts()`, função que não existe → `ReferenceError`.
- `putUpdateProduct` faz `PUT` sem body.
- O teste "Buscar por uma categoria" está comentado e sem o `it(` inicial; referencia a
  fixture `all_eletronic_products.json`, que não existe.
- Dependências instaladas e sem uso: `dotenv`, `express`, `joi`, `mongodb`, `mongoose`,
  `node-fetch`, `npm-run-all`. Respondem pela maior parte dos alertas do `npm audit`.
