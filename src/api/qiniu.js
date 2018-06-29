/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export function getToken() {
  return request({
    url: '/zuul/admin/user/upload', // 假地址，自行替换
    method: 'post'
  })
}
