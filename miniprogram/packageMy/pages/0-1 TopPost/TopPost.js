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
  help: function (e) {
    const { id } = e.currentTarget.dataset
    const { currentId } = this.data
    if (id === '新版') {
      if (currentId === 0) {
        this.setData({
          currentId: -1
        })
      }
      else{
        this.setData({
          currentId: 0
        })
      }
    }
    else if (id === '菜单') {
      if (currentId === 1) {
        this.setData({
          currentId: -1
        })
      }
      else{
        this.setData({
          currentId: 1
        })
      }
    }
    else if (id === '搜索') { 
      if (currentId === 2) {
        this.setData({
          currentId: -1
        })
      }
      else{
        this.setData({
          currentId: 2
        })
      }
    }
    else if (id === '发帖') { 
      if (currentId === 3) {
        this.setData({
          currentId: -1
        })
      }
      else{
        this.setData({
          currentId: 3
        })
      }
    }
    else if (id === '消息') {
      if (currentId === 4) {
        this.setData({
          currentId: -1
        })
      }
      else{
        this.setData({
          currentId: 4
        })
      }
     }
     else if (id === '左上角圆点') {
      if (currentId === 5) {
        this.setData({
          currentId: -1
        })
      }
      else{
        this.setData({
          currentId: 5
        })
      }
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

  
})