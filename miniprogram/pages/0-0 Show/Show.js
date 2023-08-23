const app = getApp()
const db = wx.cloud.database()
const $ = db.command.aggregate
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
    activeTab: 1,
    followingPostList: [],
    newList: [],
    hotList: [],
    tabs: [
      { id: 0, name: '关注' },
      { id: 1, name: '最新' },
      { id: 2, name: '热门' },
    ],
    isLogin: false,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    color1: '#DF3E3E',
    color2: '#FE721D',
    color3: '#F5AD01',

    isManager: false,

    reachBottom: false,
  },
  QuestionMessageData: { QuestionMessageNum: 0 },
  CommentMessageData: { CommentMessageNum: 0 },


  getHotData() {
    var now = new Date().getTime();
    question
      .aggregate()
      .match({
        tag: _.neq('AI')
      })
      .project({
        _id: 1,
        title: 1,
        image: 1,
        comments: 1,
        // time: 1,

        totalScores: $.divide([
          $.sum([
            $.multiply([$.log10(
              $.sum(['$watched', $.size('$watcher')])
            ), 1]),
            $.multiply(['$collectNum', 8000]),
            $.multiply(['$commentNum', 16000]),
            $.multiply(['$postLikeNum', 32000]),
          ]),
          $.pow([
            $.sum(
              $.divide([$.subtract([now, '$time']), 2]),
              $.divide([$.subtract([now, '$answerTime']), 2]),
              1
            ),
            1.5
          ])
        ])
      })
      .sort({
        totalScores: -1
      })
      .end()
      .then((res) => {
        //console.log(res.list)
        this.setData({
          hotList: res.list
        })
        this.myData.hotList = res.list
      })
  },

  goToBoardDetail: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index
  },

  // getBoardList: function () {
  //   userInfo.doc('0bc57b0d63fe176e000f9eb35c23eec4').get().then((res) => {
  //     const { boardList } = res.data
  //     //console.log(boardList)
  //     this.setData({
  //       boardList
  //     })
  //   })
  // },

  goToAI: function () {
    wx.navigateTo({
      url: '../../packageShow/page/1-5 AI/AI',
    })
  },

  goToTop: function () {
    this.setData({
      scrollTop: 0
    })
  },

  alwaysTop: function () {
    //console.log('置顶')
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
    //console.log('热门')
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
        // //console.log(res.data)
        wx.hideLoading();
        this.setData({
          newList: res.data,
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
          newList: res.data,
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
        //console.log(err)
      })
  },
  sort: function () {
    let word0 = ['✓ “最新发帖”优先', '“最新回应”优先'];
    let word1 = ['“最新发帖”优先', '✓ “最新回应”优先'];
    const { sortWord } = this.data
    if (sortWord == '最新发帖') this.showActionSheetChange(word0)
    else this.showActionSheetChange(word1)
  },

  goToAsk: function () {
    const { isLogin } = this.data
    if (isLogin) {
      wx.navigateTo({
        url: '../../packageShow/page/1-2 Ask/Ask',
      })
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
    }

  },
  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    if (app.globalData.questionId == '') return;
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
        //console.log('成功获取OpenID：', res.result.OPENID)
        app.globalData.openId = res.result.OPENID
        app.globalData.otherOpenId = res.result.OPENID
        commentAgain.where({
          postOpenId: '{openid}',
          _openid: _.neq(app.globalData.openId),
          isWatched: false
        }).count().then(res => {
          resolve()
          this.CommentMessageData = { CommentMessageNum: res.total }
        })
      }).catch(() => {
        //console.log('获取openid失败')
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
          //console.log(err)
        })
      }
    })
  },
  getCurrentMessageNum_withOpenid: function () {
    Promise.all([
      this.getCommentMessage_withOpenid(),
      this.getQuestionMessage()
    ]).then(() => {
      //console.log('问题回应数', this.QuestionMessageData.QuestionMessageNum)
      //console.log('评论回应数', this.CommentMessageData.CommentMessageNum)
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
          //console.log(err)
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
          app.globalData.isLogin = true
          app.globalData.isManager = res.data[0].isManager
          app.globalData.isAuthentic = res.data[0].isAuthentic
          app.globalData.idTitle = res.data[0].idTitle
          app.globalData.modifyNum = res.data[0].modifyNum
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

          app.globalData.nickName = res.data[0].nickName
          app.globalData.avatarUrl = res.data[0].avatarUrl
          //console.log('成功获取昵称、头像：', app.globalData.nickName, app.globalData.avatarUrl)
        }
      })
      .catch(() => {
        //console.log('用户未登录')
        this.setData({
          nickName: '',
          avatarUrl: '',
          isLogin: false,
        })
        app.globalData.isLogin = false,
          wx.showToast({
            icon: 'none',
            title: '游客模式',
          })
      })
  },
  getOtherData: function () {
    this.getCurrentMessageNum_withOpenid()
    //this.getNicknameandImage()
  },

  myData: {
    followingPostList: []
  },
  getFollowing() {
    userInfo.where({
      _openid: '{openid}'
    }).get().then(res => {
      const { following } = res.data[0];
      const followingOpenIDs = following.map(user => user.openid);
      question.where({
        _openid: _.in(followingOpenIDs),
        unknown: false,
        tag: _.neq('AI')
      }).orderBy('time', 'desc').get().then(res => {
        //console.log(res)
        this.setData({
          followingPostList: res.data
        })
        // this.myData.followingPostList = res.data
      })

    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });

    //记得及时注释！！！
    // wx.cloud.callFunction({
    //   name: 'update',
    // }).catch((err)=>{
    //   //console.log(err)
    // })
    // //this.getBoardList()
    this.getFollowing()
    this.getHotData()
    this.getNicknameandImage()
    this.getNewData()
    this.getOtherData()

    //console.log('onLoad')
    const { id } = options
    if (id != undefined) {
      if (id === 'gpt') {
        wx.navigateTo({
          url: '../../packageShow/page/1-5 AI/AI',
        })
      }
      else if (id === 'top') {
        wx.navigateTo({
          url: '../../packageMy/pages/3-5 SystemMsg/SystemMsg',
        })
      }
      else {
        app.globalData.questionId = id
        let d = new Date().getTime();
        //console.log(d)
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */

  updateList(index, list) {
    app.globalData.isClick = false
    if (app.globalData.questionDelete) {
      list.splice(index, 1)
    }
    else {
      list[index] = app.globalData.tmpPost
    }
    return list

  },

  onShow: function () {
    const { newList, followingPostList, activeTab } = this.data
    const { questionIndex } = app.globalData

    app.globalData.otherOpenId = app.globalData.openId
    if (app.globalData.isCheckSystemMsg && this.data.topWord != '置顶：使用帮助') {
      this.setData({
        topWord: '置顶：使用帮助'
      })
    }
    this.getCurrentMessageNum()
    if (app.globalData.isModify) {
      this.getNicknameandImage()
      app.globalData.isModify = false
    }

    var list
    if (app.globalData.isClick && questionIndex != -1) {
      if (activeTab == 0) {
        list = this.updateList(questionIndex, followingPostList)
        if (list) {
          this.setData({
            followingPostList: list
          })
        }
      } else if (activeTab == 1) {
        if (newList) {
          list = this.updateList(questionIndex, newList)
          if (list) {
            this.setData({
              newList: list
            })
          }
        }
      }
    }

    if (app.globalData.isAsk) {
      this.setData({
        activeTab: 1,
        scrollTop: 0
      })
      this.getNewData()
    }
    app.globalData.questionDelete = false
    app.globalData.isAsk = false
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.isClick = false
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  swiperChange: function (e) {
    const index = e.detail.index
    //console.log(e)
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })

  },
  test: function () {
    this.setData({ refresherTriggered: false })
  },
  refresh: function () {
    const { activeTab } = this.data
    this.getCurrentMessageNum()
    if (activeTab == 0) {
      this.getFollowing()
    }
    else if (activeTab == 1) {
      this.getNewData()
    } else if (activeTab == 2) {
      this.getHotData()
    }
    setTimeout(this.test, 500)
  },
  // onPullDownRefresh: function () {
  //   this.getNewData()
  //   this.getCurrentMessageNum()
  //   //this.getBoardList()
  //   setTimeout(function () { wx.stopPullDownRefresh() }, 500)
  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  reachBottom: function () {
    const { activeTab, newList } = this.data
    if (activeTab == 1) {
      this.setData({
        reachBottom: true
      })
      console.log(newList)
      const showNum = this.data.newList.length

      question.where({
        tag: _.neq('AI'),
        time: _.lte(newList[0].time)
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            tag: _.neq('AI'),
            time: _.lt(newList[showNum - 1].time)
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = newList
            this.setData({
              newList: old_data.concat(new_data),
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
      title: '微校Smile - 首页',
      path: 'pages/0-0 Show/Show'
    }
  },
  onShareTimeline: function () {
    return {
      title: '微校Smile - 首页',
    }
  }
})