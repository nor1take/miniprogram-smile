// pages/0-1 TopPost/TopPost.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src:'cloud://cloud1-7gklx79xcb32af55.636c-cloud1-7gklx79xcb32af55-1310015840/oUXgD49xZ2UmMCD3B3GLS3h0rx1w/stable/tip01.jpg'
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
  getData:function(){
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
      title: '使用帮助',
    }
  }
})