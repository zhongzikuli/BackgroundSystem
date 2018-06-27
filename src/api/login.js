

import {baseUrl, khglUrl, dicUrl} from '@/config/env'
import request from '@/router/axios'
import {userInfo, tableData} from '@/mock/user'
import {menu, menuAll} from '@/mock/menu'

export const loginByUsername = (username, password,) => {
  let grant_type = 'password'
  let scope = 'server'
  return request({
    url: '/authApi/oauth/token',
    headers: {
      'Authorization': 'Basic Y2xpZW50XzI6MTIzNDU2=='
    },
    method: 'post',
    params: {username, password, grant_type, scope}
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
    url: '/userApi/user/getUserInfo',
    method: 'get'
  })
}

export const logout = (accesstoken, refreshToken) => {
  return request({
    url: '/authApi/authentication/removeToken',
    method: 'post',
    params: {accesstoken, refreshToken}
  })
}
