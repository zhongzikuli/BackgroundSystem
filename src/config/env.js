/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 老项目域名地址
 * khglUrl: 客户管理域名地址
 * dicUrl : 字典服务器地址
 * routerMode: 路由模式
 * imgBaseUrl: 图片所在域名地址
 * welUrl :默认欢迎页
 *
 */

let baseUrl = '';
let iconfontVersion = ['567566_r22zi6t8noas8aor', '599693_c3ju5pfa6altmx6r'];
let iconfontUrl = `//at.alicdn.com/t/font_$key.css`;
let codeUrl = `/authservice/authentication/code`
 if (process.env.NODE_ENV == 'test') {
  baseUrl = `http://192.168.0.109:5555/api/v1/`;
  codeUrl = `${baseUrl}authservice/authentication/code`
} else if(process.env.NODE_ENV == 'production') {
  baseUrl = `http://192.168.0.109:5555/api/v1/`;
  codeUrl = `${baseUrl}authservice/authentication/code`
}

export {baseUrl, iconfontUrl, iconfontVersion, codeUrl}
