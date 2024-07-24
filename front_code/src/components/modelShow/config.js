const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: "/",
  productionSourceMap: false,
  chainWebpack: (config) => {
    config.resolve.alias.set('@/', resolve('src'))
    config
      .plugin('html')
      .tap(args => {
        args[0].title = '111'
        return args
      })
  },

  lintOnSave: false,
  productionSourceMap: false,
}