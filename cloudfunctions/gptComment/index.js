// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database();
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')

function matchLabel(labelNum) {
  switch (labelNum) {
    case 100:
      return '正常';
      break;
    case 10001:
      return '广告';
      break;
    case 20001:
      return '时政';
      break;
    case 20002:
      return '色情';
      break;
    case 20003:
      return '辱骂';
      break;
    case 20006:
      return '违法犯罪';
      break;
    case 20008:
      return '欺诈';
      break;
    case 20012:
      return '低俗';
      break;
    case 20013:
      return '版权';
      break;
    case 21000:
      return '其他';
      break;
  }
}

function gptsentComment(prompt, postId) {
  const rp = require('request-promise')
  const URL = 'https://n58770595y.zicp.fun/gpt'

  const options = {
    uri: URL,
    timeout: 60000, // 5 min
    qs: {
      prompt: prompt
    },
    json: true
  }

  rp(options)
    .then(res => {
      const completion = res
      cloud.callFunction({
        name: 'checkContent',
        data: {
          txt: completion,
          scene: 2 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
        },
        success(_res) {
          console.log(_res)
          if (_res.result.msgR) {
            const { label } = _res.result.msgR.result
            const { suggest } = _res.result.msgR.result
            if (suggest === 'risky') {
              sendCompletion('[危险：包含' + matchLabel(label) + '信息！]', postId)
            } else if (suggest === 'review') {
              console.log('可能包含' + matchLabel(label) + '信息')
              sendCompletion('[可能包含' + matchLabel(label) + '信息]：' + completion, postId)
            } else {
              sendCompletion(completion, postId)
            }
          } else {
            sendCompletion(completion, postId)
          }
        },
        fail(_res) {
          console.log('checkContent云函数调用失败', _res)
        }
      })
    }).catch(err => {
      console.log(err)
    })
}
//ChatGPT内测使用：发布 completion
function sendCompletion(completion, postId) {
  var d = new Date().getTime()
  question.doc(postId).update({ data: { commentNum: _.inc(1) } })
  question.doc(postId).get().then(res => {
    console.log(res)
    //console.log(res[0].data)
    console.log(res.data)
    console.log(res.data.title)
    const { title } = res.data
    const posterId = res.data._openid
    cloud.callFunction({
      name: 'sendMsg',
      data: {
        receiver: posterId,
        questionId: postId,
        sender: 'ChatGPT',
        commentBody: completion,
        postTitle: title
      }
    })
    comment.add({
      data: {
        //时间
        time: d,

        isUnknown: false,
        questionId: postId,
        questionTitle: title,
        posterId: posterId,

        body: completion,
        commentNum: 0,
        nickname: 'ChatGPT',
        image: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/oJ-6m5axZUm5_3cDLwmUjyA0Jwvs/avatar1680586472951',

        commenter: [],
        liker: [],
        likerNum: 0,
        image_upload: [],

        isAuthentic: true,
        idTitle: '内测版',

        warner: [],
        warnerDetail: [],
      },
    })
  })

}
// 云函数入口函数
exports.main = async (event, context) => {
  const { prompt, postId } = event
  gptsentComment(prompt, postId)
  return {
    prompt
  }
}