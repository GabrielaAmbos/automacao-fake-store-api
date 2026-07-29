const TOTAL_CARTS = 7

context('Carrinhos', { tags: ['@regression', '@carts'] }, () => {

    context('Leitura', () => {

        it('Buscar todos os carrinhos', { tags: ['@smoke'] }, () => {
            cy.getAllCarts()
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array')
                    expect(response.body).to.have.length(TOTAL_CARTS)
                })
        })

        it('Validar o contrato de um carrinho', () => {
            cy.getAllCarts()
                .then(response => {
                    const cart = response.body[0]

                    expect(cart).to.include.all.keys('id', 'userId', 'date', 'products')
                    expect(cart.id).to.be.a('number')
                    expect(cart.userId).to.be.a('number')
                    expect(cart.date).to.be.a('string')
                    expect(cart.products).to.be.an('array').and.not.be.empty
                    cart.products.forEach(product => {
                        expect(product).to.have.all.keys('productId', 'quantity')
                        expect(product.productId).to.be.a('number')
                        expect(product.quantity).to.be.a('number')
                    })
                })
        })

        it('Buscar por um carrinho', () => {
            const cartId = 1

            cy.getSingleCart(cartId)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.id).to.equal(cartId)
                    expect(response.body.products).to.be.an('array').and.not.be.empty
                })
        })

        it('Buscar por carrinho inexistente', () => {
            cy.getSingleCart(999)
                .then(response => {
                    // Unlike /products, a missing cart returns 200 with a null body.
                    expect(response.status).to.equal(200)
                    expect(response.body).to.equal(null)
                })
        })

        it('Buscar os carrinhos de um usuário', () => {
            const userId = 1

            cy.getCartsByUser(userId)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array').and.not.be.empty
                    response.body.forEach(cart => {
                        expect(cart.userId).to.equal(userId)
                    })
                })
        })

        it('Buscar os carrinhos de um usuário sem compras', () => {
            cy.getCartsByUser(999)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array').and.be.empty
                })
        })

        it('Limitar a quantidade de carrinhos retornados', () => {
            const limit = 2

            cy.getCartsLimitResult(limit)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.have.length(limit)
                })
        })

        it('Ordenar os carrinhos de forma decrescente', () => {
            cy.getCartsSortResult('desc')
                .then(response => {
                    const ids = response.body.map(cart => cart.id)

                    expect(response.status).to.equal(200)
                    expect(ids).to.deep.equal([...ids].sort((a, b) => b - a))
                })
        })

        it('Buscar carrinhos por intervalo de datas', () => {
            cy.getCartsByDateRange('2019-12-10', '2020-10-10')
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array')
                })
        })
    })

    // Writes are simulated by the API: the payload is echoed back, never stored.
    context('Escrita', () => {

        it('Cadastrar um novo carrinho', { tags: ['@smoke'] }, () => {
            cy.fixture('new_cart.json').then(newCart => {
                cy.postAddNewCart(newCart)
                    .then(response => {
                        expect(response.status).to.equal(201)
                        expect(response.body.id).to.be.a('number')
                        expect(response.body.userId).to.equal(newCart.userId)
                        expect(response.body.products).to.deep.equal(newCart.products)
                    })
            })
        })

        it('Atualizar um carrinho', () => {
            const cartId = 3

            cy.fixture('new_cart.json').then(updatedCart => {
                cy.putUpdateCart(cartId, updatedCart)
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body.id).to.equal(cartId)
                        expect(response.body.userId).to.equal(updatedCart.userId)
                        expect(response.body.products).to.deep.equal(updatedCart.products)
                    })
            })
        })

        it('Excluir um carrinho', () => {
            const cartId = 2

            cy.deleteCart(cartId)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.id).to.equal(cartId)
                    expect(response.body.products).to.be.an('array')
                })
        })
    })
})
