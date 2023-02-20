const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const userInfo = db.collection('userInfo')

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    show: false,
    pass: false,
  },

  login: function (e) {
    console.log("login")
    const  nickName  = e.detail.value.nickName;
    if (nickName.length == 0 || nickName == null) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
    } else {
      wx.showLoading({
        title: '登录中…',
      })
      wx.cloud.uploadFile({
        cloudPath: app.globalData.openId + '/' + 'avatar.png', // 上传至云端的路径
        filePath: this.data.avatarUrl, // 小程序临时文件路径
        success: res => {
          wx.hideLoading()
          userInfo.add({
            data: {
              nickName: nickName,
              avatarUrl: res.fileID,
              isManager: false
            }
          }).then(() => {
            wx.switchTab({
              url: '../../../pages/0-0 Show/Show'
            })
          })
        },
        fail: err => {
          console.error('[上传文件] 失败：', err)
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '登录失败',
          })
        }
      })
    }
  },

  onChooseAvatar(e) {
    console.log('onChooseAvatar', e)
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },

  onNickNameReview(e) {
    console.log('onNickNameReview', e)
    const { pass } = e.detail
    this.setData({
      pass
    })
  },

  getOpenId() {
    wx.cloud.callFunction({
      name: 'getOpenId',
    }).then(res => {
      console.log('成功获取OpenID：', res.result.OPENID)
      app.globalData.openId = res.result.OPENID
    }).catch(() => {
      console.log('获取openid失败')
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenId()
    // console.log('options', options)
    if (options != undefined) {
      app.globalData.questionId = options.id
    }
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data.length) {
          console.log('用户已登录：', res.data)
          app.globalData.isManager = res.data[0].isManager
          wx.switchTab({
            url: '../../../pages/0-0 Show/Show'
          })
        } else {
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '登录',
    }
  }
})