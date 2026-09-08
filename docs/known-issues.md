# Estado conhecido

Um levantamento do estado atual do projeto — um mapa do que existe, para guiar os
próximos passos.

## Fragilidades da suíte

### Contagens fixas no código

Três testes verificam o tamanho exato das coleções (20 produtos, 7 carrinhos, 10
usuários) através das constantes `TOTAL_PRODUCTS`, `TOTAL_CARTS` e `TOTAL_USERS`. Isso é
proposital — pega mudanças no catálogo da API — mas quebra se a Fake Store alterar sua
massa de dados. Se isso virar ruído, trocar por
`expect(response.body).to.not.be.empty`.

### O filtro de datas do carrinho não é verificado de verdade

`GET /carts?startdate=2019-12-10&enddate=2020-10-10` devolve os **7** carrinhos,
ignorando o intervalo. O teste checa apenas status e tipo, porque asserir a filtragem
falharia contra o comportamento real da API. Se a API for corrigida, o teste deve ser
reforçado.

### Ids fixos nos testes de escrita

`PUT`, `PATCH` e `DELETE` usam ids fixos (6, 7, 2, 3). Como a API não persiste nada, não
há efeito colateral entre execuções — mas os ids precisam existir no dataset.

## A API bloqueia os runners do GitHub

A Fake Store API responde **403 Forbidden** a requisições vindas dos runners hospedados
do GitHub. Confirmado na primeira execução real do workflow: 40 de 40 testes falharam
com 403, com o User-Agent já se apresentando como Chrome — ou seja, o bloqueio é nas
faixas de IP de datacenter, não no cliente.

A suíte de API foi para disparo manual e pull requests rodam só o lint. Caminhos de
volta para execução automatizada, por esforço:

1. **Runner self-hosted** — mantém os testes contra a API real; precisa de
   infraestrutura.
2. **Mock com `cy.intercept()`** e respostas gravadas — roda em qualquer lugar, mas vira
   teste de contrato contra dados congelados, não contra a API ao vivo.
3. **Trocar de alvo** para uma API pública que não bloqueia faixas de datacenter.

O que **não** fazer: disfarçar a origem da requisição para contornar a proteção, ou
marcar o job como `continue-on-error` — um check que sempre falha é um check que
ninguém lê.

Um **runner self-hosted também está fora de cogitação enquanto o repositório for
público**: um pull request de um fork poderia executar código arbitrário nessa máquina.

Enquanto isso, a lacuna é coberta localmente pelo
[.githooks/pre-push](../.githooks/pre-push), e para pull requests de fork por um `gh pr
checkout` + `npm test` manual antes do merge — ver
[Execução e CI](running-and-ci.md#revisando-um-pull-request-de-um-fork).

## Segurança de dependências

O `npm audit` reporta **8 alertas residuais** (0 críticos), todos transitivos de
`mocha`/`mochawesome` e confinados às devDependencies de geração de relatório.

O `fixAvailable` do npm propõe correções que são, na verdade, **upgrades com breaking
change** — `mocha@12.0.0` e `mochawesome@8.0.1` — não um downgrade. Trocar de major é um
risco de regressão maior do que os alertas em si, que vivem só na ferramenta de
relatório. **Não rode `npm audit fix --force` aqui.** Se os alertas virarem um problema
de verdade, o caminho é trocar o reporter por `cypress-mochawesome-reporter`, mantido
especificamente para o Cypress.

## Cobertura

- **Validação de contrato baseada em schema**: as asserções de contrato são manuais
  (`to.have.all.keys` mais checagem de tipo). Um schema por recurso deixaria os testes
  mais declarativos.
- **O JWT nunca é reutilizado**: o teste de login valida o formato do token, mas nenhum
  teste o usa numa requisição autenticada — a Fake Store API não exige autenticação nos
  demais endpoints.
- **`PATCH` só existe para produtos**: carrinhos e usuários também aceitam, mas não é
  testado.

## Configuração e CI

| Item | Situação |
| --- | --- |
| `config/dev.config.js` | O único ambiente que existe; `hlg.config.js` e `prd.config.js`, sugeridos pelo input `amb` do workflow, estão faltando |
| GitHub Pages | Desativado, junto com o workflow `static.yml` que o alimentava — ver [Execução e CI](running-and-ci.md#github-pages-desativado) |
| Prettier | Não adotado — o estilo é coberto pelo `.editorconfig` mais as regras do ESLint. Adotá-lo reformataria a base inteira de uma vez |

## Manutenção

- **Fixtures ociosas**: `all_electronics_products.json` e `all_jewelery_products.json`
  não são usadas. Foi uma decisão deliberada — o teste de categoria valida que *todo*
  item retornado pertence à categoria pedida, o que não quebra quando o catálogo muda.
  Os dois arquivos podem ser removidos.
- **README bilíngue**: `README.md` (inglês) e `README.pt-BR.md` (português) precisam ser
  mantidos sincronizados manualmente. Qualquer mudança em um pertence ao outro.

## Resolvido

### Durante a padronização (ferramental e convenções)

- ~~Nenhum linter no projeto~~ → ESLint com `eslint-plugin-cypress` e
  `eslint-plugin-mocha`, rodando no CI em todo pull request.
- ~~7 dependências ociosas, 2 vulnerabilidades críticas~~ → removidas; o `npm audit`
  caiu de 22 alertas (2 críticos) para 8 (nenhum crítico).
- ~~Sem autocomplete para os comandos customizados~~ →
  `cypress/support/index.d.ts` tipando os 27 comandos, mais `jsconfig.json`.
- ~~`package.json` apontava para o repositório errado~~ (`GabrielaAmbos/cypress`) →
  corrigido, com `bugs`, `keywords` e `private: true`.
- ~~`main: index.js` referenciava um arquivo inexistente~~ → removido.
- ~~`commands.js` era 100% comentário e ainda assim importado~~ → removido.
- ~~Scripts do npm carregavam um `npx` redundante~~ → `cypress` resolve direto do
  `.bin`; adicionados `test`, `test:smoke`, `lint` e `lint:fix`.
- ~~A versão do Node era repetida no workflow~~ → centralizada em `.nvmrc`.
- ~~Sem estilo de arquivo compartilhado~~ → `.editorconfig`.

### Durante a expansão de cobertura (produtos → toda a API)

- ~~`deleteProduct` chamava `getUrlAllProducts()`, uma função inexistente~~ → corrigido
  para `'/products/' + productId`.
- ~~`putUpdateProduct` enviava um `PUT` sem corpo~~ → agora recebe o payload como
  parâmetro.
- ~~O teste "Buscar por uma categoria" estava comentado e sem o `it(`~~ → reescrito e
  ativo, junto com o de categoria inexistente.
- ~~`getAllProductos` misturava português e inglês~~ → renomeado para `getAllProducts`.
- ~~`getSpecificCategory` não codificava a URL~~ → usa `encodeURIComponent`, o que
  viabilizou o teste de `men's clothing`.
- ~~O teste de categorias comparava por índice, dependendo da ordenação da API~~ →
  trocado por `to.have.members`, que ignora a ordem.
- ~~6 dos 9 comandos de produto não tinham teste~~ → todos cobertos.

### Durante a migração para o Cypress 15

- ~~`cypress-grep` nunca era registrado~~ → substituído por `@cypress/grep` e
  registrado.
- ~~A tag padrão do CI (`@regressivo`) não casava com nada nas specs~~ → mudada para
  `@regression`.
- ~~O trigger de PR apontava para `master`~~ → corrigido para `main`.
- ~~Um step do Allure sem `allure-results`~~ → substituído pela publicação do
  relatório mochawesome como artefato.
- ~~Layout legado do Cypress 9~~ → migrado para `cypress.config.js`, `cypress/e2e/` e
  `cypress/support/e2e.js`.
- ~~`cypress.json` e `config/dev.json` eram duplicados~~ → configuração unificada em
  `config/base.js`.
- ~~`node_modules/` estava versionado (11.851 arquivos)~~ → removido do controle de
  versão e ignorado.
