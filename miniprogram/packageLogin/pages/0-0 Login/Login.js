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

    top: app.globalData.top,
    left: app.globalData.left,
    right: app.globalData.right,
    bottom: app.globalData.bottom,

    isChecked: false
  },

  /**
   * 单选组件 触发事件：已同意并阅读《协议》
   */
  radioTap: function () {
    if (this.data.isChecked) {
      this.setData({
        isChecked: false
      })
    } else {
      this.setData({
        isChecked: true
      })
    }
  },

  /**
   * 页面跳转：到《协议》页面
   */
  rule1: function () {
    wx.navigateTo({
      url: '../0-2 Rule/Rule',
    })
  },

  /**
   * 提交按钮 触发事件
   * @param {*} e 
   */
  login: function (e) {
    //console.log("login")
    if (app.globalData.modifyNum <= 0) {
      wx.showToast({
        title: '修改次数用尽',
        icon: 'error'
      })
    } else {
      const nickName = e.detail.value.nickName;

      if (nickName.length == 0 || nickName == null) {
        wx.showToast({
          title: '昵称不能为空',
          icon: 'none'
        })
      }
      else {
        wx.showLoading({
          title: '提交中',
        })
        wx.cloud.callFunction({
          name: 'checkContent',
          data: {
            txt: nickName,
            scene: 1 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
          },
          success(_res) {
            //console.log(_res)
            if (_res.result.msgR) {
              const { label } = _res.result.msgR.result
              const { suggest } = _res.result.msgR.result
              if (suggest === 'risky') {
                wx.hideLoading()
                wx.showToast({
                  title: '危险：包含' + check.matchLabel(label) + '信息！',
                  icon: 'none'
                })
              } else if (suggest === 'review') {
                wx.hideLoading()
                wx.showToast({
                  title: '可能包含' + check.matchLabel(label) + '信息，建议调整相关表述',
                  icon: 'none'
                })
              }
              else {
                wx.hideLoading()
                if (this.data.avatarUrl.startsWith("https://") || this.data.avatarUrl.startsWith("cloud://")) {
                  if (!app.globalData.isLogin) {
                    userInfo.add({
                      data: {
                        askTime: 5,
                        nickName: nickName,
                        avatarUrl: this.data.avatarUrl,
                        isManager: false,
                        isForbidden: false,
                        isAuthentic: false,
                        modifyNum: 2,
                        isCheckSystemMsg: false
                      }
                    }).then(() => {
                      wx.hideLoading()
                      app.globalData.isModify = true
                      app.globalData.isLogin = true
                      wx.navigateBack()
                        .catch(() => {
                          wx.navigateBack()
                            .catch(() => {
                              wx.switchTab({
                                url: '../../../pages/0-0 Show/Show'
                              })
                            })
                        })
                    })
                  } else {
                    app.globalData.modifyNum = app.globalData.modifyNum - 1;
                    userInfo.where({
                      _openid: '{openid}'
                    }).update({
                      data: {
                        nickName: nickName,
                        avatarUrl: this.data.avatarUrl,
                        modifyNum: _.inc(-1)
                      }
                    }).then(() => {
                      wx.hideLoading()
                      wx.showToast({
                        title: '你还有 ' + app.globalData.modifyNum + ' 次修改机会',
                        icon: 'none'
                      })
                      app.globalData.isModify = true
                      setTimeout(function () {
                        wx.navigateBack()
                          .catch(() => {
                            wx.switchTab({
                              url: '../../../pages/0-0 Show/Show'
                            })
                          })
                        // wx.switchTab({
                        //   url: '../../../pages/0-0 Show/Show'
                        // })
                      }, 1000);
                    })
                  }
                } else {
                  const onlyString = new Date().getTime().toString();
                  wx.cloud.uploadFile({
                    cloudPath: app.globalData.openId + '/' + 'avatar' + onlyString, // 上传至云端的路径
                    filePath: this.data.avatarUrl, // 小程序临时文件路径
                    success: res => {
                      if (!app.globalData.isLogin) {
                        userInfo.add({
                          data: {
                            askTime: 5,
                            nickName: nickName,
                            avatarUrl: res.fileID,
                            isManager: false,
                            isForbidden: false,
                            isAuthentic: false,
                            modifyNum: 2,
                            isCheckSystemMsg: false
                          }
                        }).then(() => {
                          wx.hideLoading()
                          app.globalData.isModify = true
                          app.globalData.isLogin = true
                          wx.navigateBack()
                            .catch(() => {
                              wx.switchTab({
                                url: '../../../pages/0-0 Show/Show'
                              })
                            })
                          // wx.switchTab({
                          //   url: '../../../pages/0-0 Show/Show'
                          // })
                        })
                      } else {
                        //console.log(res)
                        app.globalData.modifyNum = app.globalData.modifyNum - 1;
                        userInfo.where({
                          _openid: '{openid}'
                        }).update({
                          data: {
                            nickName: nickName,
                            avatarUrl: res.fileID,
                            modifyNum: _.inc(-1)
                          }
                        }).then(() => {
                          wx.hideLoading()
                          wx.showToast({
                            title: '你还有 ' + app.globalData.modifyNum + ' 次修改机会',
                            icon: 'none'
                          })
                          app.globalData.isModify = true
                          setTimeout(function () {
                            wx.navigateBack()
                              .catch(() => {
                                wx.switchTab({
                                  url: '../../../pages/0-0 Show/Show'
                                })
                              })
                            // wx.switchTab({
                            //   url: '../../../pages/0-0 Show/Show'
                            // })
                          }, 1000);
                        })
                      }
                    },
                    fail: err => {
                      //console.error('[上传文件] 失败：', err)
                      wx.hideLoading()
                      wx.showToast({
                        icon: 'none',
                        title: '失败',
                      })
                    }
                  })
                }
              }
            } else {
              wx.hideLoading()
                wx.showToast({
                  title: '网络繁忙，请稍后再试！',
                  icon: 'none'
                })
            }
          },
          fail(_res) {
            //console.log('checkContent云函数调用失败', _res)
          }
        })

      }
    }
  },

  /**
   * 头像审核通过 触发事件
   * @param {*} e 
   */
  onChooseAvatar(e) {
    //console.log('onChooseAvatar', e)
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },

  /**
   * 昵称审核通过触发事件
   * @param {*} e 
   */
  onNickNameReview(e) {
    //console.log('onNickNameReview', e)
    const { pass } = e.detail
    this.setData({
      pass
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data.length) {
          //console.log('用户已登录：', res.data[0])
          this.setData({
            avatarUrl: res.data[0].avatarUrl,
            nickName: res.data[0].nickName
          })
        }
      })
      .catch((err) => {
        //console.log(err)
      })
  },
})