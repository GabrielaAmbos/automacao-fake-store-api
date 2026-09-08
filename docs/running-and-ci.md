# Execução e CI

## Pré-requisitos

- **Node.js `^20.1.0 || ^22.0.0 || >=24.0.0`** — exigência do Cypress 15.
  [.nvmrc](../.nvmrc) fixa a 22; com `nvm` instalado, `nvm use` já resolve.
- Acesso à internet — os testes chamam a API pública `https://fakestoreapi.com`.

## Scripts disponíveis

| Script | O que faz |
| --- | --- |
| `npm run cy:open` | Abre o Test Runner (modo interativo) |
| `npm run cy:run` | Executa a suíte headless |
| `npm test` | Alias de `cy:run` — o ponto de entrada que o CI e outras ferramentas esperam |
| `npm run test:smoke` | Executa só os testes `@smoke` |
| `npm run lint` | Roda o ESLint |
| `npm run lint:fix` | Roda o ESLint aplicando as correções automáticas |

## Executando localmente

```bash
npm i            # instalar as dependências
npm run cy:open  # abrir o Test Runner (modo interativo)
npm test         # executar em modo headless
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

### Filtrando testes por tag

O `@cypress/grep` é registrado em
[cypress/support/e2e.js](../cypress/support/e2e.js) e no `setupNodeEvents`. As opções
são passadas com **`--expose`** (no Cypress 15, `--env` deixou de ser o canal
recomendado):

```bash
# só os testes marcados @regression
npx cypress run --expose grepTags=@regression

# @regression OU @activities
npx cypress run --expose grepTags="@regression @activities"

# @regression E @activities
npx cypress run --expose grepTags="@regression+@activities"

# filtrar pelo título do teste
npx cypress run --expose grep="categorias"
```

Testes que não casam com o filtro aparecem como **pending**, não como falha.

> ⚠️ Se a tag não existir em nenhum teste, a execução termina com sucesso sem rodar
> nada. Confira as tags disponíveis em [test-cases.md](test-cases.md#tags).

## O hook de pre-push

Como o CI não consegue rodar a suíte de API, nada do lado do servidor pegaria um teste
quebrado antes de chegar na `main` — um pull request verde só significa que o ESLint
passou. A lacuna é coberta localmente.

O [.githooks/pre-push](../.githooks/pre-push) roda `npm run lint` e depois `npm test` a
cada push. Ele é instalado pelo script npm `prepare`, que aponta `core.hooksPath` para o
diretório versionado `.githooks/` — então `npm i` já é suficiente num clone novo. Sem
dependência extra, sem Husky.

Três detalhes que ele trata:

| Caso | Comportamento |
| --- | --- |
| Exclusão de branch (`git push --delete`) | Pula a suíte — não há nada para testar |
| Terminal do VS Code | Limpa `ELECTRON_RUN_AS_NODE`, que do contrário faria o Cypress morrer com `bad option: --no-sandbox` e bloquearia o push pelo motivo errado |
| Bypass deliberado | `git push --no-verify`, para pushes só de documentação ou trabalho em andamento |

O custo é de aproximadamente 17 segundos por push.

Se o hook parar de disparar, confira se o path ainda está configurado:

```bash
git config core.hooksPath   # esperado: .githooks
npm run prepare             # reaplica a configuração
```

## Proteção de branch

A `main` é protegida. As regras:

| Regra | Configuração |
| --- | --- |
| Mudanças precisam passar por pull request | Sim, 0 aprovações exigidas (uma mantenedora solo não consegue aprovar o próprio PR) |
| Status check obrigatório | `ESLint` |
| Branch precisa estar atualizada antes do merge | Sim |
| Vale para administradores | **Sim** — nem a dona do repositório pode contornar |
| Force push / exclusão de branch | Bloqueado |

Um push direto é rejeitado:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: - Changes must be made through a pull request.
remote: - Required status check "ESLint" is expected.
```

O `enforce_admins` está ligado de propósito: o objetivo é impedir um push acidental na
`main`, e uma regra que a própria dona contorna silenciosamente não cumpre isso. Se
precisar cair numa emergência, é só desligar em **Settings → Branches**, dar o push e
religar depois.

## Revisando um pull request de um fork

O hook de pre-push só protege a máquina onde ele roda. O clone de uma pessoa contribuidora
externa instala sua própria cópia e pode contorná-lo — então um PR de fork chega sem
verificação, e o CI também não consegue checar, já que não alcança a API.

Não há como contornar isso com runners hospedados do GitHub. O portão precisa ser uma
pessoa:

```bash
gh pr checkout <número>   # baixar a branch da pessoa contribuidora localmente
npm test                  # rodar a suíte contra a API real
```

Só faça o merge depois que isso passar. Dois comandos, e é a única coisa que realmente
verifica a mudança.

Vale saber: o GitHub já exige aprovação de uma pessoa mantenedora antes de rodar
workflows num pull request de quem contribui pela primeira vez, então ninguém dispara
Actions neste repositório sem antes ser autorizado.

Se forks se tornarem comuns, a solução de verdade é uma execução exclusiva de CI apoiada
em `cy.intercept()` e respostas gravadas — ver
[Estado conhecido](known-issues.md#a-api-bloqueia-os-runners-do-github). Isso não
validaria a API ao vivo, mas pegaria uma pessoa contribuidora quebrando a suíte
mecanicamente, que é a maior parte do que uma revisão precisa. Está deliberadamente não
construído ainda: o repositório não tem forks, e significaria uma segunda suíte para
manter sincronizada.

## Relatórios

O reporter configurado é o **mochawesome**. Toda execução grava HTML e JSON em:

```
cypress/report/mochawesome-report/
```

O mochawesome grava **um arquivo por spec**, não um por execução — quatro specs geram
quatro JSON e quatro HTML. Com `"overwrite": false` e `"timestamp": "mmddyyyy_HHMMss"`,
cada execução soma um novo conjunto em vez de substituir o anterior, então o histórico
se acumula na pasta.

### Consolidando e publicando

```bash
npm test                # roda a suíte
npm run report          # junta os arquivos por spec em cypress/report/site/index.html
npm run report:publish  # envia essa pasta para a branch gh-pages
```

- `report` usa o `mochawesome-merge` para combinar o JSON de cada spec, depois o `marge`
  (`mochawesome-report-generator`) para renderizar um único HTML autocontido — o
  `--inline` embute os assets, então o arquivo funciona offline e pode ser enviado por
  e-mail como está.
- `report:publish` usa o pacote `gh-pages`, que envia a pasta para uma branch órfã
  `gh-pages`. A `main` nunca carrega os ~800 KB que o relatório pesa, e o relatório não
  faz parte do histórico do projeto.

O relatório publicado fica em
<https://gabrielaambos.github.io/automacao-fake-store-api/> e está linkado nos dois
READMEs.

> **É um retrato, não um status ao vivo.** A suíte roda localmente — o CI não alcança a
> API — então o relatório publicado reflete quem rodou `report:publish` por último.
> Republique após qualquer mudança que valha mostrar.

`cypress/report/` está no `.gitignore` na `main`, então nem os relatórios brutos nem o
consolidado são versionados.

## GitHub Actions

> ### ⚠️ Por que a suíte não roda em pull requests
>
> A Fake Store API responde **403 Forbidden** a requisições vindas dos runners
> hospedados do GitHub — as faixas de IP de datacenter são bloqueadas na origem. Isso foi
> confirmado na primeira execução real do workflow: **40 de 40 testes falharam com
> 403**, enquanto os mesmos testes passam localmente.
>
> Não é o User-Agent: o log mostra a requisição já saindo como
> `Mozilla/5.0 ... HeadlessChrome/150` e mesmo assim sendo recusada. O bloqueio é na
> origem da requisição.
>
> Manter os testes em pull requests deixaria um check permanentemente vermelho que não
> significa nada — e um check que sempre falha é um check que ninguém lê. Por isso pull
> requests rodam só o lint, e a suíte de API foi para disparo manual.
>
> Para rodar contra a API real: `npm test` localmente, ou disparar o workflow a partir
> de um runner self-hosted cujo IP a API aceite.

### `lint.yml` — Lint

Roda em todo pull request para a `main` e todo push na `main`. Instala com
`npm ci --ignore-scripts` — lint não precisa do binário do Cypress, o que mantém o job
em torno de 10 segundos — e roda `npm run lint`.

### `main.yml` — Execução automação de testes

Roda a suíte de API. **Só via `workflow_dispatch`** (manual), pelo motivo acima.

Recebe três inputs no momento do disparo:

| Input | Padrão | Descrição |
| --- | --- | --- |
| `browser` | `chrome` | `chrome` ou `electron` |
| `amb` | `dev` | Ambiente → resolve para `config/{amb}.config.js` |
| `tag` | `@regression` | Tag usada para filtrar os testes |

O job roda em `ubuntu-latest` com a action `cypress-io/github-action@v6`, que cuida do
cache do binário do Cypress. Comando executado:

```bash
npx cypress run \
  --config-file config/${amb}.config.js \
  --browser ${browser} \
  --expose grepTags=${tag}
```

Ao final, o relatório do mochawesome é publicado como artefato da execução
(`actions/upload-artifact@v4`, retenção de 20 dias), baixável pela página da execução.

### GitHub Pages (desativado)

O repositório costumava publicar um site via Pages, gerado pelo modo Jekyll legado do
GitHub a partir da raiz da `main`. Isso foi **desligado**, junto com o workflow
`static.yml` que o alimentava.

Os dois foram removidos pelo mesmo motivo: nenhum dos dois fazia algo que valesse a pena
manter.

- O `static.yml` falhava em **toda** push. O `upload-pages-artifact@v2` depende do
  depreciado `upload-artifact@v3`, que o GitHub agora recusa automaticamente.
- O site nem dependia desse workflow — a build legada é quem o servia — e tudo que ele
  renderizava era o README, que o próprio GitHub já exibe melhor.
- Nada no repositório apontava para a URL do Pages.
- Ele servia o repositório inteiro como arquivos estáticos, o que é uma superfície de
  distribuição sem propósito por trás.

Publicar o relatório de teste via Pages precisaria de um desenho diferente de qualquer
forma: `cypress/report/` está no `.gitignore`, então nenhum relatório é versionado. O
workflow `main.yml` já publica o relatório do mochawesome como artefato da execução, o
que cobre essa necessidade.

Para trazer um site de volta, reative o Pages em **Settings → Pages** e escolha uma
fonte.

## Solução de problemas

### `bad option: --no-sandbox` ao rodar pelo terminal do VS Code

O terminal integrado do VS Code define `ELECTRON_RUN_AS_NODE=1`, o que faz o binário do
Cypress subir como Node puro e rejeitar as flags do Electron. Correção:

```bash
unset ELECTRON_RUN_AS_NODE && npx cypress run
```

Ou rode a partir de um terminal externo, onde a variável não está definida. O CI não é
afetado.

## O que o `.gitignore` cobre

```
# Dependencies
node_modules/

# Cypress artifacts
cypress/report/
**/*.mp4
**/*.png
videos
screenshots

# Editors / OS
.ideia/
.DS_Store
```

Dependências, relatórios, vídeos e screenshots ficam fora do controle de versão. Vale
notar que a gravação de vídeo vem **desabilitada por padrão** desde o Cypress 13.
