// packageShow/page/1-2-2 regist/regist.js
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
    console.log(e.detail.value)
    const { name } = e.detail.value
    const { classNum } = e.detail.value
    const { id } = e.detail.value

    if (name == "" || classNum == "" || id == "") {
      wx.showToast({
        title: '请完善信息',
        icon: 'none'
      })
    } else {

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