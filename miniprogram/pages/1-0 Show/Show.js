// pages/Show/Show.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const commentAgain = db.collection('commentAgain')
const userInfo = db.collection('userInfo')
const topPost = db.collection('topPost')

Array.prototype.getMessageNum = function () {
  var i = 0;
  var messageNum = 0
  for (; i < this.length; i++) {
    messageNum += this[i].message
  }
  return messageNum
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        name: '实时',
        Active: true,
      },
      {
        id: 1,
        name: '待解决',
        Active: false,
      },
      {
        id: 2,
        name: '已解决',
        Active: false,
      },
    ],

    x: 1000, y: 1000,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',
  },
  otherData: {
    lastIndex: 0,
    showNum: 0,
  },

  Ask: function () {
    wx.navigateTo({
      url: '../../packageShow/page/1-2 Ask/Ask',
    })
  },

  //2 点击，写入数据库：浏览量；跳转到Detail页面
  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index
    app.globalData.isClick = true

    wx.navigateTo({
      url: '../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        watched: _.inc(1)
      }
    })
  },

  topPost: function () {
    console.log('1')
    topPost.doc('63605076623c561d0177e3cd7091f8dc').update({
      data: {
        topPostwatched: _.inc(1)
      }
    }).then(() => {
      wx.navigateTo({
        url: '../../packageMy/pages/0-1 TopPost/TopPost',
      })
    })
  },

  //3 点击Tab，对上一个Tab数组更新
  tabsTap: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })

    const { index } = e.detail

    if (this.otherData.lastIndex == 0) {
      this.getAllData()
    }
    else if (this.otherData.lastIndex == 1) {
      this.getNoData()
    }
    else {
      this.getYesData()
    }

    this.otherData = {
      lastIndex: index,
      showNum: 0,
    }

    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.Active = true : v.Active = false);
    this.setData({
      tabs,
    })
  },


  //1-1 获取数据库数据
  getTopPost: function () {
    topPost.doc('63605076623c561d0177e3cd7091f8dc').get().then((res) => {
      console.log(res.data)
      const { topPosttabs } = res.data
      const { topPosttitle } = res.data
      const { topPostwatched } = res.data
      this.setData({
        topPosttabs,
        topPosttitle,
        topPostwatched
      })
    })
  },
  getAllData: function () {
    //实时
    question.orderBy('time', 'desc').get().then(res => {
      this.setData({
        'tabs[0].questionList': res.data
      })
    })
  },
  getNoData: function () {
    //待解决
    question.where({
      solved: false
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        'tabs[1].questionList': res.data
      })
    }).catch(() => {
      console.log('读取question集合失败')
    })
  },
  getYesData: function () {
    //已解决
    question.where({
      solved: true
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        'tabs[2].questionList': res.data
      })
    }).catch(() => {
      console.log('读取question集合失败')
    })
  },
  //1-2 获取时间
  getTime: function () {
    var d = new Date();
    this.setData({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),
    })
  },
  getData: function () {
    this.getTopPost()
    this.getAllData()
    this.getNoData()
    this.getYesData()
    this.getTime()
  },
  //1-3 获取右上角按钮数据
  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom
    })
  },
  getCurrentMessageNum: function () {
    //利用 openid 确定 messageNum
    question.where({
      _openid: app.globalData.openId
    }).get().then((res) => {
      const CurrentOpenIdQuestionList = res.data
      var messageNum = CurrentOpenIdQuestionList.getMessageNum()
      app.globalData.messageNum = messageNum
      commentAgain.where(_.and([
        {
          postOpenId: app.globalData.openId,
        },
        {
          isWatched: false
        },
        {
          newOpenId: _.neq(app.globalData.openId)
        }
      ])
      ).count().then(res => {
        console.log(res.total)
        app.globalData.messageNum = res.total + app.globalData.messageNum
        console.log('成功获取messageNum：', app.globalData.messageNum)
        if (app.globalData.messageNum) {
          wx.setTabBarBadge({
            index: 2,
            text: app.globalData.messageNum.toString()
          })
        }
      })
    }).catch(() => {
      console.log('失败！')
    })
  },
  //1-4 获取openID => 确定 messageNum + 获取 头像和昵称
  getOpenID: function () {
    wx.cloud.callFunction({
      name: 'getOpenId',
    }).then(res => {
      console.log('成功获取OpenID：', res.result.OPENID)
      app.globalData.openId = res.result.OPENID

      this.getCurrentMessageNum()

      //利用 openid 获取 头像和昵称
      userInfo.where({
        _openid: app.globalData.openId
      }).get().then((res) => {
        app.globalData.isLogin = true,
          app.globalData.nickName = res.data[0].nickName,
          app.globalData.avatarUrl = res.data[0].avatarUrl,
          console.log('成功获取昵称、头像：', app.globalData.nickName)
      }).catch(() => {
        console.log('用户未登录')
      })
    }).catch(() => {
      console.log('获取openid失败')
    })
  },

  removeRedPoint: function () {
    if (app.globalData.messageNum == 0) {
      wx.removeTabBarBadge({
        index: 2
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRightTop()
    this.getData()
    this.getOpenID()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  updateQuestionListAll: function () {
    const { questionListAll } = this.data
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionListAll.splice(questionIndex, 1)
        this.setData({
          questionListAll
        })
      }
      else {
        questionListAll[questionIndex].solved = app.globalData.questionSolved,
          questionListAll[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionListAll[questionIndex].watched = app.globalData.questionView,
          questionListAll[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          questionListAll
        })
        console.log(this.data.questionListAll[0])
      }
    }
  },

  onShow: function () {
    this.getCurrentMessageNum()
    console.log(app.globalData.isAsk)
    if (app.globalData.isAsk) {
      this.getData()
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 1250
      })
    }
    this.updateQuestionListAll()
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
    console.log('刷新')
    this.otherData = {
      showNum: 0,
    }
    this.getData()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('触底')
    console.log(this.otherData.showNum)
    const  questionListAll  = this.data.tabs[0].questionList
    const  questionListNo = this.data.tabs[1].questionList
    const  questionListYes = this.data.tabs[2].questionList
    if (this.data.tabs[0].Active) {
      this.otherData.showNum = questionListAll.length
      question.count().then((res) => {
        if (this.otherData.showNum < res.total) {
          this.setData({
            isBottom:false
          })
          question.orderBy('time', 'desc').skip(this.otherData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionListAll
            this.setData({
              'tabs[0].questionList': old_data.concat(new_data),
            })
          })
        }
        else{
          this.setData({
            isBottom:true
          })
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '首页',
    }
  }
})