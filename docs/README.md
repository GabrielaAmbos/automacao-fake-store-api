# Documentação — Automação Fake Store API

Suíte de testes automatizados de API para a [Fake Store API](https://fakestoreapi.com),
escrita em JavaScript com o framework [Cypress](https://www.cypress.io) (v15).

O projeto é um estudo de automação de testes de API: valida os endpoints públicos de
produtos e categorias da Fake Store API usando `cy.request()`, comandos customizados e
fixtures como massa de dados esperada.

## Índice

| Documento | Conteúdo |
| --- | --- |
| [Arquitetura](arquitetura.md) | Estrutura de pastas, configuração e decisões técnicas |
| [Comandos customizados](comandos-customizados.md) | Referência de todos os comandos `cy.*` do projeto |
| [Casos de teste](casos-de-teste.md) | O que cada teste valida e quais fixtures utiliza |
| [Execução e CI](execucao-e-ci.md) | Como rodar localmente, relatórios e GitHub Actions |
| [Melhorias conhecidas](melhorias-conhecidas.md) | Pontos em aberto e inconsistências mapeadas |

## Início rápido

```bash
# instalar dependências (requer Node >= 20)
npm i

# abrir o Test Runner (modo interativo)
npm run cy:open

# executar os testes em modo headless
npm run cy:run
```

Nenhuma variável de ambiente, autenticação ou banco de dados é necessária — a Fake Store
API é pública e a `baseUrl` já está definida em `cypress.config.js`.

## Sistema sob teste

A Fake Store API é uma API REST pública de e-commerce fake, usada para prototipagem e
estudos. Os endpoints exercitados por este projeto:

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/products` | Lista todos os produtos |
| `GET` | `/products/{id}` | Busca um produto por id |
| `GET` | `/products?limit={n}` | Lista produtos limitando a quantidade |
| `GET` | `/products?sort={asc\|desc}` | Lista produtos ordenados |
| `GET` | `/products/categories` | Lista todas as categorias |
| `GET` | `/products/category/{nome}` | Lista produtos de uma categoria |
| `POST` | `/products` | Cria um produto (a API não persiste de fato) |
| `PUT` | `/products/{id}` | Atualiza um produto |
| `DELETE` | `/products/{id}` | Remove um produto |

> A Fake Store API é somente-leitura na prática: `POST`, `PUT` e `DELETE` respondem com
> sucesso e devolvem o objeto simulado, mas não alteram o estado do servidor. Por isso
> os testes de escrita não podem ser validados por releitura.
