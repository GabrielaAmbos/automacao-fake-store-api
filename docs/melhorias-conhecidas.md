# Melhorias conhecidas

Levantamento do estado atual do projeto — um mapa do que existe para orientar próximos
passos.

## Fragilidades da suíte

### Contagens fixas

Três testes afirmam o tamanho exato das coleções (20 produtos, 7 carrinhos, 10 usuários),
via as constantes `TOTAL_PRODUCTS`, `TOTAL_CARTS` e `TOTAL_USERS`. É proposital — detecta
mudança no catálogo da API —, mas quebra se a Fake Store alterar a massa de dados. Se isso
virar ruído, troque por `expect(response.body).to.not.be.empty`.

### Filtro de datas de carrinhos não é validado de fato

`GET /carts?startdate=2019-12-10&enddate=2020-10-10` devolve os **7** carrinhos, ignorando
o intervalo. O teste verifica só status e tipo, porque asseverar a filtragem falharia
contra o comportamento real da API. Se a API for corrigida, o teste deve ser reforçado.

### Ids fixos nos testes de escrita

`PUT`, `PATCH` e `DELETE` usam ids fixos (6, 7, 2, 3). Como a API não persiste nada, não
há efeito colateral entre execuções — mas os ids precisam existir na massa.

## A API bloqueia os runners do GitHub

A Fake Store API responde **403 Forbidden** a requisições vindas de runners hospedados do
GitHub. Confirmado na primeira execução real do workflow: 40 de 40 testes falharam com
403, com o User-Agent já se apresentando como Chrome — ou seja, é bloqueio por faixa de
IP de datacenter, não por cliente.

A suíte de API ficou sob execução manual e o PR roda só o lint. Caminhos para recuperar a
execução automática, em ordem de esforço:

1. **Runner self-hosted** — mantém o teste contra a API real; exige infraestrutura.
2. **Mockar com `cy.intercept()`** e respostas gravadas — roda em qualquer lugar, mas
   passa a testar contrato contra dados congelados, não a API viva.
3. **Trocar de alvo** para uma API pública que não bloqueie datacenter.

O que **não** fazer: mascarar a origem para driblar a proteção, ou marcar o job como
`continue-on-error` — um check que sempre falha é um check que ninguém lê.

## Segurança de dependências

`npm audit` reporta **8 alertas residuais** (0 críticos), todos transitivos de
`mocha`/`mochawesome` e restritos a devDependencies de geração de relatório.

O `fixAvailable` do npm sugere **downgrade** — `mocha@11.3` (anterior à instalada) e
`mochawesome@1.5.5` — o que seria um retrocesso grande para resolver risco teórico em
ferramenta de relatório. **Não aplique `npm audit fix --force`.** Se incomodar, a saída é
trocar o reporter por `cypress-mochawesome-reporter`, mantido especificamente para o
Cypress.

## Cobertura

- **Validação de contrato via schema**: as asserções de contrato são manuais
  (`to.have.all.keys` + checagem de tipo). Uma biblioteca de schema por recurso deixaria
  os testes mais declarativos.
- **Token JWT não é reaproveitado**: o teste de login valida o formato do token, mas
  nenhum teste o usa em requisição autenticada — a Fake Store API não exige auth nos
  demais endpoints.
- **`PATCH` só existe para produtos**: carrinhos e usuários também aceitam, sem teste.

## Configuração e CI

| Item | Situação |
| --- | --- |
| `config/dev.config.js` | Único ambiente existente; faltam `hlg.config.js` e `prd.config.js` que o input `amb` do workflow sugere |
| `static.yml` | Publica o repositório inteiro no Pages, não apenas os relatórios |
| Prettier | Não adotado — o estilo é garantido por `.editorconfig` + regras do ESLint. Adotá-lo reformataria a base inteira de uma vez |

## Manutenção

- **Fixtures ociosas**: `all_electronics_products.json` e `all_jewelery_products.json`
  não são usadas. Foi decisão consciente — o teste de categoria valida que *todo* item
  retornado pertence à categoria pedida, o que não quebra quando o catálogo muda. Os dois
  arquivos podem ser removidos.
## Resolvido

### Na padronização (tooling e convenções)

- ~~Nenhum linter no projeto~~ → ESLint com `eslint-plugin-cypress` e
  `eslint-plugin-mocha`, rodando no CI antes dos testes.
- ~~7 dependências ociosas, 2 vulnerabilidades críticas~~ → removidas; `npm audit` caiu de
  22 alertas (2 críticos) para 8 (nenhum crítico).
- ~~Sem autocomplete para os comandos customizados~~ → `cypress/support/index.d.ts` com os
  27 comandos tipados, mais `jsconfig.json`.
- ~~`package.json` apontava para o repositório errado~~ (`GabrielaAmbos/cypress`) →
  corrigido, com `bugs`, `keywords` e `private: true`.
- ~~`main: index.js` referenciava arquivo inexistente~~ → removido.
- ~~`commands.js` era 100% comentário e mesmo assim importado~~ → removido.
- ~~Scripts npm com `npx` redundante~~ → `cypress` resolve direto do `.bin`; adicionados
  `test`, `test:smoke`, `lint` e `lint:fix`.
- ~~Versão do Node repetida no workflow~~ → centralizada no `.nvmrc`.
- ~~Estilo de arquivo sem padronização~~ → `.editorconfig`.

### Na ampliação da cobertura (produtos → API completa)

- ~~`deleteProduct` chamava `getUrlAllProducts()`, função inexistente~~ → corrigido para
  `'/products/' + productId`.
- ~~`putUpdateProduct` fazia `PUT` sem body~~ → agora recebe o payload como parâmetro.
- ~~O teste "Buscar por uma categoria" estava comentado e sem o `it(`~~ → reescrito e
  ativo, junto com o de categoria inexistente.
- ~~`getAllProductos` misturava português e inglês~~ → renomeado para `getAllProducts`.
- ~~`getSpecificCategory` não fazia encode da URL~~ → usa `encodeURIComponent`, o que
  habilitou o teste de `men's clothing`.
- ~~O teste de categorias comparava por índice, dependendo da ordem da API~~ → passou a
  usar `to.have.members`, que ignora ordem.
- ~~6 dos 9 comandos de produtos não tinham teste~~ → todos cobertos.

### Na migração para o Cypress 15

- ~~`cypress-grep` nunca era registrado~~ → substituído por `@cypress/grep` e registrado.
- ~~Tag padrão do CI (`@regressivo`) não casava com as specs~~ → alterada para
  `@regression`.
- ~~Gatilho de PR apontava para `master`~~ → corrigido para `main`.
- ~~Passo do Allure sem `allure-results`~~ → substituído por upload do relatório
  mochawesome como artefato.
- ~~Estrutura legada do Cypress 9~~ → migrada para `cypress.config.js`, `cypress/e2e/` e
  `cypress/support/e2e.js`.
- ~~`cypress.json` e `config/dev.json` duplicados~~ → configuração unificada em
  `config/base.js`.
- ~~`node_modules/` versionado (11.851 arquivos)~~ → removido do índice e ignorado.
