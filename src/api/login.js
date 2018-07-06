/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'
import {userInfo, tableData} from '@/mock/user'
import {menu, menuAll} from '@/mock/menu'

export const loginByUsername = (username, password, code, randomStr) => {
  let grant_type = 'password'
  let scope = 'server'
  return request({
    url: '/authservice/oauth/token',
    headers: {
      'Authorization': 'Basic Y2xpZW50XzI6MTIzNDU2=='
    },
    method: 'post',
    params: {username, password, randomStr, code, grant_type, scope}
  })
}

export function mobileLogin(mobile, code) {
  let grant_type = 'mobile'
  let scope = 'server'
  return request({
    url: '/auth/mobile/token',
    headers: {
      'Authorization': 'Basic cGlnOnBpZw=='
    },
    method: 'post',
    params: {mobile, code, grant_type, scope}
  })
}

export const getUserInfo = () => {
  return request({
    url: '/userservice/user/getUserInfo',
    method: 'get'
  })
}

export const logout = (accesstoken, refreshToken) => {
  return request({
    url: '/authservice/authentication/removeToken',
    method: 'post',
    headers: {
      'Authorization': ''
    },
    params: {accesstoken, refreshToken}
  })
}



