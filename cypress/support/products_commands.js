
Cypress.Commands.add('getAllProducts', () => {
    cy.request({
        method: 'GET',
        url: '/products'
    })
})

Cypress.Commands.add('getSingleProduct', queryString => {
    cy.request({
        method: 'GET',
        url: '/products/' + queryString
    })
})

Cypress.Commands.add('getProductsLimitResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/products?limit=' + queryString
    })
})

Cypress.Commands.add('getProductsSortResult', queryString => {
    cy.request({
        method: 'GET',
        url: '/products?sort=' + queryString
    })
})

Cypress.Commands.add('getAllCategories', () => {
    cy.request({
        method: 'GET',
        url: '/products/categories'
    })
})

Cypress.Commands.add('getSpecificCategory', queryString => {
    cy.request({
        method: 'GET',
        url: '/products/category/' + encodeURIComponent(queryString)
    })
})

Cypress.Commands.add('postAddNewProduct', jsonBody => {
    cy.request({
        method: 'POST',
        url: '/products',
        body: jsonBody
    })
})

Cypress.Commands.add('putUpdateProduct', (productId, jsonBody) => {
    cy.request({
        method: 'PUT',
        url: '/products/' + productId,
        body: jsonBody
    })
})

Cypress.Commands.add('patchUpdateProduct', (productId, jsonBody) => {
    cy.request({
        method: 'PATCH',
        url: '/products/' + productId,
        body: jsonBody
    })
})

Cypress.Commands.add('deleteProduct', productId => {
    cy.request({
        method: 'DELETE',
        url: '/products/' + productId
    })
})
