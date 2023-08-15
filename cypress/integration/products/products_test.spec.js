
describe('Produtos', () => {

    it('Buscar todos os produtos', () => {
        cy.getAllProductos()
           .then(response => {
            expect(response.status).to.equal(200)
        })
    })

    it('Buscar por um produto', () => {
       cy.fixture('hard_drive_portable_2t.json').then((expectBody) => {
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
                expect(response.status).to.equal(200)
                expect(response.body).to.equal('')
            })
    })

        it('Buscar todas as categorias', () => {
            cy.fixture('all_categories.json').then((expectBody) => {
                cy.getAllCategories()
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body[0]).to.equal(expectBody.category_electronics)
                        expect(response.body[1]).to.equal(expectBody.category_jewelery)
                        expect(response.body[2]).to.equal(expectBody.category_men_clothing)
                        expect(response.body[3]).to.equal(expectBody.category_women_clothing)
                    })
            })
        })

        it('Buscar por uma categoria', () => {
            cy.fixture('all_eletronic_products.json').then((expectBody) => {
                cy.getSpecificCategory('eletronic')
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body)
                    })
            })
        })


        it('Buscar por uma categoria inexistente', () => {
            cy.getSpecificCategory('noneC')
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.equal('')  
                })
        })


    })
    
