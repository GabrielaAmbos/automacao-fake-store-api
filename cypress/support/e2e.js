// ***********************************************************
// This support file is processed and loaded automatically
// before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { register as registerCypressGrep } from '@cypress/grep'

import './auth_commands'
import './carts_commands'
import './products_commands'
import './users_commands'

// Enables filtering tests by tag, e.g. --expose grepTags=@regression
registerCypressGrep()
