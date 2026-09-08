# Arquitetura

## Estrutura de pastas

```
automacao-fake-store-api/
├── config/
│   ├── base.js                   # Factory com a configuração compartilhada
│   └── dev.config.js             # ambiente dev
├── cypress/
│   ├── e2e/                      # Specs de teste, uma pasta por recurso
│   │   ├── auth/auth.cy.js
│   │   ├── carts/carts.cy.js
│   │   ├── products/products.cy.js
│   │   └── users/users.cy.js
│   ├── fixtures/                 # Massa de dados / respostas esperadas
│   │   ├── all_categories.json
│   │   ├── all_electronics_products.json
│   │   ├── all_jewelery_products.json
│   │   ├── credentials.json
│   │   ├── hard_drive_portable_2t.json
│   │   ├── new_cart.json
│   │   ├── new_product.json
│   │   └── new_user.json
│   └── support/
│       ├── e2e.js                # Carregado antes de cada spec; registra o grep e os comandos
│       ├── index.d.ts            # Tipagem dos comandos customizados (autocomplete)
│       ├── auth_commands.js      # Comandos de autenticação
│       ├── carts_commands.js     # Comandos de carrinho
│       ├── products_commands.js  # Comandos de produto
│       └── users_commands.js     # Comandos de usuário
├── .github/workflows/
│   ├── lint.yml                  # ESLint em pull requests e pushes na main
│   └── main.yml                  # Suíte de API, disparo manual apenas
├── .githooks/
│   └── pre-push                  # Roda lint + a suíte antes de cada push
├── .editorconfig                 # Estilo de arquivo compartilhado entre editores
├── .nvmrc                        # Versão do Node usada pelo projeto e pelo CI
├── eslint.config.mjs             # Configuração do ESLint (flat config)
├── jsconfig.json                 # Faz os editores aplicarem a tipagem em arquivos .js
├── cypress.config.js             # Configuração padrão (execuções locais)
└── package.json
```

## Camadas

O projeto mantém uma separação simples em três camadas, que evita repetir chamadas HTTP
dentro dos testes:

```
spec (<recurso>.cy.js)
   └── comandos customizados (<recurso>_commands.js)  →  cy.request() contra a API
   └── fixtures (*.json)                              →  payloads e dados esperados
```

- **Spec** — descreve o cenário e concentra as asserções (`expect`). Uma spec por recurso
  da API, com blocos `context` internos separando leitura de escrita.
- **Comandos customizados** — encapsulam o método HTTP, a rota e os parâmetros. Um teste
  nunca monta uma URL na mão. Um arquivo por recurso.
- **Fixtures** — guardam payloads de escrita e valores esperados, mantendo os dados fora
  do código de teste.

## Configuração

A configuração é definida uma única vez em [config/base.js](../config/base.js), que
exporta uma factory `createConfig({ baseUrl })`. Cada ambiente só fornece a própria
`baseUrl`:

```js
// config/base.js
function createConfig({ baseUrl }) {
    return defineConfig({
        viewportWidth: 1920,
        viewportHeight: 1080,
        allowCypressEnv: false,
        reporter: 'mochawesome',
        reporterOptions: {
            reportDir: 'cypress/report/mochawesome-report',
            overwrite: false,
            html: true,
            json: true,
            timestamp: 'mmddyyyy_HHMMss'
        },
        e2e: {
            baseUrl,
            setupNodeEvents(on, config) {
                const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin')
                cypressGrepPlugin(config)
                return config
            }
        }
    })
}
```

| Arquivo | Papel |
| --- | --- |
| `cypress.config.js` | Configuração padrão, usada automaticamente nas execuções locais |
| `config/dev.config.js` | ambiente dev; passado explicitamente via `--config-file config/dev.config.js` |
| `config/base.js` | Configuração compartilhada; não é, por si só, um arquivo de config do Cypress |

Para adicionar um novo ambiente, crie `config/hlg.config.js` com a `baseUrl`
correspondente — o input `amb` do workflow já resolve para `config/{amb}.config.js`.

Como todo comando usa caminhos relativos (`/products`), trocar de ambiente é só uma
questão de mudar a `baseUrl`.

## Versão do Cypress

O projeto roda **Cypress 15.19.0**. A migração a partir do Cypress 9 trocou estas
convenções:

| Antes (Cypress 9) | Agora (Cypress 15) |
| --- | --- |
| `cypress.json` | `cypress.config.js` |
| `cypress/integration/` | `cypress/e2e/` |
| `*_test.spec.js` | `*.cy.js` |
| `cypress/plugins/index.js` | `setupNodeEvents` dentro da config |
| `cypress/support/index.js` | `cypress/support/e2e.js` |
| `cypress-grep` | `@cypress/grep` |
| `--env grepTags=...` | `--expose grepTags=...` |

O `specPattern` padrão é `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}` e o `supportFile` padrão é
`cypress/support/e2e.js` — por isso nenhum dos dois precisa ser declarado na config.

### `Cypress.env()` está depreciado

O Cypress 15 desaconselha `Cypress.env()` porque qualquer código do navegador consegue
ler esses valores. A config define `allowCypressEnv: false`, e os valores agora trafegam
por `--expose` (públicos) ou `cy.env()` (sensíveis). É por isso que o filtro de tags usa
`--expose grepTags=...` em vez de `--env`.

## Requisitos de ambiente

O Cypress 15 exige **Node.js `^20.1.0 || ^22.0.0 || >=24.0.0`**, declarado em `engines`
no `package.json`. Node 14 e 16, usados antes, não são mais suportados.

## Qualidade de código

### ESLint

A configuração vive em [eslint.config.mjs](../eslint.config.mjs), no formato *flat
config* (padrão desde o ESLint 9). Quatro camadas:

1. `js.configs.recommended` — a base do ESLint.
2. **Contexto Node** para `config/` e os arquivos de configuração da raiz.
3. **Contexto Cypress** (`eslint-plugin-cypress`) para `cypress/`, adicionando as
   globais `cy`, `Cypress` e `expect` por cima das globais de browser.
4. **Contexto de teste** (`eslint-plugin-mocha`) apenas para as specs.

```bash
npm run lint       # verificar
npm run lint:fix   # aplicar as correções automáticas
```

O lint roda no CI em todo pull request.

Duas regras do `eslint-plugin-mocha` estão desligadas de propósito:

| Regra | Motivo |
| --- | --- |
| `no-mocha-arrows` | Callbacks em arrow function são o idioma do Cypress — não há `this` a preservar |
| `no-async-in-sync-tests` | Falso positivo: `cy.request().then()` é um chainable da fila de comandos, não uma Promise. Tornar o teste `async` é que seria o erro real |

O ganho é concreto, não teórico: a regra `no-undef` pega exatamente o bug que existiu no
comando `deleteProduct`, que chamava uma função inexistente, `getUrlAllProducts()`.

### Tipagem dos comandos

[cypress/support/index.d.ts](../cypress/support/index.d.ts) declara os 27 comandos
customizados em `Cypress.Chainable`. O Cypress carrega o arquivo automaticamente, e o
[jsconfig.json](../jsconfig.json) faz os editores aplicarem essa tipagem também em
arquivos `.js` — assim, digitar `cy.` já traz autocomplete e dicas de assinatura.

Mantenha o `.d.ts` sincronizado sempre que um comando for adicionado, renomeado ou
removido.

### Estilo

O [.editorconfig](../.editorconfig) fixa charset, quebra de linha e indentação (4
espaços em JS, 2 em JSON/YAML) para qualquer editor. As regras de estilo do ESLint
espelham o que o código já fazia — aspas simples, sem ponto e vírgula, sem vírgula
final.

O [.nvmrc](../.nvmrc) fixa o Node 22, usado tanto localmente (`nvm use`) quanto pelo CI,
via `node-version-file`.

## Dependências

| Pacote | Papel |
| --- | --- |
| `cypress` | Executor dos testes |
| `@cypress/grep` | Filtro de testes por tag (substitui o depreciado `cypress-grep`) |
| `mochawesome` / `mochawesome-report-generator` | Geração de relatório HTML e JSON |
| `mocha` | Peer do mochawesome |
| `eslint` + `@eslint/js` + `globals` | Análise estática |
| `eslint-plugin-cypress` | Globais e regras do Cypress |
| `eslint-plugin-mocha` | Regras de spec (`.only` esquecido, títulos duplicados) |

Sete dependências que nenhum arquivo do projeto referenciava — `dotenv`, `express`,
`joi`, `mongodb`, `mongoose`, `node-fetch` e `npm-run-all` — foram removidas. Eram
resquícios do projeto de estudo original e respondiam pela maior parte dos alertas do
`npm audit`, incluindo os dois críticos.
