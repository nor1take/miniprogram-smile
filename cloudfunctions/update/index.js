// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
const userInfo = db.collection('userInfo')

//_id: _.exists(true)
// 云函数入口函数
exports.main = async (event, context) => {
  //_id: _.exists(true)
  userInfo.where({
    _id: _.exists(true)
  }).update({
    data: {
      askTime: 5
      // isCheckSystemMsg: false
    }
  }).then((res) => {
    return res
  }).catch((err) => {
    return err
  })

  question.where({
    _openid: 'oJ-6m5axZUm5_3cDLwmUjyA0Jwvs',
    nickName: _.neq('noritake')
  }).update({
    data: {
      _openid: '0oJ-6m5axZUm5_3cDLwmUjyA0Jwvs'
    }
  })

  commentAgain.where({
    postOpenId: 'oJ-6m5axZUm5_3cDLwmUjyA0Jwvs',
    postNickName: _.neq('noritake')
  }).update({
    data: {
      postOpenId: '0oJ-6m5axZUm5_3cDLwmUjyA0Jwvs'
    }
  })

  comment.where({
    _openid: 'oJ-6m5axZUm5_3cDLwmUjyA0Jwvs',
    nickname: _.neq('noritake')
  }).update({
    data: {
      _openid: '0oJ-6m5axZUm5_3cDLwmUjyA0Jwvs'
    }
  })
}