Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: app.globalData.top,
    left: app.globalData.left,
    right: app.globalData.right,
    bottom: app.globalData.bottom,

    title: '微校Smile小程序协议（草案）',

    content: ''
  },

  communityTap: function () {
    //console.log('communityTap')
    wx.navigateTo({
      url: '../0-3 Community/Community',
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: 'packageLogin/pages/0-2 Rule/Rule'
    }
  },

  onShareTimeline: function () {
    return {
      title: this.data.title,
    }
  }
})