import * as methods from './config'

// 获取验证码
function getCode (params) {
  return methods.getRequest(
    '/nlampblack/app/connect.action',
    params
  )
}
// 登录
function login (params) {
  return methods.postRequest(
    '/nlampblack/app/login.action',
    params
  )
}
// 意见反馈
function usrfeedback (params) {
  return methods.postRequest(
    '/nlampblack/app/usrfeedback.action',
    params
  )
}
// 修改密码
function modifypasswd (params) {
  return methods.postRequest(
    '/nlampblack/app/modifypasswd.action',
    params
  )
}
// 退出登录
function logout (params) {
  return methods.postRequest(
    '/nlampblack/app/logout.action',
    params
  )
}
// 操作日志 查询
function operateLogQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/operateLogQuery.action',
    params
  )
}
// 餐饮油烟在线监控查询
function diningLampbQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/totallquery.action',
    params
  )
}
// 数据列表 查询
function monitordatalistQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/monitordatalistQuery.action',
    params
  )
}
// 实时数据 查询
function realdataQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/realdataQuery.action',
    params
  )
}
// 区域查询
function districtsQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/districtsQuery.action',
    params
  )
}
// 监控点 数据列表查询
function monitorpointQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/monitorpointQuery.action',
    params
  )
}
// 数据图表查询
function monitordatachartQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/monitordatachartQuery.action',
    params
  )
}
// 街道查询
function streetQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/streetQuery.action?',
    params
  )
}
// 考勤记录查询
function workrecordQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/attendanceQuery.action',
    params
  )
}
// 断线日志
function brokennetworkQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/offlineLogQuery.action',
    params
  )
}
// 超标数据 查询
function overproofQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/overproofQuery.action',
    params
  )
}
/**
 * 考勤详情查询
 * @param {Object} params
 * @param {String} params.id - 考勤记录ID
 */
function attendanceQueryDetail (params) {
  return methods.getRequest(
    '/nlampblack/app/attendanceQueryDetail.action',
    params
  )
}
// 历史数据 查询
function hisdataQuery (params) {
  return methods.getRequest(
    '/nlampblack/app/hisdataQuery.action',
    params
  )
}
// 超标数据详情
function findwarndataDetail (params) {
  return methods.getRequest(
    '/nlampblack/app/findwarndataDetail.action',
    params
  )
}
// 企业总量图表
function getCompanyToadySumAPP () {
  return methods.getRequest(
    '/nlampblack/app/getCompanyToadySumAPP.action'
  )
}
export default {
  getCode,
  login,
  usrfeedback,
  modifypasswd,
  logout,
  operateLogQuery,
  diningLampbQuery,
  monitordatalistQuery,
  districtsQuery,
  realdataQuery,
  monitorpointQuery,
  overproofQuery,
  workrecordQuery,
  brokennetworkQuery,
  streetQuery,
  monitordatachartQuery,
  attendanceQueryDetail,
  hisdataQuery,
  findwarndataDetail,
  getCompanyToadySumAPP
}
