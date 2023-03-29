// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
// 云函数入口函数
exports.main = async (event, context) => {
  // comment.where({
  //   nickname: '小程序开发者',
  //   idTitle: ''
  // }).update({
  //   data: {
  //     nickname: 'noritake',
  //     idTitle: '开发者'
  //   }
  // }).then((res) => {
  //   return res;
  // }).catch((err) => {
  //   return err
  // })
}