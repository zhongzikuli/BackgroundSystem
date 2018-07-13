/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export const fetchTree = query => {
  return request({
    url: '/userservice/menu/tree',
    method: 'get',
    params: query
  })
}

export const fetchAll = () => {
  return request({
    url: '/api/v1/menu/navMenu',
    method: 'get'
  })
}

export function addObj(obj) {
  return request({
    url: '/userservice/menu/add',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/userservice/menu/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/userservice/menu/' + id,
    method: 'delete'
  })
}

export function putObj(obj) {
  return request({
    url: '/userservice/menu/update',
    method: 'put',
    data: obj
  })
}
