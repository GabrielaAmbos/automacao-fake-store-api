# Melhorias conhecidas

Levantamento do estado atual do projeto. Nada aqui foi alterado — é um mapa do que existe
para orientar próximos passos.

## Bugs

### `deleteProduct` chama função inexistente

[cypress/support/products_commands.js:62](../cypress/support/products_commands.js#L62)

```js
url: getUrlAllProducts() + '/' + productId
```

`getUrlAllProducts()` não existe em lugar nenhum do projeto. Qualquer uso do comando
lança `ReferenceError`. Correção: `url: '/products/' + productId`.

### `putUpdateProduct` não envia body

[cypress/support/products_commands.js:52-57](../cypress/support/products_commands.js#L52-L57)

O comando faz `PUT` sem corpo, então não há dados para atualizar. Além disso a URL é
`'products/' + productId`, sem a barra inicial usada nos demais comandos.

### Teste 5 nunca executa

[cypress/e2e/products/products.cy.js:46-54](../cypress/e2e/products/products.cy.js#L46-L54)

Além de estar comentado, o bloco perdeu o `it(` inicial. Ao descomentar, seria uma
expressão solta e não um teste. Também usa `'eletronic'` (a categoria válida é
`electronics`) e a fixture `all_eletronic_products.json`, que não existe — o arquivo real
chama-se `all_electronics_products.json`.

## Configuração e CI

| Item | Situação |
| --- | --- |
| `config/dev.config.js` | Único ambiente existente; faltam `hlg.config.js` e `prd.config.js` que o input `amb` do workflow sugere |
| `static.yml` | Publica o repositório inteiro no Pages, não apenas os relatórios |
| `npm audit` | Alertas concentrados nas dependências ociosas (`mongoose@5`, `mongodb@3`, `express@4`, `node-fetch@2`); removê-las zera a maior parte |

## Cobertura

- Escrita não testada: `POST`, `PUT` e `DELETE` têm comandos, mas nenhum teste.
- Query params não testados: `getProductsLimitResult` e `getProductsSortResult` sem uso.
- Categorias não testadas: os dois testes existentes estão comentados; as fixtures
  `all_electronics_products.json` e `all_jewelery_products.json` estão ociosas.
- "Buscar todos os produtos" valida só o `status`, sem olhar o corpo da resposta.
- Não há validação de contrato/schema — `joi` está instalado mas nunca é usado.

## Manutenção

- **Nomenclatura**: `getAllProductos` mistura idiomas. O padrão do projeto é inglês no
  código; renomear para `getAllProducts` (e atualizar a spec).
- **Fragilidade do teste de categorias**: compara por índice, então depende da ordem em
  que a API devolve o array.
- **Dependências ociosas**: `dotenv`, `express`, `joi`, `mongodb`, `mongoose`,
  `node-fetch` e `npm-run-all` não são usados e podem sair do `package.json`.

## Resolvido na migração para o Cypress 15

Itens que constavam aqui e foram tratados ao atualizar o framework:

- ~~`cypress-grep` nunca é registrado~~ → substituído por `@cypress/grep` e registrado em
  `cypress/support/e2e.js` e no `setupNodeEvents`.
- ~~Tag padrão do CI (`@regressivo`) não casa com as specs~~ → alterada para
  `@regression`.
- ~~Gatilho de PR aponta para `master`~~ → corrigido para `main`.
- ~~Passo do Allure sem `allure-results`~~ → substituído por upload do relatório
  mochawesome como artefato do run.
- ~~Estrutura legada do Cypress 9~~ → migrada para `cypress.config.js`, `cypress/e2e/` e
  `cypress/support/e2e.js`.
- ~~`cypress.json` e `config/dev.json` duplicados~~ → configuração unificada em
  `config/base.js`.
