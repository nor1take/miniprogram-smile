const app = getApp()

const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
const traceId = db.collection('traceId')
const userInfo = db.collection('userInfo')
const deleteRecord = db.collection('deleteRecord')

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

Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
    keyboardHeight: 32,
    inputValue: '',

    color1: '#DF3E3E',
    color2: '#FE721D',
    color3: '#F5AD01',

    isTesting: false,
    testMsg: ''
  },
  commentData: { commentContent: '' },

  postLikeAdd: function (e) {
    const { index } = e.currentTarget.dataset
    const { id } = e.currentTarget
    // console.log(app.globalData.openId)
    // console.log(index, id)
    if (app.globalData.openId == undefined) {
      wx.showToast({
        title: '登录后操作。点击左上角←返回主界面',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '赞 +1',
        icon: 'none'
      })
      let { newPostList } = this.data
      let { postLikeNum } = newPostList[index]

      newPostList[index].liker.push(app.globalData.openId)
      postLikeNum++;
      this.setData({
        newPostList
      })
      question.doc(id).update({
        data: {
          liker: _.addToSet(app.globalData.openId),
          postLikeNum: postLikeNum
        }
      })
    }
  },
  postLikeCancel: function (e) {
    const { index } = e.currentTarget.dataset
    const { id } = e.currentTarget
    // console.log(app.globalData.openId)
    // console.log(index, id)
    let { newPostList } = this.data
    let { postLikeNum } = newPostList[index]

    // questionList[0].collector.push(app.globalData.openId)
    let likerIndex = newPostList[0].liker.indexOf(app.globalData.openId)
    if (likerIndex != -1) {
      newPostList[index].liker.splice(likerIndex, 1)
      postLikeNum--;
    }

    this.setData({
      newPostList,
      postLikeNum
    })
    question.doc(id).update({
      data: {
        liker: _.pull(app.globalData.openId),
        postLikeNum: postLikeNum
      }
    })
  },

  likeCancel: function (e) {
    const { index } = e.currentTarget.dataset
    const { postid } = e.currentTarget.dataset
    const { id } = e.currentTarget

    let { newPostList } = this.data
    let likerIndex = newPostList[index].commenter[0].liker.indexOf(app.globalData.openId)
    if (likerIndex != -1)
      newPostList[index].commenter[0].liker.splice(likerIndex, 1)
    let likerNum = newPostList[index].commenter[0].liker.length
    this.setData({
      newPostList
    })

    question.doc(postid).update({
      data: {
        commenter: newPostList[index].commenter
      }
    })

    comment.doc(id).update({
      data: {
        liker: _.pull(app.globalData.openId),
        likerNum: likerNum
      }
    }).then(res => {
      console.log('like Cancel', res)
    }).catch(err => { console.log(err) })

  },
  likeAdd: function (e) {
    const { index } = e.currentTarget.dataset
    const { postid } = e.currentTarget.dataset
    const { id } = e.currentTarget

    let { newPostList } = this.data
    newPostList[index].commenter[0].liker.push(app.globalData.openId)
    let likerNum = newPostList[index].commenter[0].liker.length
    this.setData({
      newPostList
    })

    question.doc(postid).update({
      data: {
        commenter: newPostList[index].commenter
      }
    })
    comment.doc(id).update({
      data: {
        liker: _.addToSet(app.globalData.openId),
        likerNum: likerNum,
      }
    }).then(res => {
      console.log('like Add', res)
    }).catch(err => { console.log(err) })
  },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1),
        watcher: _.addToSet(app.globalData.openId),
        tmp: _.addToSet(app.globalData.openId)
      }
    })
  },

  loseFocus: function () {
    console.log('失去焦点')
    this.setData({
      keyboardHeight: 32,
    })
  },
  focus: function (e) {
    console.log(e.detail.height)
    this.setData({
      keyboardHeight: e.detail.height
    })
  },
  input: function (e) {
    const { value } = e.detail
    this.commentData = {
      commentContent: value
    }
    console.log(this.commentData.commentContent)
  },

  send: function () {
    const prompt = this.commentData.commentContent
    if (prompt === '') return;
    let that = this

    wx.showLoading({
      title: '审核中',
      mask: true
    })

    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        let { askTime } = res.data[0]
        askTime = askTime - 1
        if (askTime < 0) {
          wx.showToast({
            title: '提问次数已用尽！请前往“意见反馈”联系开发者',
            icon: 'none',
            duration: 5000
          })
          return;
        }

        const userInfoId = res.data[0]._id
        if (res.data[0].isForbidden) {
          wx.hideLoading()
          wx.navigateTo({
            url: '../../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          /**
           * 一、文字审核
           */

          wx.cloud.callFunction({
            name: 'checkContent',
            data: {
              txt: prompt,
              scene: 3 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
            }
          }).then((res) => {
            console.log(res)
            const { label } = res.result.msgR.result
            const { suggest } = res.result.msgR.result
            if (suggest === 'risky') {
              wx.hideLoading()
              wx.showToast({
                title: '危险：包含' + matchLabel(label) + '信息！',
                icon: 'none'
              })
            } else if (suggest === 'review') {
              wx.hideLoading()
              wx.showToast({
                title: '可能包含' + matchLabel(label) + '信息，建议调整相关表述',
                icon: 'none'
              })
            } else {
              userInfo.doc(userInfoId).update({
                data: {
                  askTime: askTime
                }
              })
              wx.showToast({
                title: '还有 ' + askTime + ' 次提问机会',
                icon: 'none',
                duration: 5000
              })
              that.setData({
                inputValue: ''
              })
              app.globalData.isAsk = true
              var d = new Date().getTime();

              question.add({
                data: {
                  //时间
                  answerTime: 0,
                  time: d,
                  image: [],

                  unknown: false,
                  nickName: app.globalData.nickName,
                  avatarUrl: app.globalData.avatarUrl,

                  title: prompt,
                  body: '',

                  tagId: 1,
                  tag: 'AI',

                  watched: 1,
                  watcher: [],

                  commentNum: 0,
                  commenter: [{
                    nickName: 'AI',
                    completion: '[正在生成回答中…预计需要 10-15s]',
                    commentId: '',
                    liker: []
                  }],
                  history: [prompt],
                  message: 0,

                  collector: [],
                  collectNum: 0,

                  liker: [],
                  postLikeNum: 0,

                  warner: [],
                  warnerDetail: [],

                  solved: false,

                  isAuthentic: app.globalData.isAuthentic,
                  idTitle: app.globalData.idTitle
                },
              }).then((res) => {
                const { _id } = res
                wx.hideLoading()
                that.getNewData()
                wx.pageScrollTo({
                  scrollTop: that.data.screenHeight,
                  duration: 1000
                }).then((res) => {
                  console.log(res)
                })
                wx.cloud.callFunction({
                  name: 'chatglm',
                  data: {
                    input: prompt,
                    history: [],
                  }
                }).then((res) => {
                  console.log(res.result.completion)
                  that.gptsentComment(res.result.completion, _id)
                }).catch((err) => {
                  console.log(err)
                })
              })
            }
          })
        }
      })
      .catch(() => {
        wx.showToast({
          title: '请先登录',
          icon: 'error'
        })
      })
  },

  //AI内测使用：审核 completion
  gptsentComment: function (completion, postId) {
    let that = this
    wx.cloud.callFunction({
      name: 'checkContent',
      data: {
        txt: completion,
        scene: 2 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
      },
      success(res) {
        console.log(res)
        if (res.result.msgR) {
          const { label } = res.result.msgR.result
          const { suggest } = res.result.msgR.result
          if (suggest === 'risky') {
            that.sendCompletion('[危险：包含' + matchLabel(label) + '信息！]：回答不予显示', postId)
          } else if (suggest === 'review') {
            console.log('可能包含' + matchLabel(label) + '信息')
            that.sendCompletion('[可能包含' + matchLabel(label) + '信息]：' + completion, postId)
          } else {
            that.sendCompletion(completion, postId)
          }
        } else {
          that.sendCompletion(completion, postId)
        }
      },
      fail(err) {
        console.log('checkContent云函数调用失败', err)
      }
    })
  },

  //AI内测使用：发布 completion
  sendCompletion: function (completion, postId) {
    let that = this
    var d = new Date().getTime()

    question.doc(postId).get().then(res => {
      const { title } = res.data
      const posterId = res.data._openid
      // wx.cloud.callFunction({
      //   name: 'sendMsg',
      //   data: {
      //     receiver: posterId,
      //     questionId: postId,
      //     sender: 'AI',
      //     commentBody: completion,
      //     postTitle: title
      //   }
      // })
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
          nickname: 'AI',
          image: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/643e9b5d-5bb3223d-55291b27',

          commenter: [],
          liker: [],
          likerNum: 0,
          image_upload: [],

          isAuthentic: true,
          idTitle: 'ChatGLM_130B',

          warner: [],
          warnerDetail: [],
        },
      }).then((res) => {
        question.doc(postId).update({
          data: {
            answerTime: d,
            commentNum: _.inc(1),
            message: _.inc(1),

            commentNum: _.inc(1),
            commenter: [{
              nickName: 'AI',
              completion,
              commentId: res._id,
              liker: []
            }],
            history: _.push(completion)
          }
        }).then(() => {
          wx.showToast({
            title: '回答已生成',
            icon: 'success',
            duration: 3000
          })
          wx.pageScrollTo({
            scrollTop: that.data.screenHeight,
            duration: 1000
          }).then((res) => {
            console.log(res)
          })
          that.getNewData()
        })
      })
    })
  },

  getNewData: function () {
    question.where({
      tag: 'AI'
    }).orderBy('time', 'desc').get()
      .then((res) => {
        // console.log(res.data)
        this.setData({
          newPostList: res.data,
        })
      })
  },

  getHotPost: function () {
    question.where({
      tag: 'AI'
    })
      .orderBy('postLikeNum', 'desc')
      .orderBy('time', 'desc')
      .limit(3).get()
      .then((res) => {
        // console.log(res.data)
        this.setData({
          hotPostList: res.data,
          openId: app.globalData.openId
        })
      })
  },

  getHotComment: function () {
    comment.where({
      nickname: 'AI'
    })
      .orderBy('likerNum', 'desc')
      .orderBy('time', 'desc')
      .limit(3).get()
      .then((res) => {
        this.setData({
          hotCommentList: res.data,
        })
      })
  },

  isTesting: function () {
    userInfo.doc('0bc57b0d63fe176e000f9eb35c23eec4').get()
      .then(res => {
        console.log(res.data.isTesting)
        this.setData({
          isTesting: res.data.isTesting,
          testMsg: res.data.testMsg
        })
      })
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad(options) {
    this.isTesting()
    this.getNewData()
    this.getHotPost()
    this.getHotComment()
    const windowInfo = wx.getWindowInfo()
    this.setData({
      top: app.globalData.top,
      left: app.globalData.left,
      right: app.globalData.right,
      bottom: app.globalData.bottom,

      screenHeight: windowInfo.screenHeight
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    app.globalData.questionIndex = -1
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '微校Smile - AI',
      path: 'pages/0-0 Show/Show?id=' + 'gpt'
    }
  },
  onShareTimeline: function () {
    return {
      title: '微校Smile - AI'
    }
  }
})