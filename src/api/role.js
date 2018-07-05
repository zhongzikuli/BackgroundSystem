/**
 * Created by zhongzikuli <hgb102xlg@126.com> on 18/6/10.
 */
import request from '@/router/axios'

export function roleList() {
  return request({
    url: '/userservice/role/roleList',
    method: 'get'
  })
}

export function fetchList(query) {
  return request({
    url: '/userservice/role/rolePage',
    method: 'get',
    params: query
  })
}

export function deptRoleList(deptId) {
  return request({
    url: '/userservice/role/roleList/' + deptId,
    method: 'get'
  })
}

export function getObj(id) {
  return request({
    url: '/userservice/role/' + id,
    method: 'get'
  })
}

export function addObj(obj) {
  return request({
    url: '/userservice/role/',
    method: 'post',
    data: obj
  })
}

export function putObj(obj) {
  return request({
    url: '/userservice/role/',
    method: 'put',
    data: obj
  })
}

export function delObj(id) {
  return request({
    url: '/userservice/role/' + id,
    method: 'delete'
  })
}

export function permissionUpd(roleId, menuIds) {
  return request({
    url: '/userservice/role/roleMenuUpd',
    method: 'put',
    params: {
      roleId: roleId,
      menuIds: menuIds
    }
  })
}

export function fetchRoleTree(roleId) {
  return request({
    url: '/userservice/menu/roleTree/' + roleId,
    method: 'get'
  })
}

export function fetchDeptTree(query) {
  return request({
    url: '/userservice/dept/tree',
    method: 'get',
    params: query
  })
}
