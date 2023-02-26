const db = wx.cloud.database()
const _ = db.command
const systemContent = db.collection('systemContent')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    title: '微校Smile小程序协议（草案）',

    content: ''
  },

  communityTap: function () {
    console.log('communityTap')
    wx.navigateTo({
      url: '../0-3 Community/Community',
    })
  },

  onLoad() {
    systemContent.where({
      name: 'rule'
    }).get().then((res) => {
      this.setData({
        
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.title,
      path: 'pages/0-0 Show/Show?id=' + 'rule'
    }
  }
})