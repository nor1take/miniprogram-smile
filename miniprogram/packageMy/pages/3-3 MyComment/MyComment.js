const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    reachBottom: false,

    questionList: []
  },
  showNumData: { showNum: 0, },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        watched: _.inc(1)
      }
    })
  },
  getNewData: function () {
    question.where({
      commenter: {
        openId: app.globalData.openId
      }
    }).orderBy('time', 'desc').get().then(res => {
      console.log(res.data)
      this.setData({
        questionList: res.data,
      })
    })
  },
  getData: function () {
    var d = new Date();
    this.getNewData()
    this.setData({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),

      top: app.globalData.top,
      left: app.globalData.left,
      right: app.globalData.right,
      bottom: app.globalData.bottom,
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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const { questionList } = this.data
    const { questionIndex } = app.globalData
    if (app.globalData.isAsk) {
      this.getData()
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 1000
      })
    }
    else if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          questionList
        })
      }
      else {
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
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
  onPullDownRefresh: function () {
    this.getData()
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
    console.log(this.showNumData.showNum)
    const questionListAll = this.data.questionList
    this.showNumData.showNum = questionListAll.length

    question.where({
      commenter: {
        openId: 'openid'
      }
    }).count().then((res) => {
      if (this.showNumData.showNum < res.total) {
        this.setData({
          isBottom: false,
        })
        question.where({
          commenter: {
            openId: 'openid'
          }
        }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
          let new_data = res.data
          let old_data = questionListAll
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
  },

})