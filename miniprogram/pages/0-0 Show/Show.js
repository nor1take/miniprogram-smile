const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const commentAgain = db.collection('commentAgain')
const userInfo = db.collection('userInfo')

Array.prototype.getMessageNum = function () {
  var i = 0;
  var messageNum = 0
  for (; i < this.length; i++) {
    messageNum += this[i].message
  }
  return messageNum
}

Page({
  /**
   * 页面的初始数据
   */
  options: {
    pureDataPattern: /^_/
  },
  data: {
    isLogin: false,
    sortWord: '最新发帖',

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    isManager: false,

    reachBottom: false,

    questionList: [
      { id: 0, title: '', body: '', commentNum: 0, watched: 0 },
      { id: 1, title: '', body: '', commentNum: 0, watched: 0 },
      { id: 2, title: '', body: '', commentNum: 0, watched: 0 },
      { id: 3, title: '', body: '', commentNum: 0, watched: 0 },
      { id: 4, title: '', body: '', commentNum: 0, watched: 0 },
      { id: 5, title: '', body: '', commentNum: 0, watched: 0 },
    ],

    topWord: '',
  },
  QuestionMessageData: { QuestionMessageNum: 0 },
  CommentMessageData: { CommentMessageNum: 0 },

  goToAI: function () {
    wx.navigateTo({
      url: '../../packageShow/page/1-5 AI/AI',
    })
  },

  goToTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 1000
    }).then((res) => {
      console.log(res)
    })
  },

  alwaysTop: function () {
    console.log('置顶')
    if (app.globalData.isCheckSystemMsg) {
      wx.navigateTo({
        url: '../../packageMy/pages/0-1 TopPost/TopPost',
      })
    } else {
      wx.navigateTo({
        url: '../../packageMy/pages/3-5 SystemMsg/SystemMsg',
      })
    }
  },
  hot: function () {
    console.log('热门')
    wx.navigateTo({
      url: '../../packageShow/page/1-4 Hot/Hot',
    })
  },
  getNewData: function () {
    question.
      where({
        tag: _.neq('AI')
      })
      .orderBy('time', 'desc').get()
      .then((res) => {
        // console.log(res.data)
        this.setData({
          questionList: res.data,
        })
      })
  },
  getNewAnswer: function () {
    question.where({
      tag: _.neq('AI'),
      commenter: _.neq([])
    }).orderBy('answerTime', 'desc').get()
      .then((res) => {
        this.setData({
          questionList: res.data,
        })
      })
  },
  showActionSheetChange: function (word) {
    wx.showActionSheet({
      itemList: word,
      itemColor: '#0C88B5',
    })
      .then((res) => {
        var d = new Date();
        if (res.tapIndex) {
          wx.showToast({
            title: '“最新回应”优先',
            icon: 'none',
            duration: 1500
          })
          this.getNewAnswer()
          this.setData({
            sortWord: '最新回应',
          })
        }
        else {
          wx.showToast({
            title: '“最新发帖”优先',
            icon: 'none',
            duration: 1500
          })
          this.getNewData()
          this.setData({
            sortWord: '最新发帖'
          })

        }
      })
      .catch((err) => {
        console.log(err)
      })
  },
  sort: function () {
    let word0 = ['✓ “最新发帖”优先', '“最新回应”优先'];
    let word1 = ['“最新发帖”优先', '✓ “最新回应”优先'];
    const { sortWord } = this.data
    if (sortWord == '最新发帖') this.showActionSheetChange(word0)
    else this.showActionSheetChange(word1)
  },

  Ask: function () {
    wx.navigateTo({
      url: '../../packageShow/page/1-2 Ask/Ask',
    })
  },
  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index

    wx.navigateTo({
      url: '../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1),
        watcher: _.addToSet(app.globalData.openId),
        tmp: _.addToSet(app.globalData.openId)
      }
    })
  },

  getData: function () {
    var d = new Date();
    if (this.data.sortWord == "最新发帖") this.getNewData()
    else this.getNewAnswer()
    this.setData({
      top: app.globalData.top,
      left: app.globalData.left,
      right: app.globalData.right,
      bottom: app.globalData.bottom,
    })
  },
  getCommentMessage: function () {
    return new Promise((resolve) => {
      commentAgain.where({
        postOpenId: '{openid}',
        _openid: _.neq(app.globalData.openId),
        isWatched: false
      }).count().then(res => {
        resolve()
        this.CommentMessageData = { CommentMessageNum: res.total }
      })
    })
  },
  getCommentMessage_withOpenid: function () {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'getOpenId',
      }).then(res => {
        console.log('成功获取OpenID：', res.result.OPENID)
        app.globalData.openId = res.result.OPENID
        commentAgain.where({
          postOpenId: '{openid}',
          _openid: _.neq(app.globalData.openId),
          isWatched: false
        }).count().then(res => {
          resolve()
          this.CommentMessageData = { CommentMessageNum: res.total }
        })
      }).catch(() => {
        console.log('获取openid失败')
      })
    })
  },
  getQuestionMessage: function () {
    return new Promise((resolve) => {
      question.where({
        _openid: '{openid}'
      }).orderBy('answerTime', 'desc').get().then((res) => {
        resolve()
        this.QuestionMessageData = { QuestionMessageNum: res.data.getMessageNum() }
      })
    })
  },

  getCurrentMessageNum: function () {
    Promise.all([
      this.getCommentMessage(),
      this.getQuestionMessage()
    ]).then(() => {
      app.globalData.messageNum = this.QuestionMessageData.QuestionMessageNum + this.CommentMessageData.CommentMessageNum
      if (app.globalData.messageNum > 0) {
        wx.setTabBarBadge({
          index: 2,
          text: app.globalData.messageNum.toString()
        })
      }
      else {
        wx.removeTabBarBadge({
          index: 2,
        }).catch(err => {
          console.log(err)
        })
      }
    })
  },
  getCurrentMessageNum_withOpenid: function () {
    Promise.all([
      this.getCommentMessage_withOpenid(),
      this.getQuestionMessage()
    ]).then(() => {
      console.log('问题回应数', this.QuestionMessageData.QuestionMessageNum)
      console.log('评论回应数', this.CommentMessageData.CommentMessageNum)
      app.globalData.messageNum = this.QuestionMessageData.QuestionMessageNum + this.CommentMessageData.CommentMessageNum
      if (app.globalData.messageNum > 0) {
        wx.setTabBarBadge({
          index: 2,
          text: app.globalData.messageNum.toString()
        })
      }
      else {
        wx.removeTabBarBadge({
          index: 2,
        }).catch(err => {
          console.log(err)
        })
      }
    })
  },
  getNicknameandImage: function () {
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data[0].isForbidden) {
          wx.navigateTo({
            url: '../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl,
            isLogin: true,
            isManager: res.data[0].isManager,
            isAuthentic: res.data[0].isAuthentic,
            idTitle: res.data[0].idTitle
          })
          app.globalData.isLogin = true,
            app.globalData.isManager = res.data[0].isManager,
            app.globalData.isAuthentic = res.data[0].isAuthentic,
            app.globalData.idTitle = res.data[0].idTitle,
            app.globalData.modifyNum = res.data[0].modifyNum,
            app.globalData.isCheckSystemMsg = res.data[0].isCheckSystemMsg
          if (res.data[0].isCheckSystemMsg) {
            this.setData({
              topWord: '置顶：使用帮助'
            })
          } else {
            this.setData({
              topWord: '有新的系统通知!!!'
            })
          }

          app.globalData.nickName = res.data[0].nickName,
            app.globalData.avatarUrl = res.data[0].avatarUrl,
            console.log('成功获取昵称、头像：', app.globalData.nickName, app.globalData.avatarUrl)
        }
      })
      .catch(() => {
        console.log('用户未登录')
        this.setData({
          nickName: '',
          avatarUrl: '',
          isLogin: false,
        })
        app.globalData.isLogin = false,
          wx.showToast({
            icon: 'none',
            title: '游客模式。左上角登录后体验 ‘发帖’ ‘评论’ 功能',
            duration: 3500,
          })
      })
  },
  getOtherData: function () {
    this.getCurrentMessageNum_withOpenid()
    //this.getNicknameandImage()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    ////记得及时注释！！！
    // wx.cloud.callFunction({
    //   name: 'update',
    // })

    // wx.cloud.callFunction({
    //   name: 'chatglm',
    //   data: {
    //     input: 'hello'
    //   }
    // }).then((res) => {
    //   console.log(res)
    // }).catch((err) => {
    //   console.log(err)
    // })

    console.log('onLoad')
    const { id } = options
    if (id != undefined) {
      if (id === 'gpt') {
        wx.navigateTo({
          url: '../../packageShow/page/1-5 AI/AI',
        })
      } else {
        app.globalData.questionId = id
        let d = new Date().getTime();
        console.log(d)
        setTimeout(
          function () {
            question.doc(id).update({
              data: {
                // watched: _.inc(1),
                watcher: _.addToSet('guest' + d),
              }
            })
            wx.navigateTo({
              url: '../../packageShow/page/1-1 Detail/Detail',
            })
          }
          , 500)
      }
    }
    this.getNicknameandImage()
    this.getData()
    this.getOtherData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(app.globalData)
    if (app.globalData.isCheckSystemMsg && this.data.topWord != '置顶：使用帮助') {
      this.setData({
        topWord: '置顶：使用帮助'
      })
    }
    var d = new Date().getTime()
    this.startTimeData = { startTime: d }


    if (app.globalData.stayTime / 1000 / 10 > 1) {
      console.log('getCurrentMessageNum')
      app.globalData.stayTime = 0
      this.getCurrentMessageNum()
    }

    if (app.globalData.isModify) {
      this.getNicknameandImage()
      app.globalData.isModify = false
    }

    const { questionList } = this.data
    const { questionIndex } = app.globalData
    if (app.globalData.isClick && questionIndex != -1) {
      app.globalData.isClick = false
      if (app.globalData.questionDelete) {
        questionList.splice(questionIndex, 1)
        this.setData({
          questionList
        })
      }
      else {
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watcher = app.globalData.questionWatcher,
          questionList[questionIndex].watched = app.globalData.questionWatched,
          questionList[questionIndex].collectNum = app.globalData.questionCollect,
          questionList[questionIndex].postLikeNum = app.globalData.questionLikeNum,
          this.setData({
            questionList
          })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
    else if (app.globalData.isAsk) {
      this.getData()
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 1000
      })
    }
    app.globalData.questionDelete = false
    app.globalData.isAsk = false
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    var stayTime = new Date().getTime() - this.startTimeData.startTime
    app.globalData.stayTime += stayTime
    app.globalData.isClick = false
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData()
    this.getCurrentMessageNum()
    setTimeout(function () { wx.stopPullDownRefresh() }, 500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      reachBottom: true
    })
    console.log('触底')
    const questionList = this.data.questionList
    const showNum = questionList.length
    if (this.data.sortWord == "最新发帖") {
      question.where({
        tag: _.neq('AI'),
        time: _.lte(questionList[0].time)
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            tag: _.neq('AI'),
            time: _.lt(questionList[showNum - 1].time)
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              questionList: old_data.concat(new_data),
            })
          })
        }
        else {
          this.setData({
            isBottom: true
          })
        }
      })
    }
    else {
      question.where({
        tag: _.neq('AI'),
        answerTime: _.lte(questionList[0].answerTime),
        commenter: _.neq([])
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            tag: _.neq('AI'),
            answerTime: _.lt(questionList[showNum - 1].answerTime),
            commenter: _.neq([]),
          }).orderBy('answerTime', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              questionList: old_data.concat(new_data),
            })
          })
        }
        else {
          this.setData({
            isBottom: true
          })
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '微校Smile - 实时',
      path: 'pages/0-0 Show/Show'
    }
  },
  onShareTimeline: function () {
    return {
      title: '微校Smile - 实时',
    }
  }
})