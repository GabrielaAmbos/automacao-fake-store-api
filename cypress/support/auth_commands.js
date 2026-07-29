
// `failOnStatusCode: false` keeps the command usable for negative scenarios,
// where the API answers 401 (wrong credentials) or 400 (malformed payload).
Cypress.Commands.add('postLogin', jsonBody => {
    cy.request({
        method: 'POST',
        url: '/auth/login',
        body: jsonBody,
        failOnStatusCode: false
    })
})
