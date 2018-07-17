/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import waves from './waves'

const install = function(Vue) {
  Vue.directive('waves', waves)
}

if (window.Vue) {
  window.waves = waves
  Vue.use(install); // eslint-disable-line
}

waves.install = install
export default waves
