/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import Cookies from 'js-cookie'

const TokenKey = 'x-access-token'

export const setToken = token => {
  return Cookies.set(TokenKey, token)
}

export const getToken = () => {
  return Cookies.get(TokenKey)
}

export const removeToken = () => {
  return Cookies.remove(TokenKey)
}
