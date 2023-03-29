const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    tabs: [
      {
        id: 0,
        name: '处理发帖',
      },
      {
        id: 1,
        name: '处理评论',
      },
    ],
    activeTab: 0,

    x: 1000, y: 1000,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    reachBottom: false,

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    loading: false
  },
  showNumData: {
    showNum: 0,
  },

  gotoDetail: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
  },

  clearWarnersPost: function (e) {
    const { id } = e.currentTarget
    wx.showActionSheet({
      itemList: ['清空Warners'],
      itemColor: '#FA5151'
    })
      .then(() => {
        question.doc(id).update({
          data: {
            warner: [],
            warnerDetail: [],
          }
        }).then((res) =>{
          console.log(res)
        })
      })
      .catch((err) => {
        console.log(err)
      })
  },

  clearWarnersComment: function (e) {
    const {commentid} = e.currentTarget.dataset
    wx.showActionSheet({
      itemList: ['清空Warners'],
      itemColor: '#FA5151'
    })
      .then(() => {
        comment.doc(commentid).update({
          data: {
            warner: [],
            warnerDetail: [],
          }
        }).then((res) =>{
          console.log(res)
        })
      })
      .catch((err) => {
        console.log(err)
      })
  },

  tabsTap: function (e) {
    const index = e.detail.index
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })
  },
  swiperChange: function (e) {
    const index = e.detail.index
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })
  },

  /* 
  获取数据库数据 
  */
  getPostData: function () {
    return new Promise((resolve) => {
      question.where({
        warner: _.neq([]),
      }).orderBy('warner', 'desc').get().then(res => {
        resolve()
        console.log(res.data)
        this.questionListPostData = { questionListPost: res.data }
      })
    })
  },
  getCommentData: function () {
    return new Promise((resolve) => {
      comment.where({
        warner: _.neq([]),
      }).orderBy('warner', 'desc').get().then(res => {
        resolve()
        this.questionListCommentData = { questionListComment: res.data }
      })
    })

  },
  getData: function () {
    Promise.all([this.getPostData(), this.getCommentData()]).then(() => {
      this.setData({
        'tabs[0].questionList': this.questionListPostData.questionListPost,
        'tabs[1].questionList': this.questionListCommentData.questionListComment,

        top: app.globalData.top,
        bottom: app.globalData.bottom,
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
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

  updateQuestionListPost: function () {
    const { questionList } = this.data.tabs[0]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick && questionIndex != -1) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[0].questionList': questionList
        })
      }
    }
  },
  updateQuestionListComment: function () {
    const { questionList } = this.data.tabs[1]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick && questionIndex != -1) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[1].questionList': questionList
        })
      }
    }
  },

  onShow: function () {
    if (this.data.activeTab === 0) {
      this.updateQuestionListPost()
    }
    else {
      this.updateQuestionListComment()
    }
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
    app.globalData.isClick = false
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  test: function () {
    this.setData({ refresherTriggered: false })
  },
  refresh: function () {
    setTimeout(this.test, 1000)
    this.getData()
  },

  onPullDownRefresh: function () { },

  /**
   * 页面上拉触底事件的处理函数
   */
  reachBottom: function () {
    this.setData({
      reachBottom: true
    })
    console.log('触底')
    console.log(this.showNumData.showNum)
    const questionListPost = this.data.tabs[0].questionList
    const questionListComment = this.data.tabs[1].questionList


    if (this.data.activeTab === 0) {
      this.showNumData.showNum = questionListPost.length
      question.where({
        warner: _.neq([]),
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false
          })

          question.where({
            warner: _.neq([]),
          }).orderBy('warner', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionListPost
            this.setData({
              'tabs[0].questionList': old_data.concat(new_data),
            })
          })
        }
        else {
          this.setData({
            isBottom: true
          })
        }
      })
    }
    else {
      this.showNumData.showNum = questionListComment.length
      comment.where({
        warner: _.neq([]),
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false
          })
          comment.where({
            warner: _.neq([]),
          }).orderBy('warner', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionListComment
            this.setData({
              'tabs[1].questionList': old_data.concat(new_data),
            })
          })
        }
        else {
          this.setData({
            isBottom: true
          })
        }
      })
    }
  },
  onReachBottom: function () { },
})