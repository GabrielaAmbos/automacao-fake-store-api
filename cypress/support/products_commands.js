
Cypress.Commands.add('getAllProductos', () => {
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
        url: '/products/cagories'
    })
})

Cypress.Commands.add('getSpecifcCategory', queryString => {
    cy.request({
        method: 'GET',
        url: '/productos/category' + queryString
    })
})

Cypress.Commands.add('postAddNewProduct', jsonBody  => {
    cy.request({
        method : 'POST',
        url: '/products',
        body: jsonBody
    })
})

//Cypress.Commands.add('putUpdateProduct', productId, jsonBody  => {
//    cy.api({
//        method : 'PUT',
//        url: getUrlAllProducts() + '/' + productId,
//        body: jsonBody
//    })
//})

Cypress.Commands.add('deleteProduct', productId  => {
    cy.api({
        method : 'DELETE',
        url: getUrlAllProducts() + '/' + productId
    })
})