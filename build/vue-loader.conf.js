/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
'use strict'
let utils = require('./utils')
let config = require('../config')
let isProduction = process.env.NODE_ENV === 'production'
let sourceMapEnabled = isProduction ? config.build.productionSourceMap : config.dev.cssSourceMap

module.exports = {
  loaders: utils.cssLoaders({
    sourceMap: sourceMapEnabled,
    extract: isProduction
  }),
  cssSourceMap: sourceMapEnabled,
  cacheBusting: config.dev.cacheBusting,
  transformToRequire: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
