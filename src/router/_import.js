/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
module.exports = (file, path) => {
    if (!path) path = 'page'
    return require(`../${path}/${file}.vue`)
}
