// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command
const userInfo = db.collection('userInfo')
// 云函数入口函数
exports.main = async (event, context) => {
  userInfo.where({
    _id: _.exists(true)
  }).update({
    data: {
      isCheckSystemMsg: false
    }
  }).then((res) => {
    return res;
  }).catch((err) => {
    return err
  })
}