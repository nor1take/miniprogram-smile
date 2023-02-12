const app = getApp()

const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const commentAgain = db.collection('commentAgain')
const likerList = db.collection('likerList')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [
      {
        id: 0,
        name: '问题回应',
        Active: true
      },
      {
        id: 1,
        name: '评论回应',
        Active: false
      },
    ],
    showNum: 0
  },

  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom
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
  getQuetionData:function(){
    db.collection('question').where({
      _openid:app.globalData.openId,
      commenter:_.neq([])
    }).orderBy('answerTime','desc').get().then( res => {
      this.setData({
        questionList: res.data
      })
    })
  },
  getCommentData:function(){
    commentAgain.where(_.and([{
      postOpenId: app.globalData.openId
    },
    {
      newOpenId:_.neq(app.globalData.openId)
    },
    {
      isWatched:false
    }
    ])).get().then((res)=>{
      if(res.data.length){
        this.setData({
          tabs: [
            {
              id: 0,
              name: '问题回应',
              Active: false
            },
            {
              id: 1,
              name: '评论回应',
              Active: true
            },
          ],
        })
      }
    })
    commentAgain.where(_.and([{
      postOpenId: app.globalData.openId
    },
    {
      newOpenId:_.neq(app.globalData.openId)
    }
    ])).orderBy('answerTime','desc').get().then((res)=>{
      console.log('评论回应', res.data)
      this.setData({
        commentList: res.data
      })
    })
  },
  getData:function(){
    this.getRightTop()
    this.getQuetionData()
    this.getCommentData()
    this.getTime()
  },
  tabsTap: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })

    const { index } = e.detail

    if (this.data.lastIndex == 0) {
      this.getQuetionData()
    }
    else if (this.data.lastIndex == 1) {
      this.getCommentData()
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

  gotoDetail:function(e){
    console.log(e.currentTarget.id)
    app.globalData.questionId = e.currentTarget.id
    wx.navigateTo({
      url: '../../pages/1-1 Detail/Detail',
    })
  },
  gotoDetail2:function(e){
    console.log(e.currentTarget.dataset.commentid)
    app.globalData.questionId = e.currentTarget.id
    const {commentid}=e.currentTarget.dataset
    var isWatched;
    commentAgain.doc(commentid).get().then((res)=>{
      isWatched = res.data.isWatched
      if(!isWatched){
        commentAgain.doc(commentid).update({
          data:{
            isWatched: true
          }
        }).then(()=>{
          app.globalData.messageNum--,
          console.log('成功')
        })
      }
      wx.navigateTo({
        url: '../../pages/1-1 Detail/Detail',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '我的消息',
    }
  }
})