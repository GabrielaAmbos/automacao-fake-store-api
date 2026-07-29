
Cypress.Commands.add('getAllUsers', () => {
    cy.request({
        method: 'GET',
        url: '/users'
    })
})

Cypress.Commands.add('getSingleUser', userId => {
    cy.request({
        method: 'GET',
        url: '/users/' + userId
    })
})

Cypress.Commands.add('getUsersLimitResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/users?limit=' + queryString
    })
})

Cypress.Commands.add('getUsersSortResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/users?sort=' + queryString
    })
})

Cypress.Commands.add('postAddNewUser', jsonBody => {
    cy.request({
        method: 'POST',
        url: '/users',
        body: jsonBody
    })
})

Cypress.Commands.add('putUpdateUser', (userId, jsonBody) => {
    cy.request({
        method: 'PUT',
        url: '/users/' + userId,
        body: jsonBody
    })
})

Cypress.Commands.add('deleteUser', userId => {
    cy.request({
        method: 'DELETE',
        url: '/users/' + userId
    })
})
