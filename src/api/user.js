/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export const GetMenu = () => {
  return request({
    url: '/userservice/user/userTree',
    method: 'get'
  })
}

export const fetchList = query => {
  return request({
    url: '/userservice/user/userPage',
    method: 'get',
    params: query
  })
}

export const addObj = obj => {
  return request({
    url: '/userservice/user/add',
    method: 'post',
    data: obj
  })
}

export const getObj = id => {
  return request({
    url: '/userservice/user/' + id,
    method: 'get'
  })
}

export const delObj = id => {
  return request({
    url: '/userservice/user/' + id,
    method: 'delete'
  })
}

export const putObj = obj => {
  return request({
    url: '/userservice/user',
    method: 'put',
    data: obj
  })
}

