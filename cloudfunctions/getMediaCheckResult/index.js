// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const head = 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/'
// 云函数入口函数
exports.main = async (event, context) => {
  const { result, trace_id, FromUserName } = event
  const { suggest } = result

  const fileId = head + FromUserName + '/' + trace_id

  if (suggest != 'pass') {
    cloud.deleteFile({
      fileList: [fileId],
      success: res => {
        return { event, res, fileId }
      },
      fail: err => {
        return { err, fileId }
      }
    })
  } else {
    return { event, fileId }
  }
}