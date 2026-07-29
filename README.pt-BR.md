<p align="right">
  <a href="README.md"><img src="https://flagcdn.com/24x18/us.png" alt="English" title="English"></a>
  &nbsp;
  <a href="README.pt-BR.md"><img src="https://flagcdn.com/24x18/br.png" alt="Português (Brasil)" title="Português (Brasil)"></a>
</p>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=DF62F7&width=435&lines=Projeto+de+Automa%C3%A7%C3%A3o+Fake+Store+API)](https://git.io/typing-svg)

![Cypress](https://img.shields.io/badge/Cypress-15.19.0-17202C?logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Node](https://img.shields.io/badge/Node.js-%E2%89%A5%2020-339933?logo=nodedotjs&logoColor=white)
![Testes](https://img.shields.io/badge/testes-40%20passando-brightgreen)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-blue)

Projeto de automação de testes de **API** para a [Fake Store API](https://fakestoreapi.com),
escrito em JavaScript com o framework [Cypress](https://www.cypress.io).

São **40 testes** cobrindo todos os endpoints públicos da API — produtos, carrinhos,
usuários e autenticação. Não há front-end envolvido: os testes fazem requisições HTTP
diretas com `cy.request()`, encapsuladas em comandos customizados.

---

## Índice

- [Cobertura](#cobertura)
- [Stack](#stack)
- [Scripts](#scripts)
- [Como executar](#como-executar)
- [Filtrar testes por tag](#filtrar-testes-por-tag)
- [Relatórios](#relatórios)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Integração contínua](#integração-contínua)
- [Documentação](#documentação)

## Cobertura

| Recurso | Testes | O que é validado |
| --- | :---: | --- |
| **Produtos** | 15 | Listagem, busca por id, `limit`, `sort`, categorias, contrato do objeto, `POST`, `PUT`, `PATCH` e `DELETE` |
| **Carrinhos** | 12 | Listagem, busca por id e por usuário, `limit`, `sort`, filtro por período, `POST`, `PUT` e `DELETE` |
| **Usuários** | 9 | Listagem, busca por id, `limit`, `sort`, contrato aninhado, `POST`, `PUT` e `DELETE` |
| **Autenticação** | 4 | Login válido com token JWT, credencial inválida, senha errada e payload vazio |

Cada recurso tem uma spec própria em `cypress/e2e/`, com os testes agrupados em
**Leitura** e **Escrita**.

> A Fake Store API simula a escrita: `POST`, `PUT`, `PATCH` e `DELETE` respondem com
> sucesso e devolvem o objeto, mas **não persistem** nada. Os testes de escrita validam a
> resposta — releitura não confirmaria a alteração.

## Stack

| Ferramenta | Uso |
| --- | --- |
| [Cypress](https://www.cypress.io) 15 | Execução dos testes |
| [@cypress/grep](https://github.com/cypress-io/cypress/tree/develop/npm/grep) | Filtro de testes por tag |
| [Mochawesome](https://github.com/adamgruber/mochawesome) | Relatórios em HTML e JSON |
| [ESLint](https://eslint.org) | Análise estática, com plugins de Cypress e Mocha |
| GitHub Actions | Pipelines de lint e testes |

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run cy:open` | Abre o Test Runner (modo interativo) |
| `npm test` | Executa a suíte headless |
| `npm run test:smoke` | Executa só os testes `@smoke` |
| `npm run lint` | Roda o ESLint |
| `npm run lint:fix` | Corrige o que é auto-corrigível |

## Como executar

**Requisito:** Node.js 20, 22 ou 24+ (exigência do Cypress 15). O `.nvmrc` fixa a 22 —
com o [nvm](https://github.com/nvm-sh/nvm) instalado, basta `nvm use`.

```bash
# instalar as dependências
npm i

# abrir o Test Runner (modo interativo)
npm run cy:open

# executar os testes em modo headless
npm test
```

Nenhuma variável de ambiente, autenticação ou banco de dados é necessária — a Fake Store
API é pública e a `baseUrl` já vem configurada.

```bash
# rodar apenas uma spec
npx cypress run --spec "cypress/e2e/carts/carts.cy.js"

# escolher o navegador
npx cypress run --browser chrome

# usar a configuração de um ambiente específico
npx cypress run --config-file config/dev.config.js
```

> **Rodando no terminal do VS Code?** Ele define `ELECTRON_RUN_AS_NODE=1`, o que faz o
> Cypress falhar com `bad option: --no-sandbox`. Use
> `unset ELECTRON_RUN_AS_NODE && npx cypress run` ou um terminal externo.

## Filtrar testes por tag

| Tag | Testes |
| --- | :---: |
| `@regression` | 40 |
| `@products` | 15 |
| `@carts` | 12 |
| `@users` | 9 |
| `@smoke` | 7 |
| `@auth` | 4 |

```bash
npx cypress run --expose grepTags=@smoke              # só os principais
npx cypress run --expose grepTags="@carts @users"     # @carts OU @users
npx cypress run --expose grep="categoria"             # por título do teste
```

Testes que não casam com o filtro aparecem como **pending**, não como falha.

## Relatórios

A cada execução, o Mochawesome gera HTML e JSON em
`cypress/report/mochawesome-report/`, com timestamp no nome — o histórico fica acumulado
em vez de sobrescrito. No CI, o relatório é publicado como artefato do run.

## Estrutura do projeto

```
├── config/
│   ├── base.js                   # configuração compartilhada
│   └── dev.config.js             # ambiente dev
├── cypress/
│   ├── e2e/                      # specs, uma pasta por recurso
│   │   ├── auth/auth.cy.js
│   │   ├── carts/carts.cy.js
│   │   ├── products/products.cy.js
│   │   └── users/users.cy.js
│   ├── fixtures/                 # payloads e valores esperados
│   └── support/                  # comandos customizados, um arquivo por recurso
├── .github/workflows/            # pipelines
└── cypress.config.js             # configuração padrão
```

O padrão é simples: **a spec nunca monta URL**. Toda requisição fica em um comando
customizado, e os dados ficam em fixtures.

## Integração contínua

| Workflow | Quando roda |
| --- | --- |
| **Lint** | A cada pull request para `main` e push na `main` |
| **Execução automação de testes** | Só manualmente, escolhendo navegador, ambiente e tag |

> A suíte de API não roda em pull requests porque a Fake Store API responde **403** a
> requisições vindas dos runners hospedados do GitHub — as faixas de IP de datacenter são
> bloqueadas. Os testes estão corretos e passam localmente; rodá-los no CI produziria um
> check cronicamente vermelho. Um [hook de pre-push](.githooks/pre-push) roda o lint e a
> suíte localmente, cobrindo a lacuna na hora do push. Detalhes em
> [Running and CI](docs/running-and-ci.md).

## Documentação

A documentação completa está em [docs/](docs/README.md), **em inglês**:

| Documento | Conteúdo |
| --- | --- |
| [Architecture](docs/architecture.md) | Estrutura, configuração e decisões técnicas |
| [Custom commands](docs/custom-commands.md) | Referência de todos os `cy.*` do projeto |
| [Test cases](docs/test-cases.md) | O que cada teste valida e as peculiaridades da API |
| [Running and CI](docs/running-and-ci.md) | Execução local, relatórios e GitHub Actions |
| [Known issues](docs/known-issues.md) | Pontos em aberto mapeados |

## Licença

[MIT](LICENSE) © Gabriela Ambos
