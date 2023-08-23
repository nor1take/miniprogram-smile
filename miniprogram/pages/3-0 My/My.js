// pages/Show/Show.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    tabs: [
      {
        id: 0,
        name: '帖子回应',
      },
      {
        id: 1,
        name: '评论回应',
      },
      {
        id: 2,
        name: '收到的赞',
      },
    ],
    activeTab: 0,

    x: 1000, y: 1000,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    reachBottom: false,
    top: app.globalData.top,
  },

  gotoDetail: function (e) {
    //console.log(e.currentTarget.id)
    app.globalData.questionId = e.currentTarget.id
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
    })
    wx.navigateTo({
      url: '../../packageShow/page/1-1 Detail/Detail',
    })
  },
  gotoDetail2: function (e) {
    //console.log(e.currentTarget.dataset.commentid)
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
    })
    app.globalData.questionId = e.currentTarget.id
    const { commentid } = e.currentTarget.dataset
    var isWatched;
    commentAgain.doc(commentid).get().then((res) => {
      isWatched = res.data.isWatched
      if (!isWatched) {
        commentAgain.doc(commentid).update({
          data: {
            isWatched: true
          }
        }).then(() => {
          app.globalData.messageNum--
          //console.log('成功')
        })
      }
      wx.navigateTo({
        url: '../../packageShow/page/1-1 Detail/Detail',
      })
    })
  },
  gotoDetail3: function (e) {
    //console.log(e.currentTarget.id)
    app.globalData.questionId = e.currentTarget.id
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
    })
    wx.navigateTo({
      url: '../../packageShow/page/1-1 Detail/Detail',
    })
  },

  tabsTap: function (e) {
    const index = e.detail.index
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })
  },
  swiperChange: function (e) {
    app.globalData.isClick = false
    const index = e.detail.index
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })
  },

  /* 
  获取数据库数据 
    return new Promise((resolve) => {}) 
  */
  getAllData: function () {
    return new Promise((resolve) => {
      question.where({
        _openid: app.globalData.openId,
        commenter: _.neq([])
      }).orderBy('answerTime', 'desc').get().then(res => {
        resolve()
        this.questionListAllData = { questionListAll: res.data }
      })
    })
  },
  getNoData: function () {
    commentAgain.where({
      postOpenId: '{openid}',
      newOpenId: _.neq(app.globalData.openId),
      isWatched: false
    }).orderBy('answerTime', 'desc').get().then((res) => {
      if (res.data.length) {
        this.setData({
          activeTab: 1
        })
      }
    })
    return new Promise((resolve) => {
      commentAgain.where({
        postOpenId: app.globalData.openId,
        newOpenId: _.neq(app.globalData.openId)
      }).orderBy('answerTime', 'desc').get().then(res => {
        resolve()
        this.questionListNoData = { questionListNo: res.data }
      })
    })
  },
  getYesData: function () {
    return new Promise((resolve) => {
      comment.where({
        _openid: app.globalData.openId,
        liker: _.neq([])
      }).orderBy('likeTime', 'desc').get().then(res => {
        resolve()
        this.questionListYesData = { questionListYes: res.data }
      })
    })
  },
  getData: function () {
    Promise.all([this.getAllData(), this.getNoData(), this.getYesData()]).then(() => {
      this.setData({
        'tabs[0].questionList': this.questionListAllData.questionListAll,
        'tabs[1].questionList': this.questionListNoData.questionListNo,
        'tabs[2].questionList': this.questionListYesData.questionListYes,
      })
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    this.getData()
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
    this.getData()
    if (app.globalData.messageNum > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: app.globalData.messageNum.toString()
      })
    }
    else {
      wx.removeTabBarBadge({
        index: 2,
      })
    }
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
    app.globalData.isClick = false
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  test: function () {
    this.setData({ refresherTriggered: false })
  },
  refresh: function () {
    setTimeout(this.test, 1000)
    this.getData()
  },

  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  reachBottom: function () {
    this.setData({
      reachBottom: true
    })
    //console.log('触底')
    const { activeTab } = this.data
    const { questionList } = this.data.tabs[activeTab]
    const showNum = questionList.length

    if (activeTab === 0) {
      question.where({
        time: _.lte(questionList[0].time),
        _openid: app.globalData.openId,
        commenter: _.neq([])
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            time: _.lt(questionList[showNum - 1].time),
            _openid: app.globalData.openId,
            commenter: _.neq([])
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              'tabs[0].questionList': old_data.concat(new_data),
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
    else if (activeTab === 1) {
      commentAgain.where({
        time: _.lte(questionList[0].time),
        postOpenId: app.globalData.openId,
        newOpenId: _.neq(app.globalData.openId)
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          commentAgain.where({
            time: _.lt(questionList[showNum - 1].time),
            postOpenId: app.globalData.openId,
            newOpenId: _.neq(app.globalData.openId)
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              'tabs[1].questionList': old_data.concat(new_data),
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
      comment.where({
        likeTime: _.lte(questionList[0].likeTime),
        _openid: app.globalData.openId,
        liker: _.neq([])
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          comment.where({
            likeTime: _.lt(questionList[showNum - 1].likeTime),
            _openid: app.globalData.openId,
            liker: _.neq([])
          }).orderBy('likeTime', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              'tabs[2].questionList': old_data.concat(new_data),
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
  onReachBottom: function () { },
})