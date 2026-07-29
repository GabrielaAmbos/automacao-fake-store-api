import js from '@eslint/js'
import globals from 'globals'
import cypress from 'eslint-plugin-cypress'
import mocha from 'eslint-plugin-mocha'

export default [
    {
        ignores: ['node_modules/**', 'cypress/report/**', 'cypress/screenshots/**', 'cypress/videos/**']
    },

    js.configs.recommended,

    // Node context: config files and anything else running outside the browser.
    {
        files: ['*.js', '*.mjs', 'config/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: globals.node
        }
    },
    {
        files: ['eslint.config.mjs'],
        languageOptions: { sourceType: 'module' }
    },

    // Cypress context: specs and support files run inside the browser.
    {
        files: ['cypress/**/*.js'],
        ...cypress.configs.recommended,
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...cypress.configs.globals.languageOptions.globals
            }
        }
    },

    // Test files: catch the classic mistakes (skipped tests, empty blocks,
    // duplicate titles, assertions outside a test).
    {
        files: ['cypress/e2e/**/*.cy.js'],
        plugins: { mocha },
        rules: {
            ...mocha.configs.recommended.rules,
            // Arrow callbacks are the Cypress idiom: no `this` context is needed.
            'mocha/no-mocha-arrows': 'off',
            // False positive for Cypress: `cy.request().then()` is a chainable from the
            // command queue, not a Promise. Making these tests async would be wrong.
            'mocha/no-async-in-sync-tests': 'off',
            // A committed `.only` would silently skip the rest of the suite in CI.
            'mocha/no-exclusive-tests': 'error',
            'mocha/no-pending-tests': 'warn'
        }
    },

    // Project-wide style, matching the code already in the repository.
    {
        files: ['**/*.js', '**/*.mjs'],
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
            quotes: ['error', 'single', { avoidEscape: true }],
            semi: ['error', 'never'],
            'comma-dangle': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
            'arrow-parens': ['error', 'as-needed'],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            eqeqeq: ['error', 'always']
        }
    }
]
