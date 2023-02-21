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
    nickName: '',
    show: false,
    pass: false,

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
  },

  login: function (e) {
    console.log("login")
    const nickName = e.detail.value.nickName;
    if (nickName.length == 0 || nickName == null) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      })
    } else {
      wx.showLoading({
        title: '提交中',
      })
      const onlyString = new Date().getTime().toString();
      wx.cloud.uploadFile({
        cloudPath: app.globalData.openId + '/' + 'avatar' + onlyString + '.png', // 上传至云端的路径
        filePath: this.data.avatarUrl, // 小程序临时文件路径
        success: res => {
          if (!app.globalData.isLogin) {
            userInfo.add({
              data: {
                nickName: nickName,
                avatarUrl: res.fileID,
                isManager: false,
                isForbidden: false,
                isAuthentic: false
              }
            }).then(() => {
              wx.hideLoading()
              wx.switchTab({
                url: '../../../pages/0-0 Show/Show'
              })
            })
          } else {
            userInfo.where({
              _openid: '{openid}'
            }).update({
              data: {
                nickName: nickName,
                avatarUrl: res.fileID,
              }
            }).then(() => {
              wx.hideLoading()
              wx.switchTab({
                url: '../../../pages/0-0 Show/Show'
              })
            })
          }
        },
        fail: err => {
          console.error('[上传文件] 失败：', err)
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '失败',
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('options', options)
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data.length) {
          console.log('用户已登录：', res.data[0])
          this.setData({
            avatarUrl: res.data[0].avatarUrl,
            nickName: res.data[0].nickName
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  },
})