const TOTAL_PRODUCTS = 20

context('Produtos', { tags: ['@regression', '@activities', '@products'] }, () => {

    context('Leitura', () => {

        it('Buscar todos os produtos', { tags: ['@smoke'] }, () => {
            cy.getAllProducts()
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array')
                    expect(response.body).to.have.length(TOTAL_PRODUCTS)
                })
        })

        it('Validar o contrato de um produto da listagem', () => {
            cy.getAllProducts()
                .then(response => {
                    const product = response.body[0]

                    expect(product).to.have.all.keys(
                        'id', 'title', 'price', 'description', 'category', 'image', 'rating'
                    )
                    expect(product.id).to.be.a('number')
                    expect(product.title).to.be.a('string').and.not.be.empty
                    expect(product.price).to.be.a('number')
                    expect(product.category).to.be.a('string').and.not.be.empty
                    expect(product.rating).to.have.all.keys('rate', 'count')
                })
        })

        it('Buscar por um produto', { tags: ['@regression'] }, () => {
            cy.fixture('hard_drive_portable_2t.json').then(expectBody => {
                cy.getSingleProduct(expectBody.id)
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body.title).to.equal(expectBody.title)
                        expect(response.body.description).to.equal(expectBody.description)
                        expect(response.body.price).to.equal(expectBody.price)
                        expect(response.body.category).to.equal(expectBody.category)
                    })
            })
        })

        it('Buscar por produto inexistente', () => {
            cy.getSingleProduct(-1)
                .then(response => {
                    // The API answers 200 with an empty body instead of 404.
                    expect(response.status).to.equal(200)
                    expect(response.body).to.equal('')
                })
        })

        it('Limitar a quantidade de produtos retornados', () => {
            const limit = 3

            cy.getProductsLimitResult(limit)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.have.length(limit)
                })
        })

        it('Ordenar os produtos de forma crescente', () => {
            cy.getProductsSortResult('asc')
                .then(response => {
                    const ids = response.body.map(product => product.id)

                    expect(response.status).to.equal(200)
                    expect(ids).to.deep.equal([...ids].sort((a, b) => a - b))
                })
        })

        it('Ordenar os produtos de forma decrescente', () => {
            cy.getProductsSortResult('desc')
                .then(response => {
                    const ids = response.body.map(product => product.id)

                    expect(response.status).to.equal(200)
                    expect(ids).to.deep.equal([...ids].sort((a, b) => b - a))
                })
        })
    })

    context('Categorias', () => {

        it('Buscar todas as categorias', () => {
            cy.fixture('all_categories.json').then(expectBody => {
                cy.getAllCategories()
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body).to.have.members([
                            expectBody.category_electronics,
                            expectBody.category_jewelery,
                            expectBody.category_men_clothing,
                            expectBody.category_women_clothing
                        ])
                    })
            })
        })

        it('Buscar por uma categoria', { tags: ['@regression'] }, () => {
            cy.getSpecificCategory('electronics')
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array').and.not.be.empty
                    response.body.forEach(product => {
                        expect(product.category).to.equal('electronics')
                    })
                })
        })

        it('Buscar por uma categoria com espaço no nome', () => {
            cy.getSpecificCategory("men's clothing")
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array').and.not.be.empty
                    response.body.forEach(product => {
                        expect(product.category).to.equal("men's clothing")
                    })
                })
        })

        it('Buscar por uma categoria inexistente', () => {
            cy.getSpecificCategory('noneC')
                .then(response => {
                    // Unlike a nonexistent id, an unknown category returns an empty array.
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array').and.be.empty
                })
        })
    })

    // The Fake Store API simulates writes: it echoes the payload back but never
    // persists it, so these tests can only assert on the response.
    context('Escrita', () => {

        it('Cadastrar um novo produto', { tags: ['@smoke'] }, () => {
            cy.fixture('new_product.json').then(newProduct => {
                cy.postAddNewProduct(newProduct)
                    .then(response => {
                        expect(response.status).to.equal(201)
                        expect(response.body.id).to.be.a('number')
                        expect(response.body.title).to.equal(newProduct.title)
                        expect(response.body.price).to.equal(newProduct.price)
                        expect(response.body.category).to.equal(newProduct.category)
                    })
            })
        })

        it('Atualizar um produto por completo', () => {
            const productId = 7

            cy.fixture('new_product.json').then(updatedProduct => {
                cy.putUpdateProduct(productId, updatedProduct)
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body.id).to.equal(productId)
                        expect(response.body.title).to.equal(updatedProduct.title)
                        expect(response.body.price).to.equal(updatedProduct.price)
                    })
            })
        })

        it('Atualizar apenas o preço de um produto', () => {
            const productId = 7
            const newPrice = 199.99

            cy.patchUpdateProduct(productId, { price: newPrice })
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.id).to.equal(productId)
                    expect(response.body.price).to.equal(newPrice)
                })
        })

        it('Excluir um produto', () => {
            const productId = 6

            cy.deleteProduct(productId)
                .then(response => {
                    // The response carries the deleted product, not an empty body.
                    expect(response.status).to.equal(200)
                    expect(response.body.id).to.equal(productId)
                    expect(response.body.title).to.be.a('string').and.not.be.empty
                })
        })
    })
})
