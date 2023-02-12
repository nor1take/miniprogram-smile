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
    nickName: '',
    avatarUrl: '',
    src:"cloud://cloud1-7gklx79xcb32af55.636c-cloud1-7gklx79xcb32af55-1310015840/oUXgD49xZ2UmMCD3B3GLS3h0rx1w/stable/background02.jpg"
  },
  update:function(){
    wx.cloud.callFunction({
      name: 'batchUpdate',
    }).then((res)=>{
      console.log('更新成功！',res)
    })
  },
  getMessageNum: function () {
    this.setData({
      messageNum: app.globalData.messageNum
    })
  },
  //1-4 获取openID => 获取 获取头像和昵称
  getOpenID: function () {
    wx.cloud.callFunction({
      name: 'getOpenId',    
    }).then(res => {
        console.log('成功获取openid', res.result.OPENID)
        app.globalData.openId = res.result.OPENID
        //获取 获取头像和昵称
        userInfo.where({
          _openid: res.result.OPENID
        }).get().then(res => {
          app.globalData.isLogin = true
          app.globalData.nickName = res.data[0].nickName,
          app.globalData.avatarUrl = res.data[0].avatarUrl
          console.log('成功获取头像和昵称', app.globalData.nickName)
          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl
          })
        }).catch(() => {
          console.log('该用户未登录')
          app.globalData.isLogin = false
        })
      }).catch(()=>{
        console.log('获取openid失败')
      })
  },

  myAsk:function(){
    wx.navigateTo({
      url: '../../packageMy/pages/3-1 MyAsk/MyAsk',
    }) 
  },
  myCollect: function () {
    wx.navigateTo({
      url: '../../packageMy/pages/3-2 MyCollect/MyCollect',
    })
  },
  myMessage: function () {
    wx.navigateTo({
      url: '../../packageMy/pages/3-3 MyMessage/MyMessage',
    })
  },
  help:function(){
    wx.navigateTo({
      url: '../../packageMy/pages/3-3 MyMessage/MyMessage',
    })
  },
  //用户未登录的登录按钮
  getUserInfo: function () {
    wx.getUserProfile({
      desc: '登录' // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    }).then((res) => {
      console.log('用户同意登录，userInfo：', res.userInfo)
      app.globalData.nickName = res.userInfo.nickName,
      app.globalData.avatarUrl = res.userInfo.avatarUrl,
        this.setData({
          nickName: app.globalData.nickName,
          avatarUrl: app.globalData.avatarUrl
        }),
        userInfo.add({
          data: {
            nickName: app.globalData.nickName,
            avatarUrl: app.globalData.avatarUrl
          }
        })
        wx.redirectTo({
          url: '../3-0 My/My'
        })
    }).catch(()=>{
      console.log('用户拒绝登录')
    })
  },

  removeRedPoint:function(){
    if(app.globalData.messageNum == 0)
    {
      wx.removeTabBarBadge({
        index: 2
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getOpenID()
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
    setTimeout(this.userInfoanimation, 1000);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getMessageNum()
    this.removeRedPoint()
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
      title: '我的',
    }
  }
})