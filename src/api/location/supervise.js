/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */

import request from '@/router/axios'

/**
 * 根据条件获取GPS设备树
 * @param query
 */
export function fetchDeptTree(query) {
  return request({
    url: '/orderservice/gpsSupervise/gpsTree',
    method: 'post',
    data: query
  })
}

/**
 * 通过部门ID获取该部门下的GPS设备数量
 * @param deptId
 */
export function getGpsServiceOnDept(deptId) {
  return request({
    url: '/orderservice/gpsSupervise/deptGps/' + deptId,
    method: 'get'
  })
}

