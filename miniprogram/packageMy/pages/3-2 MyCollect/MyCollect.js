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
      { id: 0, name: '收藏', },
      { id: 1, name: '赞过', },
    ],

    activeTab: 0,

    x: 1000, y: 1000,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    reachBottom: false,

    top: app.globalData.top,
    left: app.globalData.left,
    right: app.globalData.right,
    bottom: app.globalData.bottom,
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
  getNoData: function () {
    return new Promise((resolve) => {
      question.where({
        collector: '{openid}',
      }).orderBy('time', 'desc').get().then(res => {
        //console.log(res.data)
        resolve()
        this.questionListNoData = { questionListNo: res.data }
      })
    })
  },
  getYesData: function () {
    return new Promise((resolve) => {
      question.where({
        liker: '{openid}',
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListYesData = { questionListYes: res.data }
      })
    })
  },
  getData: function () {
    Promise.all([this.getNoData(), this.getYesData()]).then(() => {
      this.setData({
        'tabs[0].questionList': this.questionListNoData.questionListNo,
        'tabs[1].questionList': this.questionListYesData.questionListYes,
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
        //console.log(app.globalData)
        questionList[questionIndex] = app.globalData.tmpPost
      }
      if (index === 0) {
        this.setData({
          'tabs[0].questionList': questionList
        })
      } else if (index === 1) {
        this.setData({
          'tabs[1].questionList': questionList
        })
      }
    }
  },

  onShow: function () {
    const { activeTab } = this.data
    this.updateupdateQuestionList(activeTab)
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
        collector: '{openid}',
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            collector: '{openid}',
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
        liker: '{openid}',
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          question.where({
            liker: '{openid}',
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
  },

})