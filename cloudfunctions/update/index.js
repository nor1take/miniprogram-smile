// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
// 云函数入口函数
exports.main = async (event, context) => {
  comment.where({
    nickname: 'ChatGPT'
  }).update({
    data: {
      nickname: 'AI',
      image: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/6438dde0-63639101-4414b950'
    }
  }).then((res) => {
    return res;
  }).catch((err) => {
    return err
  })
}