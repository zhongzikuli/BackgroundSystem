/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
require('./check-versions')()// 首先检查node和npm的版本
// 获取配置文件中默认的配置
let config = require('../config')
// 如果node无法判断当前是开发环境还是生产环境，则使用config.dev.env.NODE_ENV作为当前的环境
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

let opn = require('opn')// 用来在起来服务之后，打开浏览器并跳转指定URL
let path = require('path')
let express = require('express')
let webpack = require('webpack')
let proxyMiddleware = require('http-proxy-middleware')// 中间件
let webpackConfig = require('./webpack.dev.conf')

// default port where dev server listens for incoming traffic
let port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
let autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
let proxyTable = config.dev.proxyTable

let app = express()// 起服务
let compiler = webpack(webpackConfig)// webpack进行编译

// webpack-dev-middleware将编译的文件放在内存中，后续注入
let devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})
// 热加载
let hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {
  }
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({action: 'reload'})
    cb()
  })
})

// proxy api requests
// proxyTable中的配置挂载到express中
Object.keys(proxyTable).forEach(function (context) {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = {target: options}
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API处理后退的时候匹配资源
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output暂存在内存的webpack编译后的文件挂载到express上
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets// 拼static静态资源文件路径
let staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
// express为静态资源提供服务
app.use(staticPath, express.static('./static'))

let uri = 'http://localhost:' + port

let _resolve
let readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  if (autoOpenBrowser && process.env.NODE_ENV !== 'test') {
    opn(uri)
  }
  _resolve()
})
// 通过配置的端口，自动打开浏览器，并跳转拼好的URL，至此，发开环境已经跑起来了
let server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
