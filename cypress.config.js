const { createConfig } = require('./config/base')

// Default configuration used by local runs (`npm run cy:open` / `npm run cy:run`).
// To target another environment, pass its file explicitly:
//   npx cypress run --config-file config/dev.config.js
module.exports = createConfig({
    baseUrl: 'https://fakestoreapi.com'
})
