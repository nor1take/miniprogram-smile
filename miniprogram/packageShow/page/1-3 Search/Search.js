// pages/Search/Search.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826'
  },
  //0-0 返回
  return: function (e) {
    wx.navigateBack()
  },
  //0-1 搜索框的输入状态，更新searchList数组数据
  input: function (e) {
    if (e.detail.value == '') {
      this.setData({
        searchList: []
      })
    }
  },

  //1-1 获取、查询数据库数据：[搜索]按钮
  confirm: function (e) {
    const {value} = e.detail
    if (value != '') {
      question.where(_.or([
        {
          title: db.RegExp({
            regexp: value,
            options: 'i',
          })
        },
        {
          body: db.RegExp({
            regexp: value,
            options: 'i',
          }),
        },
        {
          tabs: db.RegExp({
            regexp: value,
            options: 'i',
          }),
        }
      ])).get().then(res => {
        this.setData({
          searchList: res.data
        })
      })
    }


  },
  //1-2 获取右上角按钮数据
  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom
    })
  },
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
    this.getTime()
  },
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
    this.getData()
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
      title: '搜索',
    }
  }
})