/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export function fetchDeviceList(query) {
  return request({
    url: '/orderservice/gpsDevice/gpsDevicePage',
    method: 'get',
    params: query
  })
}
