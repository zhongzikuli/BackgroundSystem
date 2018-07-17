/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
})
