const app = getApp()

const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
const traceId = db.collection('traceId')
const userInfo = db.collection('userInfo')
const deleteRecord = db.collection('deleteRecord')

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
    wx.requestSubscribeMessage({
      tmplIds: ['TV_8WCCiyJyxxSar0WTIwJjY_S4BxvAITzaRanOjXWQ'],
      complete(res1) {
        console.log(res1)
        wx.showLoading({
          title: '审核中',
          mask: true
        })
        that.setData({
          inputValue: ''
        })
        userInfo.where({
          _openid: '{openid}'
        }).get()
          .then((res) => {
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
                      tag: 'ChatGPT',

                      watched: 1,
                      watcher: [],

                      commentNum: 0,
                      commenter: [{
                        completion: '[正在生成回答中…请不要离开此界面，耐心等待1-2分钟。等待时间取决于你问题的长度和答案的长度。期间你可以浏览此页面其他用户的提问。]'
                      }],

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
                    that.gptsentComment(prompt, _id)
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
      }
    })
  },

  //ChatGPT内测使用：审核 completion
  gptsentComment: function (prompt, postId) {
    let that = this
    wx.request({
      url: 'https://n58770595y.zicp.fun/gpt',
      data: {
        prompt: prompt
      },
      timeout: 60000000,
      success(res) {
        console.log(res.data)
        const completion = res.data
        wx.cloud.callFunction({
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
                that.sendCompletion('[危险：包含' + matchLabel(label) + '信息！]', postId)
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
          fail(_res) {
            console.log('checkContent云函数调用失败', _res)
          }
        })
      },
      fail(err) {
        console.log(err.data)
      }
    })
  },

  //ChatGPT内测使用：发布 completion
  sendCompletion: function (completion, postId) {
    let that = this
    var d = new Date().getTime()

    question.doc(postId).get().then(res => {
      console.log(res)
      //console.log(res[0].data)
      console.log(res.data)
      console.log(res.data.title)
      const { title } = res.data
      const posterId = res.data._openid
      wx.cloud.callFunction({
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
      }).then((res) => {
        question.doc(postId).update({
          data: {
            commentNum: _.inc(1),
            commenter: [{
              nickName: 'ChatGPT',
              completion: completion,
              commentId: res._id,
              liker: []
            }]
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
      tag: 'ChatGPT'
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
      tag: 'ChatGPT'
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
      nickname: 'ChatGPT'
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
      title: '微校Smile - ChatGPT',
      path: 'pages/0-0 Show/Show?id=' + 'gpt'
    }
  },
  onShareTimeline: function () {
    return {
      title: '微校Smile - ChatGPT'
    }
  }
})