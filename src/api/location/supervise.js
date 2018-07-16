import request from '@/router/axios'

export function fetchDeptTree(query) {
  return request({
    url: '/orderservice/gpsSupervise/gpsTree',
    method: 'get',
    params: query
  })
}
