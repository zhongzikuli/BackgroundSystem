/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
'use strict'
require('eventsource-polyfill')
let hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true')

hotClient.subscribe(function (event) {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
