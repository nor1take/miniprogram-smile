const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {
  const { receiver, questionId, sender, commentBody, postTitle } = event

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": receiver, //接收者（用户）的 openid
      "page": 'packageShow/page/1-1 Detail/Detail?id=' + questionId,
      "lang": 'zh_CN',
      "data": {
        "thing1": {
          "value": postTitle //文章标题
        },
        "thing5": {
          "value": sender //评论用户
        },
        "thing2": {
          "value": commentBody //评论内容
        },
      },
      "templateId": 'TV_8WCCiyJyxxSar0WTIwJjY_S4BxvAITzaRanOjXWQ',
    })
    return result
  } catch (err) {
    return err.errCode
  }
}