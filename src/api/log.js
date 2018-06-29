/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export function fetchList(query) {
  return request({
    url: '/admin/log/logPage',
    method: 'get',
    params: query
  })
}

export function delObj(id) {
  return request({
    url: '/admin/log/' + id,
    method: 'delete'
  })
}

export function addObj(obj) {
  return request({
    url: '/admin/user/',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/admin/user/' + id,
    method: 'get'
  })
}

export function putObj(obj) {
  return request({
    url: '/admin/user/',
    method: 'put',
    data: obj
  })
}
