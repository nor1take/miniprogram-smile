// packageShow/page/1-2-2 regist/regist.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const activity = db.collection('activity')
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

  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom
    })
  },


  formSubmit: function (e) {
    wx.showLoading({
      title: '提交中',
    })
    //console.log(e.detail.value)
    const { name } = e.detail.value
    const { classNum } = e.detail.value
    const { id } = e.detail.value

    if (name == "" || classNum == "" || id == "") {
      wx.hideLoading()
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      })
    } else {
      activity.where({
        _openid: '{openid}'
      }).get().then((res) => {
        //console.log(res.data)
        if (res.data.length != 0) {
          wx.showToast({
            title: '请勿重复提交！如有其他问题，请前往 意见反馈 联系开发者',
            icon: 'none',
            duration: 5000
          })
        } else {
          activity.add({
            data: {
              id,
              classNum,
              name,
              activityId: app.globalData.questionId
            }
          }).then(() => {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000
            }).then(() => {
              setTimeout(function () { wx.navigateBack() }, 2000)
            })
          })
        }
      }).catch(() => {

      })

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getRightTop()
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
  onShareAppMessage() {

  }
})