// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')

function deleteCommentCloudImage(list) {
  for (var i = 0; i < list.length; i++) {
    for (var j = 0; j < list[i].image_upload.length; j++) {
      let id = list[i].image_upload[j]
      wx.cloud.deleteFile({
        fileList: [id],
        success: res => {
          console.log('成功删除', res)
        },
        fail: err => {
          console.error(err)
        }
      })
    }
  }
}

function deleteQuestionCloudImage(list) {
  for (var i = 0; i < list[0].image.length; i++) {
    let id = list[0].image[i]
    wx.cloud.deleteFile({
      fileList: [id],
      success: res => {
        console.log('成功删除', res)
      },
      fail: err => {
        console.error(err)
      }
    })
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { result, trace_id, FromUserName } = event
  const { suggest } = result

  if (suggest != 'pass') {
    question.where({
      _openid: FromUserName,
      traceId: trace_id
    }).get()
      .then((res) => {
        deleteQuestionCloudImage(res.data)
        const { _id } = res.data[0]
        Promise.all([
          comment.where({
            questionId: _id
          }).get().then(res => {
            deleteCommentCloudImage(res.data)
          }),
          commentAgain.where({
            questionId: _id
          }).get().then(res => {
            deleteCommentCloudImage(res.data)
          })
        ])
          .then(() => {
            Promise.all([
              question.where({
                _id: _id
              }).remove(),
              comment.where({
                questionId: _id
              }).remove(),
              commentAgain.where({
                questionId: _id
              }).remove()
            ])
              .then(() => {
                return result
              })
              .catch((err) => {
                return err
              })
          })
          .catch((err) => {
            return err
          })
      })
      .catch((err) => {
        return err
      })

    comment.where({
      _openid: FromUserName,
      traceId: trace_id
    }).get()
      .then((res) => {
        deleteCommentCloudImage(res.data)
        const { _id } = res.data[0]

        Promise.all([
          commentAgain.where({
            commentId: _id
          }).get().then(res => {
            deleteCommentCloudImage(res.data)
          }),
          comment.doc(_id).get().then((res) => {
            question.doc(res.data[0].questionId).update({
              data: {
                commentNum: _.inc(-(res.data.commenter.length + 1)),
                commenter
              }
            })
          })
        ])
          .then(() => {
            Promise.all([
              comment.doc(_id).remove(),
              commentAgain.where({
                commentId: _id
              }).remove()
            ])
              .then(() => {
                return result
              })
              .catch((err) => {
                return err
              })
          })
          .catch((err) => {
            return err
          })
      })
      .catch((err) => {
        return err
      })

    commentAgain.where({
      _openid: FromUserName,
      traceId: trace_id
    }).get()
      .then((res) => {
        const { questionId, commentId } = res.data[0]
        comment.doc(commentId).update({
          data: {
            commentNum: _.inc(-1)
          }
        })
          .then(() => {
            question.doc(questionId).update({
              data: {
                commentNum: _.inc(-1)
              }
            }).then(() => {
              commentAgain.where({
                traceId: trace_id
              }).remove()
                .then(() => {
                  return result
                })
                .catch((err) => {
                  return err
                })
            })
              .catch((err) => {
                return err
              })
          }).catch((err) => {
            return err
          })
      })
      .catch((err) => {
        return err
      })
  } else {
    return {
      result
    }
  }


}