'use strict'

const name = 'bpmn-vue-properties-panel-camunda', // page title
  port = process.env.port || process.env.npm_config_port || 9000 // dev port

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  lintOnSave: true,
  productionSourceMap: false,
  devServer: {
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },
    disableHostCheck: true
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name
  }
}
