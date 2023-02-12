const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        name: '全部关注',
        Active: true
      },
      {
        id: 1,
        name: '待解决',
        Active: false
      },
      {
        id: 2,
        name: '已解决',
        Active: false
      },
    ],
    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    showNum: 0
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

  getAllData: function () {
    //全部提问
    db.collection('question').where({
      collector: app.globalData.openId
    }).orderBy('time', 'desc').get().then(res => {
      console.log(res.data)
      this.setData({
        questionListAll: res.data
      })
    })
  },
  getNoData: function () {
    //待回应
    question.where({
      solved: false,
      collector: app.globalData.openId
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListNo: res.data
      })
    })
  },
  getYesData: function () {
    //已回应
    question.where({
      solved: true,
      collector: app.globalData.openId
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListYes: res.data
      })
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
    this.getAllData()
    this.getNoData()
    this.getYesData()
    this.getTime()
  },
  //3 点击Tab，对上一个Tab数组更新
  tabsTap: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })

    const { index } = e.detail

    if (this.data.lastIndex == 0) {
      this.getAllData()
    }
    else if (this.data.lastIndex == 1) {
      this.getNoData()
    }
    else {
      this.getYesData()
    }
    this.setData({
      showNum: 0,
      lastIndex: index
    })

    let { tabs } = this.data;
    tabs.forEach((v, i) => i === index ? v.Active = true : v.Active = false);
    this.setData({
      tabs,
    })
  },
  //2 写入数据库：浏览量 
  //2 点击，跳转到Detail页面
  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    wx.navigateTo({
      url: '../../pages/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        watched: _.inc(1)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRightTop()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
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
    let showNum = this.data.showNum + 20;
    if (this.data.tabs[0].Active) {
      question.where({
        collector: app.globalData.openId
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListAll
        this.setData({
          questionListAll: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else if (this.data.tabs[1].Active) {
      question.where({
        solved: false,
        collector: app.globalData.openId
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListNo
        this.setData({
          questionListNo: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else {
      question.where({
        solved: true,
        collector: app.globalData.openId
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListYes
        this.setData({
          questionListYes: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我的收藏',
    }
  }
})