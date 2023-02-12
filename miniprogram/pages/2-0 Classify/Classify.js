// pages/Classify/Classify.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0,
    scrollTop: 0,
    tabs: [
      {
        id: 0,
        name: '自定义',
        questionList: [
          { id: 0, title: '', body: '', commentNum: 0, watched: 0 },
          { id: 1, title: '', body: '', commentNum: 0, watched: 0 },
          { id: 2, title: '', body: '', commentNum: 0, watched: 0 },
          { id: 3, title: '', body: '', commentNum: 0, watched: 0 },
          { id: 4, title: '', body: '', commentNum: 0, watched: 0 },
          { id: 5, title: '', body: '', commentNum: 0, watched: 0 },
        ]
      },
      { id: 1, name: '失物招领', },
      { id: 2, name: '寻物启事', },
      { id: 3, name: '求(组队/资料...)', },
      { id: 4, name: '学习', },
      { id: 5, name: '生活', },
    ],

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    reachBottom: false,

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
  },
  showNumData: {
    showNum: 0,
  },


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
  * 获取数据库数据 
    return new Promise((resolve) => { .then(resolve())}) 
  */
  getOtherData: function () {
    return new Promise((resolve) => {
      question.where({
        tabsId: 6
      }).orderBy('time', 'desc').get().then(res => {
        // this.setData({
        //   'tabs[0].questionList': res.data
        // })
        resolve()
        this.questionListOtherData = { questionListOther: res.data }
      })
    })

  },
  getFindData: function () {
    return new Promise((resolve) => {
      question.where({
        tabs: "我捡到..."
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListFindData = { questionListFind: res.data }
      })
    })

  },
  getLostData: function () {
    return new Promise((resolve) => {
      question.where({
        tabs: "我丢了..."
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListLostData = { questionListLost: res.data }
      })
    })

  },
  getAskforData: function () {
    return new Promise((resolve) => {
      question.where({
        tabs: "求..."
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListAskforData = { questionListAskfor: res.data }
      })
    })

  },
  getStudyData: function () {
    return new Promise((resolve) => {
      question.where({
        tabs: "学习"
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListStudyData = { questionListStudy: res.data }
      })
    })

  },
  getLifeData: function () {
    return new Promise((resolve) => {
      question.where({
        tabs: "生活"
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.questionListLifeData = { questionListLife: res.data }
      })
    })

  },

  getData: function () {
    var d = new Date();
    this.setData({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),

      top: app.globalData.top,
      left: app.globalData.left,
      right: app.globalData.right,
      bottom: app.globalData.bottom,
    })
    Promise.all([this.getFindData(),
    this.getLostData(),
    this.getAskforData(),
    this.getStudyData(),
    this.getLifeData(),
    this.getOtherData()])
      .then(() => {
        this.setData({
          'tabs[0].questionList': this.questionListOtherData.questionListOther,
          'tabs[1].questionList': this.questionListFindData.questionListFind,
          'tabs[2].questionList': this.questionListLostData.questionListLost,
          'tabs[3].questionList': this.questionListAskforData.questionListAskfor,
          'tabs[4].questionList': this.questionListStudyData.questionListStudy,
          'tabs[5].questionList': this.questionListLifeData.questionListLife,
        })
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

  onLoad: function () {
    this.getData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  
  updateQuestionListOther: function () {
    const { questionList } = this.data.tabs[0]
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
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[0].questionList': questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
  },
  updateQuestionListFind: function () {
    const { questionList } = this.data.tabs[1]
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
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[1].questionList': questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
  },
  updateQuestionListLost: function () {
    const { questionList } = this.data.tabs[2]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[2].questionList': questionList
        })
      }
      else {
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[2].questionList': questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
  },
  updateQuestionListAskfor: function () {
    const { questionList } = this.data.tabs[3]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[3].questionList': questionList
        })
      }
      else {
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[3].questionList': questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
  },
  updateQuestionListStudy: function () {
    const { questionList } = this.data.tabs[4]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[4].questionList': questionList
        })
      }
      else {
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[4].questionList': questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
  },
  updateQuestionListLife: function () {
    const { questionList } = this.data.tabs[5]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
        this.setData({
          'tabs[5].questionList': questionList
        })
      }
      else {
        console.log(app.globalData)
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
        this.setData({
          'tabs[5].questionList': questionList
        })
        // console.log(this.data.tabs[0].questionList[0])
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getTime()
    if (this.data.activeTab === 0) {
      this.updateQuestionListOther()
    }
    else if (this.data.activeTab === 1) {
      this.updateQuestionListFind()
    }
    else if (this.data.activeTab === 2) {
      this.updateQuestionListLost()
    }
    else if (this.data.activeTab === 3) {
      this.updateQuestionListAskfor()
    }
    else if (this.data.activeTab === 4) {
      this.updateQuestionListStudy()
    }
    else if (this.data.activeTab === 5) {
      this.updateQuestionListLife()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    app.globalData.isClick = false
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
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

    if (this.data.activeTab === 0) {
      //↑ ↓ index 修改 0
      const questionList = this.data.tabs[0].questionList
      this.showNumData.showNum = questionList.length
      //question条件修改 1
      question.where({
        tabsId: 6
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tabsId: 6
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              //↓ index 修改 3
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
    else if (this.data.activeTab === 1) {
      //↑ ↓ index 修改 0
      const questionList = this.data.tabs[1].questionList
      this.showNumData.showNum = questionList.length
      //question条件修改 1
      question.where({
        tabs: "我捡到..."
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tabs: "我捡到..."
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              //↓ index 修改 3
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
    else if (this.data.activeTab === 2) {
      //↑ ↓ index 修改 0
      const questionList = this.data.tabs[2].questionList
      this.showNumData.showNum = questionList.length
      //question条件修改 1
      question.where({
        tabs: "我丢了..."
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tabs: "我丢了..."
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              //↓ index 修改 3
              'tabs[2].questionList': old_data.concat(new_data),
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
    else if (this.data.activeTab === 3) {
      //↑ ↓ index 修改 0
      const questionList = this.data.tabs[3].questionList
      this.showNumData.showNum = questionList.length
      //question条件修改 1
      question.where({
        tabs: "求..."
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tabs: "求..."
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              //↓ index 修改 3
              'tabs[3].questionList': old_data.concat(new_data),
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
    else if (this.data.activeTab === 4) {
      //↑ ↓ index 修改 0
      const questionList = this.data.tabs[4].questionList
      this.showNumData.showNum = questionList.length
      //question条件修改 1
      question.where({
        tabs: "学习"
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tabs: "学习"
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              //↓ index 修改 3
              'tabs[4].questionList': old_data.concat(new_data),
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
      //↑ ↓ index 修改 0
      const questionList = this.data.tabs[5].questionList
      this.showNumData.showNum = questionList.length
      //question条件修改 1
      question.where({
        tabs: "生活"
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tabs: "生活"
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              //↓ index 修改 3
              'tabs[5].questionList': old_data.concat(new_data),
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