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
    console.log(e.currentTarget.id)
    app.globalData.questionId = e.currentTarget.id
    question.doc(e.currentTarget.id).update({
      data: {
        watched: _.inc(1)
      }
    }).then(res => { console.log(res) }).catch(err => { console.log(err) })
    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
  },


  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index
    app.globalData.isClick = true

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
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
    return new Promise((resolve) => {}) 
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

    this.setData({


      top: app.globalData.top,
      // height:app.globalData.height
      // left: app.globalData.left,
      // right: app.globalData.right,
      bottom: app.globalData.bottom,
    })
    Promise.all([this.getPostData(), this.getCommentData()]).then(() => {
      this.setData({
        'tabs[0].questionList': this.questionListPostData.questionListPost,
        'tabs[1].questionList': this.questionListCommentData.questionListComment,
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
    this.setData({
      loading: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */

  updateQuestionListPost: function () {
    const { questionList } = this.data.tabs[1]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[0].questionList': questionList
        })
      }
      else {
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[0].questionList': questionList
        })
        console.log(this.data.tabs[1].questionList[0])
      }
    }
  },
  updateQuestionListComment: function () {
    const { questionList } = this.data.tabs[2]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[1].questionList': questionList
        })
      }
      else {
        questionList[questionIndex].collectNum = app.globalData.questionCollect
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          this.setData({
            'tabs[1].questionList': questionList
          })
        console.log(this.data.tabs[2].questionList[0])
      }
    }
  },

  onShow: function () {
    console.log(app.globalData.isAsk)

    if (app.globalData.isAsk) {
      this.getData()
      this.setData({
        scrollTop: 0
      })
      app.globalData.isAsk = false
    }


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
        warner: _.neq(0),
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false
          })

          question.where({
            warner: _.neq(0),
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
        warner: _.neq(0),
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false
          })
          comment.where({
            warner: _.neq(0),
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