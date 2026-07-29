# Execução e CI

## Pré-requisitos

- **Node.js `^20.1.0 || ^22.0.0 || >=24.0.0`** — exigência do Cypress 15. O
  [.nvmrc](../.nvmrc) fixa a 22; com o `nvm` instalado, basta `nvm use`.
- Acesso à internet — os testes chamam a API pública `https://fakestoreapi.com`

## Scripts disponíveis

| Script | O que faz |
| --- | --- |
| `npm run cy:open` | Abre o Test Runner (modo interativo) |
| `npm run cy:run` | Executa a suíte headless |
| `npm test` | Alias de `cy:run` — é o que o CI e outras ferramentas esperam |
| `npm run test:smoke` | Executa só os testes `@smoke` |
| `npm run lint` | Roda o ESLint |
| `npm run lint:fix` | Roda o ESLint corrigindo o que é auto-corrigível |

## Execução local

```bash
npm i            # instala as dependências
npm run cy:open  # abre o Test Runner (modo interativo)
npm test         # executa headless
```

### Variações úteis

```bash
# rodar apenas uma spec
npx cypress run --spec "cypress/e2e/products/products.cy.js"

# escolher o navegador
npx cypress run --browser chrome

# usar a configuração de um ambiente específico
npx cypress run --config-file config/dev.config.js
```

### Filtrar testes por tag

O `@cypress/grep` está registrado em [cypress/support/e2e.js](../cypress/support/e2e.js)
e no `setupNodeEvents`. As opções são passadas com **`--expose`** (no Cypress 15 o
`--env` deixou de ser o canal recomendado):

```bash
# apenas os testes marcados com @regression
npx cypress run --expose grepTags=@regression

# @regression OU @activities
npx cypress run --expose grepTags="@regression @activities"

# @regression E @activities
npx cypress run --expose grepTags="@regression+@activities"

# filtrar por título do teste
npx cypress run --expose grep="categorias"
```

Testes que não casam com o filtro aparecem como **pending**, não como falha.

> ⚠️ Se a tag informada não existir em nenhum teste, a execução termina com sucesso e
> zero testes rodados. Confira as tags disponíveis em
> [casos-de-teste.md](casos-de-teste.md#tags).

## Relatórios

O reporter configurado é o **mochawesome**. A cada execução são gerados HTML e JSON em:

```
cypress/report/mochawesome-report/
```

Com `"overwrite": false` e `"timestamp": "mmddyyyy_HHMMss"`, cada execução cria um novo
arquivo em vez de sobrescrever o anterior — o histórico fica acumulado na pasta.

Para consolidar vários JSONs em um único relatório:

```bash
npx mochawesome-merge "cypress/report/mochawesome-report/*.json" > merged.json
npx marge merged.json
```

> `mochawesome-merge` não está entre as dependências do projeto; instale-o se precisar
> desse passo.

## GitHub Actions

> ### ⚠️ Por que a suíte não roda em pull requests
>
> A Fake Store API responde **403 Forbidden** a requisições vindas dos runners hospedados
> do GitHub — as faixas de IP de datacenter são bloqueadas upstream. Foi confirmado na
> primeira execução real do workflow: **40 de 40 testes falharam com 403**, enquanto os
> mesmos testes passam localmente.
>
> Não é o User-Agent: o log mostra que a requisição já sai como
> `Mozilla/5.0 ... HeadlessChrome/150` e mesmo assim é recusada. É bloqueio por origem.
>
> Manter os testes no PR produziria um check cronicamente vermelho que não significa
> nada — e um check que sempre falha é um check que ninguém lê. Por isso o PR roda só o
> lint, e a suíte de API ficou sob execução manual.
>
> Para rodar contra a API real: `npm test` localmente, ou dispare o workflow a partir de
> um runner self-hosted cujo IP a API aceite.

### `lint.yml` — Lint

Roda a cada pull request para `main` e a cada push na `main`. Instala com
`npm ci --ignore-scripts` — o lint não precisa do binário do Cypress, o que deixa o job
em torno de 10 segundos — e executa `npm run lint`.

### `main.yml` — Execução automação de testes

Executa a suíte de API. **Só por `workflow_dispatch`** (manual), pelo motivo acima.

Aceita três entradas na hora de disparar:

| Input | Padrão | Descrição |
| --- | --- | --- |
| `browser` | `chrome` | `chrome` ou `electron` |
| `amb` | `dev` | Ambiente → resolve para `config/{amb}.config.js` |
| `tag` | `@regression` | Tag para filtrar os testes |

O job roda em `ubuntu-latest` com a action `cypress-io/github-action@v6`, que cuida do
cache do binário do Cypress. Comando executado:

```bash
npx cypress run \
  --config-file config/${amb}.config.js \
  --browser ${browser} \
  --expose grepTags=${tag}
```

Ao final, o relatório mochawesome é publicado como artefato do run
(`actions/upload-artifact@v4`, retenção de 20 dias), disponível para download na página
da execução.

### `static.yml` — Deploy static content to Pages

Publica **o repositório inteiro** (`path: '.'`) no GitHub Pages a cada push na branch
`main`, ou manualmente. Serve para expor o relatório HTML versionado, mas hoje sobe
todos os arquivos do repositório, não apenas a pasta de relatórios.

## Solução de problemas

### `bad option: --no-sandbox` ao rodar no terminal do VS Code

O terminal integrado do VS Code define `ELECTRON_RUN_AS_NODE=1`, o que faz o binário do
Cypress iniciar como Node puro e rejeitar as flags do Electron. Solução:

```bash
unset ELECTRON_RUN_AS_NODE && npx cypress run
```

Ou rode em um terminal externo, onde a variável não está definida. O CI não é afetado.

## O que está no `.gitignore`

```
**/*.mp4      # vídeos das execuções
**/*.png      # screenshots
.ideia/
videos
screenshots
.DS_Store
```

Vídeos e screenshots gerados pelo Cypress ficam fora do versionamento. Note que a
gravação de vídeo vem **desabilitada por padrão** desde o Cypress 13.
