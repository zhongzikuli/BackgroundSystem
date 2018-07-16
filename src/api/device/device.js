import request from '@/router/axios'


export function fetchDeviceList(query) {
  return request({
    url: '/orderservice/gpsDevice/gpsDevicePage',
    method: 'get',
    params: query
  })
}
