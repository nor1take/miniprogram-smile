const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const userInfo = db.collection('userInfo')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    animationData: {},
    show: false
  },

  getUserInfo: function () {
    wx.getUserProfile({
      desc: '登录' // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    }).then((res) => {
      console.log('用户同意登录，userInfo：', res.userInfo)
      userInfo.add({
        data: {
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl,
          isManager: false
        }
      }).then(() => {
        wx.switchTab({
          url: '../../../pages/0-0 Show/Show'
        })
      })
    }).catch(() => {
      console.log('用户拒绝登录')
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('options', options)
    if (options != undefined) {
      app.globalData.questionId = options.id
    }
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        console.log('用户已登录：', res.data)
        if (res.data.length) {
          app.globalData.isManager = res.data[0].isManager
          wx.switchTab({
            url: '../../../pages/0-0 Show/Show'
          })
        }
        else {
          this.setData({
            show: true
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  userInfoanimation: function () {
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })

    this.animation = animation

    this.animation.opacity(1).step(),
      this.setData({
        animationData: this.animation.export()
      })
  },
  onReady: function () {
    this.userInfoanimation()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '登录',
    }
  }
})