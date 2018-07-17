/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
// see http://vuejs-templates.github.io/webpack for documentation.
let path = require('path')
//let baseUrl = 'http://192.168.0.109:5555';
module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  test: {
    env: require('./test.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8009,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    host: 'localhost',
    assetsPublicPath: '/',
    proxyTable: {
      '/userservice': {
        target: 'http://192.168.0.219:5555/api/v1/',
        changeOrigin: true,
        pathRewrite: {
          '^/userservice': '/userservice'
        }
      },
      '/orderservice': {
        target: 'http://192.168.0.219:5555/api/v1/',
        changeOrigin: true,
        pathRewrite: {
          '^/orderservice': '/orderservice'
        }
      },
      '/authservice': {
        target: 'http://192.168.0.219:5555/api/v1/',
        changeOrigin: true,
        pathRewrite: {
          '^/authservice': '/authservice'
        }
      }
    },
    cssSourceMap: false
  }
}
