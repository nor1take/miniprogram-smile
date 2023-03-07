const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')

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
    comment.where({
      _openid: app.globalData.openId,
      posterId :_.neq(app.globalData.openId)
    }).orderBy('time', 'desc').get().then(res => {
      console.log(res.data)
      this.setData({
        questionList: res.data,
      })
    })
  },
  getData: function () {
    this.getNewData()
    this.setData({
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
    const { questionList } = this.data
    const showNum = questionList.length

    comment.where({
      _openid: app.globalData.openId,
      posterId :_.neq(app.globalData.openId)
    }).count().then((res) => {
      if (showNum < res.total) {
        this.setData({
          isBottom: false,
        })
        comment.where({
          _openid: app.globalData.openId,
          posterId :_.neq(app.globalData.openId)
        }).orderBy('time', 'desc').skip(showNum).get().then(res => {
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
  },

})