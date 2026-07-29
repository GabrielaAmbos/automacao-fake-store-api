// The credentials in `credentials.json` are the public demo ones published by
// the Fake Store API — they are not secrets.
const JWT_PATTERN = /^[\w-]+\.[\w-]+\.[\w-]+$/

context('Autenticação', { tags: ['@regression', '@auth'] }, () => {

    it('Autenticar com credenciais válidas', { tags: ['@smoke'] }, () => {
        cy.fixture('credentials.json').then(({ valid }) => {
            cy.postLogin(valid)
                .then(response => {
                    expect(response.status).to.equal(201)
                    expect(response.body.token).to.be.a('string').and.not.be.empty
                    expect(response.body.token).to.match(JWT_PATTERN)
                })
        })
    })

    it('Rejeitar credenciais inválidas', () => {
        cy.fixture('credentials.json').then(({ invalid }) => {
            cy.postLogin(invalid)
                .then(response => {
                    expect(response.status).to.equal(401)
                    expect(response.body).to.contain('incorrect')
                })
        })
    })

    it('Rejeitar login com a senha errada', () => {
        cy.fixture('credentials.json').then(({ valid }) => {
            cy.postLogin({ username: valid.username, password: 'senha_errada' })
                .then(response => {
                    expect(response.status).to.equal(401)
                    expect(response.body).to.contain('incorrect')
                })
        })
    })

    it('Rejeitar login sem username e password', () => {
        cy.postLogin({})
            .then(response => {
                expect(response.status).to.equal(400)
                expect(response.body).to.contain('not provided')
            })
    })
})
