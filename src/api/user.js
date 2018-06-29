/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export const fetchList = query => {
  return request({
    url: '/userApi/user/userPage',
    method: 'get',
    params: query
  })
}

export const addObj = obj => {
  return request({
    url: '/userApi/user/',
    method: 'post',
    data: obj
  })
}

export const getObj = id => {
  return request({
    url: '/api/v1/user/' + id,
    method: 'get'
  })
}

export const delObj = id => {
  return request({
    url: '/userApi/user/' + id,
    method: 'delete'
  })
}

export const putObj = obj => {
  return request({
    url: '/userApi/user',
    method: 'put',
    data: obj
  })
}

