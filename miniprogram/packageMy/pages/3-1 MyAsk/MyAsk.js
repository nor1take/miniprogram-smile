const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    tabs: [
      {
        id: 0,
        name: '全部发帖',
      },
      {
        id: 1,
        name: '待回应',
      },
      {
        id: 2,
        name: '已回应',
      },
    ],
    activeTab: 0,

    x: 1000, y: 1000,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    reachBottom: false,

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    loading: false
  },

  ask: function () {
    wx.navigateTo({
      url: '../../../packageShow/page/1-2 Ask/Ask',
    })
  },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index
    app.globalData.isClick = true

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
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
        _openid: '{openid}'
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListAllData = { questionListAll: res.data }
      })
    })
  },
  getNoData: function () {
    return new Promise((resolve) => {
      question.where({
        commentNum: _.eq(0),
        _openid: '{openid}'
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListNoData = { questionListNo: res.data }
      })
    })

  },
  getYesData: function () {
    return new Promise((resolve) => {
      question.where({
        commentNum: _.neq(0),
        _openid: '{openid}'
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListYesData = { questionListYes: res.data }
      })
    })

  },
  getData: function () {

    this.setData({

      top: app.globalData.top,
      bottom: app.globalData.bottom,
    })
    Promise.all([this.getAllData(), this.getNoData(), this.getYesData()]).then(() => {
      this.setData({
        'tabs[0].questionList': this.questionListAllData.questionListAll,
        'tabs[1].questionList': this.questionListNoData.questionListNo,
        'tabs[2].questionList': this.questionListYesData.questionListYes,
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      loading: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  updateupdateQuestionList: function (index) {
    const { questionList } = this.data.tabs[index]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick && questionIndex != -1) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
      }
      else {
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved
        questionList[questionIndex].commentNum = app.globalData.questionCommentNum
        questionList[questionIndex].watcher = app.globalData.questionWatcher
        questionList[questionIndex].watched = app.globalData.questionWatched
        questionList[questionIndex].collectNum = app.globalData.questionCollect
        questionList[questionIndex].postLikeNum = app.globalData.questionLikeNum
      }
      if (index === 0) {
        this.setData({
          'tabs[0].questionList': questionList
        })
      } else if (index === 1) {
        this.setData({
          'tabs[1].questionList': questionList
        })
      } else if (index === 2) {
        this.setData({
          'tabs[2].questionList': questionList
        })
      }
    }
  },


  onShow: function () {
    console.log(app.globalData.isAsk)

    if (app.globalData.isAsk) {
      this.getData()
      this.setData({
        scrollTop: 0
      })
      app.globalData.isAsk = false
    }

    const { activeTab } = this.data
    this.updateupdateQuestionList(activeTab)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
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
    console.log('触底')
    const { activeTab } = this.data
    const { questionList } = this.data.tabs[activeTab]
    const showNum = questionList.length
    if (activeTab === 0) {
      question.where({
        _openid: '{openid}'
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            _openid: '{openid}'
          }).orderBy('time', 'desc').skip(showNum).get().then(res => {
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
      question.where({
        commentNum: _.eq(0),
        _openid: '{openid}'
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          question.where({
            commentNum: _.eq(0),
            _openid: '{openid}'
          }).orderBy('time', 'desc').skip(showNum).get().then(res => {
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
      question.where({
        commentNum: _.neq(0),
        _openid: '{openid}'
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          question.where({
            commentNum: _.neq(0),
            _openid: '{openid}'
          }).orderBy('time', 'desc').skip(showNum).get().then(res => {
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