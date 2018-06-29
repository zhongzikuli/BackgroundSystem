/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export const GetMenu = () => {
  return request({
    url: '/userApi/menu/getUserTree',
    method: 'get'
  })
}

export const fetchTree = query => {
  return request({
    url: '/userApi/menu/tree',
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

export const fetchUserTree = () => {
  return request({
    url: '/api/v1/menu/userTree',
    method: 'get'
  })
}

export function addObj(obj) {
  return request({
    url: '/userApi/menu/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/userApi/menu/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/userApi/menu/' + id,
    method: 'delete'
  })
}

export function putObj(obj) {
  return request({
    url: '/userApi/menu/',
    method: 'put',
    data: obj
  })
}
