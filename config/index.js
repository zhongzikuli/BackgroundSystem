/*
 *    Copyright (c) 2018-2025, lengleng All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 * Neither the name of the pig4cloud.com developer nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 * Author: lengleng (wangiegie@gmail.com)
 */

// see http://vuejs-templates.github.io/webpack for documentation.
let path = require('path')
//let baseUrl = 'http://192.168.0.109:5555';
module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),// 编译输入的 index.html 文件
    assetsRoot: path.resolve(__dirname, '../dist'),// 编译输出的静态资源路径
    assetsSubDirectory: 'static',// 编译输出的二级目录
    assetsPublicPath: '/',// 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
    productionSourceMap: false,// 是否开启 cssSourceMap
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false, // 是否开启 gzip
    productionGzipExtensions: ['js', 'css'],// 需要使用 gzip 压缩的文件扩展名
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8000,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    //host: 'localhost',
    assetsPublicPath: '/',
    proxyTable: {
      '/userservice': {
        target: 'http://192.168.0.109:5555/api/v1/userservice',
        changeOrigin: true,
        pathRewrite: {
          '^/userservice': ''
        }
      },
      '/authservice': {
        target: 'http://192.168.0.109:5555/api/v1/authservice',
        changeOrigin: true,
        pathRewrite: {
          '^/authservice': ''
        }
      }
    },
    cssSourceMap: false
  }
}
