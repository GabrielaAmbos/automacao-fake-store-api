# Arquitetura

## Estrutura de pastas

```
automacao-fake-store-api/
├── config/
│   ├── base.js                   # Factory com a configuração compartilhada
│   └── dev.config.js             # Ambiente dev (usado no CI)
├── cypress/
│   ├── e2e/                      # Especificações de teste
│   │   └── products/
│   │       └── products.cy.js
│   ├── fixtures/                 # Massa de dados / respostas esperadas
│   │   ├── all_categories.json
│   │   ├── all_electronics_products.json
│   │   ├── all_jewelery_products.json
│   │   └── hard_drive_portable_2t.json
│   └── support/
│       ├── e2e.js                # Carregado antes de cada spec; registra grep e commands
│       ├── commands.js           # Boilerplate do Cypress (sem comandos próprios)
│       └── products_commands.js  # Comandos customizados de produtos
├── .github/workflows/
│   ├── main.yml                  # Pipeline de execução dos testes
│   └── static.yml                # Publicação do repositório no GitHub Pages
├── cypress.config.js             # Configuração padrão (execuções locais)
└── package.json
```

## Camadas

O projeto segue uma separação simples em três camadas, o que evita repetir chamadas HTTP
dentro dos testes:

```
spec (products.cy.js)
   └── comandos customizados (products_commands.js)   →  cy.request() para a API
   └── fixtures (*.json)                              →  dados esperados
```

- **Spec** — descreve o cenário e concentra as asserções (`expect`).
- **Comandos customizados** — encapsulam método HTTP, rota e parâmetros. Um teste nunca
  monta a URL manualmente.
- **Fixtures** — guardam os valores esperados, mantendo os dados fora do código do teste.

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

## Dependências

Em uso:

| Pacote | Papel |
| --- | --- |
| `cypress` | Framework de execução dos testes |
| `@cypress/grep` | Filtro de testes por tag (substitui o `cypress-grep`, depreciado) |
| `mochawesome` / `mochawesome-report-generator` | Geração dos relatórios HTML e JSON |
| `mocha` | Peer do mochawesome |

Declaradas mas sem uso no código atual: `dotenv`, `express`, `joi`, `mongodb`,
`mongoose`, `node-fetch`, `npm-run-all`. São resquícios do projeto de estudo original e
respondem pela maior parte dos alertas do `npm audit` — podem ser removidas.
