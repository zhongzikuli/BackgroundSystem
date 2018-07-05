/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'


export function fetchTree(query) {
  return request({
    url: '/userservice/dict/tree',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/userservice/dict/add',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/userservice/dict/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/userservice/dict/' + id,
    method: 'delete'
  })
}

export function putObj(obj) {
  return request({
    url: '/userservice/dict/update',
    method: 'put',
    data: obj
  })
}


export function fetchList(query) {
  return request({
    url: '/userservice/dict/tree',
    method: 'get',
    params: query
  })
}

export function remote(type) {
  return request({
    url: '/userservice/dict/type/' + type,
    method: 'get'
  })
}

