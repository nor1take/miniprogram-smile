// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
const traceId = db.collection('traceId')

const head = 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/'

function deleteImage(fileId) {
  cloud.deleteFile({
    fileList: [fileId],
    success: res => {
      return res
    },
    fail: err => {
      return err
    }
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { result, trace_id, CreateTime } = event
  const { suggest } = result

  const fileId = head + trace_id;

  if (suggest != 'pass') {
    traceId.add({
      data: {
        fileId,
        CreateTime
      }
    }).then(() => {
      question.where({
        image: fileId
      }).get()
        .then(() => {
          deleteImage(fileId);
        })
        .catch((err) => {
          return err
        })

      comment.where({
        image_upload: fileId
      }).get()
        .then(() => {
          deleteImage(fileId);
        })
        .catch((err) => {
          return err
        })

      commentAgain.where({
        image_upload: fileId
      }).get()
        .then(() => {
          deleteImage(fileId);
        })
        .catch((err) => {
          return err
        })
    })
  } else {
    return {
      suggest
    }
  }


}