/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export function fetchDeptTree(query) {
  return request({
    url: '/orderservice/gpsSupervise/gpsTree',
    method: 'get',
    params: query
  })
}
