// pages/4-0 Hot/Hot.js
const app = getApp()
const db = wx.cloud.database()
const $ = db.command.aggregate
const _ = db.command
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

    color1: '#DF3E3E',
    color2: '#FE721D',
    color3: '#F5AD01',
  },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index

    wx.navigateTo({
      url: '../../packageShow/page/1-1 Detail/Detail',
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
  getData() {
    var now = new Date().getTime();
    question
      .aggregate()
      .project({
        _id: 1,
        title: 1,
        image: 1,
        time: 1,
        totalScores: $.divide([
          $.sum([
            $.multiply([$.log10('$watched'), 4]),
            '$collectNum',
            $.multiply(['$commentNum', 2])
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
  onLoad() {
    this.getData()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getData()
    setTimeout(function () { wx.stopPullDownRefresh() }, 500)
  }
})