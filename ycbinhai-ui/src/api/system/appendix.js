import request from '@/utils/request'

// 查询附件列表
export function listAppendix(query) {
  return request({
    url: '/system/appendix/list',
    method: 'get',
    params: query
  })
}

// 查询附件详细
export function getAppendix(appendixId) {
  return request({
    url: '/system/appendix/' + appendixId,
    method: 'get'
  })
}

// 新增附件
export function addAppendix(data) {
  return request({
    url: '/system/appendix',
    method: 'post',
    data: data
  })
}

// 修改附件
export function updateAppendix(data) {
  return request({
    url: '/system/appendix',
    method: 'put',
    data: data
  })
}

// 删除附件
export function delAppendix(appendixId) {
  return request({
    url: '/system/appendix/' + appendixId,
    method: 'delete'
  })
}

// 导出附件
export function exportAppendix(query) {
  return request({
    url: '/system/appendix/export',
    method: 'get',
    params: query
  })
}