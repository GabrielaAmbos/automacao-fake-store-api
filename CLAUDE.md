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
estudo de automação. **40 testes** cobrindo todos os endpoints públicos: produtos,
carrinhos, usuários e autenticação.

Não há aplicação front-end, servidor ou banco de dados — apenas testes que fazem
`cy.request()` contra uma API pública. Nenhum endpoint exige autenticação; `/auth/login`
é testado como recurso, não como pré-requisito.

## Estrutura

```
config/base.js                             # factory da config compartilhada
config/dev.config.js                       # ambiente dev (usado no CI)
cypress.config.js                          # config padrão (execuções locais)
cypress/e2e/<recurso>/<recurso>.cy.js      # uma spec por recurso (auth, carts, products, users)
cypress/fixtures/*.json                    # payloads de escrita e valores esperados
cypress/support/e2e.js                     # registra o grep e os commands
cypress/support/<recurso>_commands.js      # comandos customizados, um arquivo por recurso
.github/workflows/main.yml                 # pipeline de testes
.github/workflows/lint.yml                 # ESLint em PR e push na main
```

Documentação completa em [docs/](docs/README.md).

## Comandos

```bash
npm i             # instalar dependências (Node >= 20; .nvmrc fixa a 22)
npm run cy:open   # abrir o Test Runner
npm test          # executar headless
npm run lint      # ESLint (roda no CI antes dos testes)

npx cypress run --expose grepTags=@regression          # filtrar por tag
npx cypress run --config-file config/dev.config.js     # ambiente específico
```

**Rode `npm run lint` E `npm test` localmente antes de considerar qualquer mudança
pronta.** O CI de pull request roda **apenas o lint** — a Fake Store API responde 403 aos
runners hospedados do GitHub (bloqueio de IP de datacenter), então a suíte de API não é
executada lá. Verde no PR não significa que os testes passaram.

O hook `.githooks/pre-push` roda os dois automaticamente antes de cada push (instalado
pelo script `prepare`, via `core.hooksPath`). Não use `git push --no-verify` para
contornar teste falhando — ele existe para push de documentação.

## Padrões a seguir

- **Nunca monte URL dentro da spec.** Chamadas HTTP ficam em
  `cypress/support/products_commands.js` como `Cypress.Commands.add`, sempre com caminho
  relativo (`/products/...`) para respeitar a `baseUrl`.
- **Comandos não fazem asserção.** Eles só devolvem a resposta do `cy.request()`; o
  `expect` fica na spec, dentro do `.then()`.
- **Dados esperados vão em fixtures**, não hardcoded na spec. Carregue com
  `cy.fixture('arquivo.json').then(expectBody => { ... })`.
- Ao adicionar uma spec, siga a estrutura `cypress/e2e/<recurso>/<recurso>.cy.js`, com
  `context` internos separando **Leitura** de **Escrita**.
- Recurso novo pede arquivo de comandos próprio (`<recurso>_commands.js`), importado em
  `cypress/support/e2e.js`.
- **Ao adicionar, renomear ou remover um comando, atualize
  `cypress/support/index.d.ts`** — é ele que dá autocomplete no editor.
- Se um teste espera resposta de erro (4xx/5xx), passe `failOnStatusCode: false` no
  `cy.request()` — é o caso de `postLogin`.
- Tags: `@regression` em tudo, `@smoke` no caso principal de cada recurso, mais a tag do
  recurso (`@products`, `@carts`, `@users`, `@auth`).
- Config nova vai em `config/base.js` (compartilhada por todos os ambientes), não
  duplicada em cada arquivo de ambiente.

## Particularidades da Fake Store API

Confirmadas sondando a API; **não suponha o comportamento, verifique antes de asseverar.**

- Recurso inexistente em `GET` responde **`200`**, nunca `404`, e o corpo varia por
  endpoint: `/products/{id}` → `''` (string vazia), `/carts/{id}` e `/users/{id}` →
  `null`, `/products/category/{nome}` e `/carts/user/{id}` → `[]`.
- `POST` responde **`201`**; `PUT`, `PATCH` e `DELETE` respondem **`200`**.
- `DELETE` devolve o recurso excluído, não um corpo vazio.
- `POST /users` devolve **só `{ id }`** — diferente dos outros POSTs, que ecoam o payload.
- Escrita **não persiste**. Testes de escrita validam apenas a resposta; releitura não
  confirma nada.
- `/auth/login` é o único com erro de verdade: `201` + token no sucesso, `401` para
  credencial inválida, `400` para payload sem username/password. O corpo do erro é
  **texto puro**, não JSON.
- O campo `rating` dos produtos muda com o tempo — evite asserções sobre ele.
- `GET /products/categories` devolve um array; a ordem não é garantida — use
  `to.have.members`, não comparação por índice.
- `?startdate=&enddate=` em `/carts` é **ignorado** pela API: devolve todos os carrinhos.

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

Pontos em aberto mapeados em [docs/known-issues.md](docs/known-issues.md).
Os mais relevantes ao mexer no código:

- As constantes `TOTAL_PRODUCTS` (20), `TOTAL_CARTS` (7) e `TOTAL_USERS` (10) fixam o
  tamanho das coleções. É proposital, mas quebra se a Fake Store mudar a massa de dados.
- O teste de filtro por datas em `/carts` valida só status e tipo, porque a API ignora o
  intervalo. Reforce-o se a API for corrigida.
- As validações de contrato são manuais (`to.have.all.keys` + checagem de tipo); não há
  biblioteca de schema no projeto.
- `npm audit` reporta 8 alertas residuais, todos transitivos do `mocha`/`mochawesome`. O
  `fixAvailable` sugere **downgrade** (mochawesome 1.5), o que seria pior — não aplique.
- Fixtures ociosas de propósito: `all_electronics_products.json` e
  `all_jewelery_products.json` — o teste de categoria valida todo item retornado em vez de
  comparar com lista fixa.
- Dependências instaladas e sem uso: `dotenv`, `express`, `joi`, `mongodb`, `mongoose`,
  `node-fetch`, `npm-run-all`. Respondem pela maior parte dos alertas do `npm audit`.
