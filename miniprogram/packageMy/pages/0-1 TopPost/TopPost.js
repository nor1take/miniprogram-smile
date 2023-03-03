// pages/0-1 TopPost/TopPost.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    src: '',

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    currentId: 0,
  },

  rule1: function () {
    wx.navigateTo({
      url: '../../../packageLogin/pages/0-2 Rule/Rule',
    })
  },

  help: function (e) {
    const { id } = e.currentTarget.dataset
    const { currentId } = this.data

    if (currentId === parseInt(id)) {
      this.setData({
        currentId: -1
      })
    } else {
      this.setData({
        currentId: parseInt(id)
      })
    }
  },
  return: function (e) {
    wx.navigateBack()
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
  getData: function () {
    this.getRightTop()
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      title: '微校Smile - 使用帮助',
      path: 'packageMy/pages/0-1 TopPost/TopPost'
    }
  },

  onShareTimeline: function () {
    return {
      title: '微校Smile - 使用帮助',
    }
  }
})