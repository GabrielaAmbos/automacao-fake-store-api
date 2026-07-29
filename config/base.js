const { defineConfig } = require('cypress')

/**
 * Shared Cypress configuration. Each environment file under `config/` calls this
 * factory with its own `baseUrl`, so everything else stays defined in one place.
 *
 * @param {{ baseUrl: string }} options
 */
function createConfig({ baseUrl }) {
    return defineConfig({
        viewportWidth: 1920,
        viewportHeight: 1080,
        // Cypress.env() is deprecated in Cypress 15; values are passed via --expose instead.
        allowCypressEnv: false,
        reporter: 'mochawesome',
        reporterOptions: {
            reportDir: 'cypress/report/mochawesome-report',
            overwrite: false,
            html: true,
            json: true,
            timestamp: 'mmddyyyy_HHMMss'
        },
        e2e: {
            baseUrl,
            setupNodeEvents(on, config) {
                const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin')
                cypressGrepPlugin(config)
                return config
            }
        }
    })
}

module.exports = { createConfig }
