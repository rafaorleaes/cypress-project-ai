const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    viewportWidth: 1366,
    viewportHeight: 768,
    chromeWebSecurity: false,
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 32,
    defaultCommandTimeout: 8000,
    requestTimeout: 10000,
    setupNodeEvents(on, config) {},
  },
});
