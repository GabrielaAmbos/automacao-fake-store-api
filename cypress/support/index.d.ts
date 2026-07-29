/// <reference types="cypress" />

/**
 * Type definitions for the project's custom commands.
 *
 * Cypress picks this file up automatically, giving editors autocomplete and
 * signature hints for every `cy.*` command declared under `cypress/support/`.
 * Keep it in sync whenever a command is added, renamed or removed.
 */

type SortDirection = 'asc' | 'desc'

interface ProductPayload {
    title?: string
    price?: number
    description?: string
    image?: string
    category?: string
}

interface CartProduct {
    productId: number
    quantity: number
}

interface CartPayload {
    userId?: number
    date?: string
    products?: CartProduct[]
}

interface UserPayload {
    email?: string
    username?: string
    password?: string
    name?: { firstname: string; lastname: string }
    address?: {
        city: string
        street: string
        number: number
        zipcode: string
        geolocation: { lat: string; long: string }
    }
    phone?: string
}

interface Credentials {
    username?: string
    password?: string
}

declare namespace Cypress {
    interface Chainable {
        // --- Products -------------------------------------------------------
        /** `GET /products` — lists every product. */
        getAllProducts(): Chainable<Cypress.Response<unknown>>
        /** `GET /products/{id}` — a nonexistent id answers 200 with an empty body. */
        getSingleProduct(id: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /products?limit={limit}` */
        getProductsLimitResult(limit: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /products?sort={direction}` */
        getProductsSortResult(direction: SortDirection): Chainable<Cypress.Response<unknown>>
        /** `GET /products/categories` — order is not guaranteed. */
        getAllCategories(): Chainable<Cypress.Response<unknown>>
        /** `GET /products/category/{name}` — the name is URL-encoded. */
        getSpecificCategory(name: string): Chainable<Cypress.Response<unknown>>
        /** `POST /products` — answers 201; the API does not persist it. */
        postAddNewProduct(jsonBody: ProductPayload): Chainable<Cypress.Response<unknown>>
        /** `PUT /products/{id}` */
        putUpdateProduct(id: number | string, jsonBody: ProductPayload): Chainable<Cypress.Response<unknown>>
        /** `PATCH /products/{id}` */
        patchUpdateProduct(id: number | string, jsonBody: ProductPayload): Chainable<Cypress.Response<unknown>>
        /** `DELETE /products/{id}` — the response carries the deleted product. */
        deleteProduct(id: number | string): Chainable<Cypress.Response<unknown>>

        // --- Carts ----------------------------------------------------------
        /** `GET /carts` */
        getAllCarts(): Chainable<Cypress.Response<unknown>>
        /** `GET /carts/{id}` — a nonexistent id answers 200 with a null body. */
        getSingleCart(id: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /carts/user/{userId}` */
        getCartsByUser(userId: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /carts?limit={limit}` */
        getCartsLimitResult(limit: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /carts?sort={direction}` */
        getCartsSortResult(direction: SortDirection): Chainable<Cypress.Response<unknown>>
        /** `GET /carts?startdate=&enddate=` — the API currently ignores the range. */
        getCartsByDateRange(startDate: string, endDate: string): Chainable<Cypress.Response<unknown>>
        /** `POST /carts` */
        postAddNewCart(jsonBody: CartPayload): Chainable<Cypress.Response<unknown>>
        /** `PUT /carts/{id}` */
        putUpdateCart(id: number | string, jsonBody: CartPayload): Chainable<Cypress.Response<unknown>>
        /** `DELETE /carts/{id}` */
        deleteCart(id: number | string): Chainable<Cypress.Response<unknown>>

        // --- Users ----------------------------------------------------------
        /** `GET /users` */
        getAllUsers(): Chainable<Cypress.Response<unknown>>
        /** `GET /users/{id}` — a nonexistent id answers 200 with a null body. */
        getSingleUser(id: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /users?limit={limit}` */
        getUsersLimitResult(limit: number | string): Chainable<Cypress.Response<unknown>>
        /** `GET /users?sort={direction}` */
        getUsersSortResult(direction: SortDirection): Chainable<Cypress.Response<unknown>>
        /** `POST /users` — the response carries only the generated id. */
        postAddNewUser(jsonBody: UserPayload): Chainable<Cypress.Response<unknown>>
        /** `PUT /users/{id}` */
        putUpdateUser(id: number | string, jsonBody: UserPayload): Chainable<Cypress.Response<unknown>>
        /** `DELETE /users/{id}` */
        deleteUser(id: number | string): Chainable<Cypress.Response<unknown>>

        // --- Auth -----------------------------------------------------------
        /**
         * `POST /auth/login` — 201 with a JWT on success, 401 for bad credentials
         * and 400 for a payload without username/password. Uses
         * `failOnStatusCode: false`, so negative scenarios reach the assertion.
         */
        postLogin(jsonBody: Credentials): Chainable<Cypress.Response<unknown>>
    }
}
