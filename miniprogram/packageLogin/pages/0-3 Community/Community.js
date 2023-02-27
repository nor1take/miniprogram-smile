Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    title: '微校Smile小程序社区规范'
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: 'pages/0-0 Show/Show?id=' + 'community'
    }
  }
})