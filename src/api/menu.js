import request from '@/router/axios'

export function GetMenu() {
  return request({
    url: '/userApi/menu/getUserTree',
    method: 'get'
  })
}

export function fetchTree(query) {
  return request({
    url: '/userApi/menu/tree',
    method: 'get',
    params: query
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
