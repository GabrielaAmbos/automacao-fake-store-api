# Arquitetura

## Estrutura de pastas

```
automacao-fake-store-api/
├── config/
│   ├── base.js                   # Factory com a configuração compartilhada
│   └── dev.config.js             # Ambiente dev (usado no CI)
├── cypress/
│   ├── e2e/                      # Especificações de teste, uma pasta por recurso
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
│       ├── e2e.js                # Carregado antes de cada spec; registra grep e commands
│       ├── index.d.ts            # Tipagem dos comandos customizados (autocomplete)
│       ├── auth_commands.js      # Comandos de autenticação
│       ├── carts_commands.js     # Comandos de carrinhos
│       ├── products_commands.js  # Comandos de produtos
│       └── users_commands.js     # Comandos de usuários
├── .github/workflows/
│   ├── main.yml                  # Pipelines de lint e testes
│   └── static.yml                # Publicação do repositório no GitHub Pages
├── .editorconfig                 # Estilo de arquivo compartilhado entre editores
├── .nvmrc                        # Versão do Node usada no projeto e no CI
├── eslint.config.mjs             # Configuração do ESLint (flat config)
├── jsconfig.json                 # Faz o editor enxergar os tipos nos arquivos .js
├── cypress.config.js             # Configuração padrão (execuções locais)
└── package.json
```

## Camadas

O projeto segue uma separação simples em três camadas, o que evita repetir chamadas HTTP
dentro dos testes:

```
spec (<recurso>.cy.js)
   └── comandos customizados (<recurso>_commands.js)  →  cy.request() para a API
   └── fixtures (*.json)                              →  payloads e dados esperados
```

- **Spec** — descreve o cenário e concentra as asserções (`expect`). Uma spec por recurso
  da API, com `context` internos separando leitura de escrita.
- **Comandos customizados** — encapsulam método HTTP, rota e parâmetros. Um teste nunca
  monta a URL manualmente. Um arquivo por recurso.
- **Fixtures** — guardam payloads de escrita e valores esperados, mantendo os dados fora
  do código do teste.

## Configuração

A configuração é definida uma única vez em [config/base.js](../config/base.js), que
exporta uma factory `createConfig({ baseUrl })`. Cada ambiente apenas informa sua própria
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
| `cypress.config.js` | Configuração padrão, lida automaticamente em execuções locais |
| `config/dev.config.js` | Ambiente dev; passado no CI via `--config-file config/dev.config.js` |
| `config/base.js` | Configuração compartilhada; não é um config file do Cypress |

Para adicionar um ambiente novo, basta criar `config/hlg.config.js` com a `baseUrl`
correspondente — o input `amb` do workflow já resolve para `config/{amb}.config.js`.

Como todos os comandos usam caminhos relativos (`/products`), trocar de ambiente exige
apenas mudar a `baseUrl`.

## Versão do Cypress

O projeto usa **Cypress 15.19.0**. A migração a partir do Cypress 9 trocou as seguintes
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

### `Cypress.env()` foi depreciado

O Cypress 15 desencoraja `Cypress.env()` porque qualquer código do navegador consegue ler
esses valores. A config define `allowCypressEnv: false`, e valores passam a ser
transmitidos via `--expose` (públicos) ou `cy.env()` (sensíveis). É por isso que o filtro
de tags usa `--expose grepTags=...` e não mais `--env`.

## Requisitos de ambiente

O Cypress 15 exige **Node.js `^20.1.0 || ^22.0.0 || >=24.0.0`**, restrição declarada em
`engines` no `package.json`. Node 14 e 16, usados antes, não são mais suportados.

## Qualidade de código

### ESLint

A configuração fica em [eslint.config.mjs](../eslint.config.mjs), no formato *flat
config* (padrão desde o ESLint 9). São quatro camadas:

1. `js.configs.recommended` — a base do ESLint.
2. **Contexto Node** para `config/` e arquivos de configuração da raiz.
3. **Contexto Cypress** (`eslint-plugin-cypress`) para `cypress/`, com os globais `cy`,
   `Cypress` e `expect` além dos de navegador.
4. **Contexto de teste** (`eslint-plugin-mocha`) só para as specs.

```bash
npm run lint       # verifica
npm run lint:fix   # corrige o que é auto-corrigível
```

O lint roda no CI **antes** dos testes; se falhar, a suíte nem é executada.

Duas regras do `eslint-plugin-mocha` foram desativadas de propósito:

| Regra | Motivo |
| --- | --- |
| `no-mocha-arrows` | Arrow function é o idioma do Cypress — não há `this` a preservar |
| `no-async-in-sync-tests` | Falso positivo: `cy.request().then()` é um *chainable* da fila de comandos, não uma Promise. Tornar o teste `async` seria justamente o erro |

O valor prático é concreto: a regra `no-undef` detecta exatamente o bug que existia no
comando `deleteProduct`, que chamava a função inexistente `getUrlAllProducts()`.

### Tipagem dos comandos

[cypress/support/index.d.ts](../cypress/support/index.d.ts) declara os 27 comandos
customizados em `Cypress.Chainable`. O Cypress carrega o arquivo automaticamente, e o
[jsconfig.json](../jsconfig.json) faz o editor aplicar essa tipagem também nos arquivos
`.js` — resultado: autocomplete e assinatura dos parâmetros ao digitar `cy.`.

Ao adicionar, renomear ou remover um comando, atualize o `.d.ts` junto.

### Estilo

[.editorconfig](../.editorconfig) fixa charset, fim de linha e indentação (4 espaços em
JS, 2 em JSON/YAML) para qualquer editor. As regras de estilo do ESLint espelham o que já
existia no código — aspas simples, sem ponto e vírgula, sem vírgula pendente.

[.nvmrc](../.nvmrc) fixa o Node 22, usado tanto localmente (`nvm use`) quanto pelo CI via
`node-version-file`.

## Dependências

| Pacote | Papel |
| --- | --- |
| `cypress` | Framework de execução dos testes |
| `@cypress/grep` | Filtro de testes por tag (substitui o `cypress-grep`, depreciado) |
| `mochawesome` / `mochawesome-report-generator` | Geração dos relatórios HTML e JSON |
| `mocha` | Peer do mochawesome |
| `eslint` + `@eslint/js` + `globals` | Análise estática |
| `eslint-plugin-cypress` | Globais e regras específicas do Cypress |
| `eslint-plugin-mocha` | Regras para as specs (`.only` esquecido, título duplicado) |

Sete dependências que nenhum arquivo do projeto referenciava — `dotenv`, `express`,
`joi`, `mongodb`, `mongoose`, `node-fetch` e `npm-run-all` — foram removidas. Eram
resquícios do projeto de estudo original e respondiam pela maior parte dos alertas do
`npm audit`, incluindo os dois críticos.
