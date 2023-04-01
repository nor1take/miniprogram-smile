// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
// 云函数入口函数
exports.main = async (event, context) => {
  question.where({
    _id: _.exists(true)
  }).update({
    data: {
      liker: [],
      postLikeNum: 0
    }
  }).then((res) => {
    return res;
  }).catch((err) => {
    return err
  })
}