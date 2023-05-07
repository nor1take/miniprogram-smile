const app = getApp()
const db = wx.cloud.database()
const $ = db.command.aggregate
const _ = db.command
const question = db.collection('question')
const userInfo = db.collection('userInfo')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    color1: '#DF3E3E',
    color2: '#FE721D',
    color3: '#F5AD01',
  },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index

    wx.navigateTo({
      url: '../1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  getData() {
    var now = new Date().getTime();
    question
      .aggregate()
      .match({
        tag: _.neq('AI')
      })
      .project({
        _id: 1,
        title: 1,
        image: 1,
        time: 1,

        totalScores: $.divide([
          $.sum([
            $.multiply([$.log10(
              $.sum(['$watched', $.size('$watcher')])
            ), 1]),
            $.multiply(['$collectNum', 8000]),
            $.multiply(['$commentNum', 16000]),
            $.multiply(['$postLikeNum', 32000]),
          ]),
          $.pow([
            $.sum(
              $.divide([$.subtract([now, '$time']), 2]),
              $.divide([$.subtract([now, '$answerTime']), 2]),
              1
            ),
            1.5
          ])
        ])
      })
      .sort({
        totalScores: -1
      })
      .end()
      .then((res) => {
        console.log(res.list)
        this.setData({
          questionList: res.list
        })
      })
  },

  getNicknameandImage: function () {
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data[0].isForbidden) {
          wx.navigateTo({
            url: '../../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl,
            isLogin: true,
            isManager: res.data[0].isManager
          })
          app.globalData.openId = res.data[0]._openid
          app.globalData.isLogin = true
          app.globalData.isManager = res.data[0].isManager
          app.globalData.isAuthentic = res.data[0].isAuthentic
          app.globalData.modifyNum = res.data[0].modifyNum
          app.globalData.isCheckSystemMsg = res.data[0].isCheckSystemMsg
          app.globalData.nickName = res.data[0].nickName
          app.globalData.avatarUrl = res.data[0].avatarUrl
          console.log('成功获取昵称、头像：', app.globalData.nickName, app.globalData.avatarUrl)
        }
      })
      .catch(() => {
        console.log('用户未登录')
        this.setData({
          nickName: '',
          avatarUrl: '',
          isLogin: false,
        })
        app.globalData.isLogin = false,
          wx.showToast({
            icon: 'none',
            title: '游客模式。前往小程序进行登录',
            duration: 3500,
          })
      })
  },
  onLoad() {
    wx.onMemoryWarning(function () {
      console.log('onMemoryWarningReceive')
    })


    if (app.globalData.openId == undefined || app.globalData.openId == '') {
      this.getNicknameandImage()
    }
    this.getData()
  },

  onUnload() {
    console.log('HOT onUnload')
    app.globalData.isClick = false
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getData()
    setTimeout(function () { wx.stopPullDownRefresh() }, 500)
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      title: '微校Smile - 热门',
      path: 'packageShow/page/1-4 Hot/Hot'
    }
  },
  onShareTimeline: function () {
    return {
      title: '微校Smile - 热门'
    }
  }
})