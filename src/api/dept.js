/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export function fetchTree(query) {
  return request({
    url: '/userservice/dept/tree',
    method: 'get',
    params: query
  })
}

export function addObj(obj) {
  return request({
    url: '/userservice/dept/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/userservice/dept/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/userservice/dept/' + id,
    method: 'delete'
  })
}

export function putObj(obj) {
  return request({
    url: '/userservice/dept/',
    method: 'put',
    data: obj
  })
}
