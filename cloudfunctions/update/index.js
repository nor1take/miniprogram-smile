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

  // const comments = await comment
  //   .where({ _id: _.exists(true) })
  //   .get();

  // for (const comment of comments.data) {
  //   const { questionId, body, nickname, _openid } = comment;

  //   try {
  //     // 查询问题数据库中的对应问题
  //     const questionList = await question.doc(questionId).get();

  //     if (questionList.data) {
  //       // 将评论信息添加到问题的commenter字段中
  //       const updatedComments = questionList.data.commenter || [];
  //       updatedComments.push({
  //         openId: _openid,
  //         commentBody: body,
  //         nickName: nickname
  //       });

  //       // 更新问题数据库
  //       await question.doc(questionId).update({
  //         data: {
  //           commenter: updatedComments
  //         }
  //       });

  //       console.log()
  //     } else {

  //     }
  //   } catch (error) {

  //   }
  // }

  userInfo.where({
    _id: _.exists(true)
  }).update({
    data: {
      askTime: 100
      // isCheckSystemMsg: false
    }
  }).then((res) => {
    return res
  }).catch((err) => {
    return err
  })

  // question.where({
  //   _openid: 'oJ-6m5axZUm5_3cDLwmUjyA0Jwvs',
  //   nickName: _.neq('noritake')
  // }).update({
  //   data: {
  //     _openid: '0oJ-6m5axZUm5_3cDLwmUjyA0Jwvs'
  //   }
  // })

  // commentAgain.where({
  //   postOpenId: 'oJ-6m5axZUm5_3cDLwmUjyA0Jwvs',
  //   postNickName: _.neq('noritake')
  // }).update({
  //   data: {
  //     postOpenId: '0oJ-6m5axZUm5_3cDLwmUjyA0Jwvs'
  //   }
  // })

  // comment.where({
  //   _openid: 'oJ-6m5axZUm5_3cDLwmUjyA0Jwvs',
  //   nickname: _.neq('noritake')
  // }).update({
  //   data: {
  //     _openid: '0oJ-6m5axZUm5_3cDLwmUjyA0Jwvs'
  //   }
  // })
}