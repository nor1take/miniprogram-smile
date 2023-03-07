const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const systemMsg = db.collection('systemMsg')
const userInfo = db.collection('userInfo')
const question = db.collection('question')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
  },

  postTap: function (e) {
    const {id} = e.currentTarget.dataset    
    app.globalData.questionId = id

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(id).update({
      data: {
        watched: _.inc(1)
      }
    })
  },
  imageTap: function (e) {
    console.log(e.currentTarget.dataset.imagelist)
    let { imagelist } = e.currentTarget.dataset

    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: imagelist
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    userInfo.where({
      _openid: '{openid}'
    }).update({
      data: {
        isCheckSystemMsg: true
      }
    })
    systemMsg.orderBy('time', 'desc').get().then((res) => {
      this.setData({
        systemMsg: res.data
      })
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
      title: '微校Smile - 系统通知·Note',
      path: 'packageMy/pages/3-5 SystemMsg/SystemMsg'
    }
  },

  onShareTimeline: function () {
    return {
      title: '微校Smile - 系统通知·Note'
    }
  }
})