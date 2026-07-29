
Cypress.Commands.add('getAllCarts', () => {
    cy.request({
        method: 'GET',
        url: '/carts'
    })
})

Cypress.Commands.add('getSingleCart', cartId => {
    cy.request({
        method: 'GET',
        url: '/carts/' + cartId
    })
})

Cypress.Commands.add('getCartsByUser', userId => {
    cy.request({
        method: 'GET',
        url: '/carts/user/' + userId
    })
})

Cypress.Commands.add('getCartsLimitResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/carts?limit=' + queryString
    })
})

Cypress.Commands.add('getCartsSortResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/carts?sort=' + queryString
    })
})

Cypress.Commands.add('getCartsByDateRange', (startDate, endDate) => {
    cy.request({
        method: 'GET',
        url: '/carts?startdate=' + startDate + '&enddate=' + endDate
    })
})

Cypress.Commands.add('postAddNewCart', jsonBody => {
    cy.request({
        method: 'POST',
        url: '/carts',
        body: jsonBody
    })
})

Cypress.Commands.add('putUpdateCart', (cartId, jsonBody) => {
    cy.request({
        method: 'PUT',
        url: '/carts/' + cartId,
        body: jsonBody
    })
})

Cypress.Commands.add('deleteCart', cartId => {
    cy.request({
        method: 'DELETE',
        url: '/carts/' + cartId
    })
})
