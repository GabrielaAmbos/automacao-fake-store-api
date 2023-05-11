
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
})