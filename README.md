[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&pause=1000&color=DF62F7&width=435&lines=Projeto+de+Automa%C3%A7%C3%A3o+Fake+Store+API)](https://git.io/typing-svg)

Projeto de automação no endpoint https://fakestoreapi.com utilizando a linguagem Javascript e o framework de automação Cypress.

## Features testadas:

    Get Buscar todos os produtos
    Get Buscar por produto
    Get Buscar por produto inexistente
    Get Buscar todas as categorias

## Requisitos

Node.js 20, 22 ou 24+ (exigência do Cypress 15).

**Instalar as dependências:**
```
npm i
```
**Executar o cypress:**
```
npx cypress open
```
**Para executar os testes diretamente:**
```
npx cypress run
```
**Para filtrar os testes por tag:**
```
npx cypress run --expose grepTags=@regression
```

## Documentação

Documentação completa do projeto na pasta [docs/](docs/README.md) — arquitetura,
referência dos comandos customizados, casos de teste e pipeline de CI.
