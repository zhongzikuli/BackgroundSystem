/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export const fetchDeviceList = obj => {
  return request({
    url: '/orderservice/device/gpsDevicePage',
    method: 'post',
    data: obj
  })
}

export const addDevice = obj => {
  return request({
    url: '/orderservice/device/add',
    method: 'post',
    data: obj
  })
}

export const editDevice = obj => {
  return request({
    url: '/orderservice/device/updateGpsDevice',
    method: 'put',
    data: obj
  })
}

export const fetchSingleDevice = id => {
  return request({
    url: '/orderservice/device/' + id,
    method: 'get'
  })
}

export const deleteDevice = ids => {
  return request({
    url: '/orderservice/device/delByDeviceIds/' + ids,
    method: 'delete'
  })
}
