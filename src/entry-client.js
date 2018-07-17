/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import { createApp } from './main'
const { app, router, store } = createApp()
if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
}
router.onReady(() => {
    app.$mount('#app')
})
