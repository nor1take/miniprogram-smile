const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const systemMsg = db.collection('systemMsg')
const userInfo = db.collection('userInfo')
const question = db.collection('question')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
  },

  getNicknameandImage: function () {
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data[0].isForbidden) {
          wx.navigateTo({
            url: '../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl,
            isLogin: true,
            isManager: res.data[0].isManager,
            isAuthentic: res.data[0].isAuthentic,
            idTitle: res.data[0].idTitle
          })
          app.globalData.isLogin = true
          app.globalData.isManager = res.data[0].isManager
          app.globalData.isAuthentic = res.data[0].isAuthentic
          app.globalData.idTitle = res.data[0].idTitle
          app.globalData.modifyNum = res.data[0].modifyNum
          app.globalData.isCheckSystemMsg = res.data[0].isCheckSystemMsg
          if (res.data[0].isCheckSystemMsg) {
            this.setData({
              topWord: '置顶：使用帮助'
            })
          } else {
            this.setData({
              topWord: '有新的系统通知!!!'
            })
          }

          app.globalData.nickName = res.data[0].nickName
          app.globalData.avatarUrl = res.data[0].avatarUrl
          //console.log('成功获取昵称、头像：', app.globalData.nickName, app.globalData.avatarUrl)
        }
      })
      .catch(() => {
        //console.log('用户未登录')
        this.setData({
          nickName: '',
          avatarUrl: '',
          isLogin: false,
        })
        app.globalData.isLogin = false,
          wx.showToast({
            icon: 'none',
            title: '游客模式。左上角登录后体验 ‘发帖’ ‘评论’ 功能',
            duration: 3500,
          })
      })
  },

  postTap: function (e) {
    const { id } = e.currentTarget.dataset
    app.globalData.questionId = id

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
    })
  },
  imageTap: function (e) {
    //console.log(e.currentTarget.dataset.imagelist)
    let { imagelist } = e.currentTarget.dataset

    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: imagelist
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getNicknameandImage()
    app.globalData.isCheckSystemMsg = true
    userInfo.where({
      _openid: '{openid}'
    }).update({
      data: {
        isCheckSystemMsg: true
      }
    })
    systemMsg.orderBy('time', 'desc').get().then((res) => {
      this.setData({
        systemMsg: res.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    app.globalData.isClick = false
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      title: '微校Smile - ' + this.data.systemMsg[0].title,
      path: 'pages/0-0 Show/Show?id=' + 'top'
    }
  },

  onShareTimeline: function () {
    return {
      title: '微校Smile - ' + this.data.systemMsg[0].title
    }
  }
})