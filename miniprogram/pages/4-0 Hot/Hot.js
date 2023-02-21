// pages/4-0 Hot/Hot.js
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
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
            $.divide(['$commentNum', 4])
          ]),
          $.pow([$.subtract([now, '$time']), 1.5])
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
})