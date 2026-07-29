const TOTAL_USERS = 10

context('Usuários', { tags: ['@regression', '@users'] }, () => {

    context('Leitura', () => {

        it('Buscar todos os usuários', { tags: ['@smoke'] }, () => {
            cy.getAllUsers()
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.be.an('array')
                    expect(response.body).to.have.length(TOTAL_USERS)
                })
        })

        it('Validar o contrato de um usuário', () => {
            cy.getAllUsers()
                .then(response => {
                    const user = response.body[0]

                    expect(user).to.include.all.keys(
                        'id', 'email', 'username', 'password', 'name', 'address', 'phone'
                    )
                    expect(user.id).to.be.a('number')
                    expect(user.email).to.be.a('string').and.contain('@')
                    expect(user.name).to.include.all.keys('firstname', 'lastname')
                    expect(user.address).to.include.all.keys(
                        'city', 'street', 'number', 'zipcode', 'geolocation'
                    )
                    expect(user.address.geolocation).to.include.all.keys('lat', 'long')
                })
        })

        it('Buscar por um usuário', () => {
            const userId = 1

            cy.getSingleUser(userId)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.id).to.equal(userId)
                    expect(response.body.username).to.be.a('string').and.not.be.empty
                })
        })

        it('Buscar por usuário inexistente', () => {
            cy.getSingleUser(999)
                .then(response => {
                    // Same shape as /carts: 200 with a null body, not 404.
                    expect(response.status).to.equal(200)
                    expect(response.body).to.equal(null)
                })
        })

        it('Limitar a quantidade de usuários retornados', () => {
            const limit = 2

            cy.getUsersLimitResult(limit)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body).to.have.length(limit)
                })
        })

        it('Ordenar os usuários de forma decrescente', () => {
            cy.getUsersSortResult('desc')
                .then(response => {
                    const ids = response.body.map(user => user.id)

                    expect(response.status).to.equal(200)
                    expect(ids).to.deep.equal([...ids].sort((a, b) => b - a))
                })
        })
    })

    // Writes are simulated by the API: nothing is persisted between runs.
    context('Escrita', () => {

        it('Cadastrar um novo usuário', { tags: ['@smoke'] }, () => {
            cy.fixture('new_user.json').then(newUser => {
                cy.postAddNewUser(newUser)
                    .then(response => {
                        // POST /users answers only with the generated id.
                        expect(response.status).to.equal(201)
                        expect(response.body.id).to.be.a('number')
                    })
            })
        })

        it('Atualizar um usuário', () => {
            cy.fixture('new_user.json').then(updatedUser => {
                cy.putUpdateUser(1, updatedUser)
                    .then(response => {
                        expect(response.status).to.equal(200)
                        expect(response.body.email).to.equal(updatedUser.email)
                        expect(response.body.username).to.equal(updatedUser.username)
                    })
            })
        })

        it('Excluir um usuário', () => {
            const userId = 2

            cy.deleteUser(userId)
                .then(response => {
                    expect(response.status).to.equal(200)
                    expect(response.body.id).to.equal(userId)
                    expect(response.body.username).to.be.a('string').and.not.be.empty
                })
        })
    })
})
