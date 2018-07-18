/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'


export function fetchDeviceList(query) {
  return request({
    url: '/orderservice/device/gpsDevicePage',
    method: 'get',
    params: query
  })
}

export function updateDevice(obj) {
  return request({
    url: '/orderservice/device/updateGpsDevice',
    method: 'put',
    data: obj
  })
}
