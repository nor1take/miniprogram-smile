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
    //记得修改 case 1 * 2 / else if (index === 1 {
    tabs: [
      { id: 0, name: '自定义', questionList: [] },
      { id: 15, name: 'ChatGPT', questionList: [] },
      { id: 14, name: '#4 耳机分你一半', questionList: [] },
      { id: 3, name: '音乐', questionList: [] },
      { id: 1, name: '学习', questionList: [] },
      { id: 13, name: '#3 令你心动的offer', questionList: [] },
      { id: 2, name: '生活', questionList: [] },
      { id: 4, name: '美食', questionList: [] },
      { id: 5, name: '恋爱', questionList: [] },
      { id: 6, name: '游戏', questionList: [] },
      { id: 7, name: '组队', questionList: [] },
      { id: 8, name: '读书', questionList: [] },
      { id: 9, name: '闲置', questionList: [] },
      { id: 10, name: '摄影', questionList: [] },
      { id: 11, name: '我丢了…', questionList: [] },
      { id: 12, name: '我捡到…', questionList: [] },
    ],

    hasTheme: true,
    themeTitle: '耳机分你一半',
    themeBody: 'Music saves lives. 音乐拯救生命。\n\n耳机分你一半，与同好灵魂共振，分享音乐的美好，探索音乐的可能。',

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    reachBottom: false,

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
  },

  Ask: function () {
    wx.navigateTo({
      url: '../../packageShow/page/1-2 Ask/Ask',
    })
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
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId),
        tmp:_.addToSet(app.globalData.openId)
      }
    })
  },
  tabsTap: function (e) {
    const { index } = e.detail
    this.loadData(index, false)
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })
  },
  swiperChange: function (e) {
    const { index } = e.detail
    this.loadData(index, false)
    this.loadData(index + 1, false)
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
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
  },

  loadData: function (index, isRefresh) {
    if (index >= this.data.tabs.length) return;
    if (this.data.tabs[index].questionList.length === 0 || isRefresh) {
      if (index === 0) {
        question.where({
          tagId: 0
        }).orderBy('time', 'desc').get().then(res => {
          console.log(res)
          this.setData({
            'tabs[0].questionList': res.data
          })
        })
      } else {
        const { name } = this.data.tabs[index]
        question.where({
          tag: name
        }).orderBy('time', 'desc').get().then(res => {
          switch (index) {
            case 1:
              this.setData({
                'tabs[1].questionList': res.data
              })
              break;
            case 2:
              this.setData({
                'tabs[2].questionList': res.data
              })
              break;
            case 3:
              this.setData({
                'tabs[3].questionList': res.data
              })
              break;
            case 4:
              this.setData({
                'tabs[4].questionList': res.data
              })
              break;
            case 5:
              this.setData({
                'tabs[5].questionList': res.data
              })
              break;
            case 6:
              this.setData({
                'tabs[6].questionList': res.data
              })
              break;
            case 7:
              this.setData({
                'tabs[7].questionList': res.data
              })
              break;
            case 8:
              this.setData({
                'tabs[8].questionList': res.data
              })
              break;
            case 9:
              this.setData({
                'tabs[9].questionList': res.data
              })
              break;
            case 10:
              this.setData({
                'tabs[10].questionList': res.data
              })
              break;
            case 11:
              this.setData({
                'tabs[11].questionList': res.data
              })
              break;
            case 12:
              this.setData({
                'tabs[12].questionList': res.data
              })
              break;
            case 13:
              this.setData({
                'tabs[13].questionList': res.data
              })
              break;
            case 14:
              this.setData({
                'tabs[14].questionList': res.data
              })
              break;
            case 15:
              this.setData({
                'tabs[15].questionList': res.data
              })
              break;

          }
        })
      }
    }
  },

  onLoad: function () {
    this.loadData(0, false)
    this.loadData(1, false)
    this.getData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  updateList: function (index) {
    const { questionList } = this.data.tabs[index]
    const { questionIndex } = app.globalData
    if (app.globalData.isClick && questionIndex != -1) {
      app.globalData.isClick = false
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
      }
      else {
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watcher = app.globalData.questionWatcher,
          questionList[questionIndex].watched = app.globalData.questionWatched,
          questionList[questionIndex].collectNum = app.globalData.questionCollect,
          questionList[questionIndex].postLikeNum = app.globalData.questionLikeNum
      }
      switch (index) {
        case 0:
          this.setData({
            'tabs[0].questionList': questionList
          })
          break;
        case 1:
          this.setData({
            'tabs[1].questionList': questionList
          })
          break;
        case 2:
          this.setData({
            'tabs[2].questionList': questionList
          })
          break;
        case 3:
          this.setData({
            'tabs[3].questionList': questionList
          })
          break;
        case 4:
          this.setData({
            'tabs[4].questionList': questionList
          })
          break;
        case 5:
          this.setData({
            'tabs[5].questionList': questionList
          })
          break;
        case 6:
          this.setData({
            'tabs[6].questionList': questionList
          })
          break;
        case 7:
          this.setData({
            'tabs[7].questionList': questionList
          })
          break;
        case 8:
          this.setData({
            'tabs[8].questionList': questionList
          })
          break;
        case 9:
          this.setData({
            'tabs[9].questionList': questionList
          })
          break;
        case 10:
          this.setData({
            'tabs[10].questionList': questionList
          })
          break;
        case 11:
          this.setData({
            'tabs[11].questionList': questionList
          })
          break;
        case 12:
          this.setData({
            'tabs[12].questionList': questionList
          })
          break;
        case 13:
          this.setData({
            'tabs[13].questionList': questionList
          })
          break;
        case 14:
          this.setData({
            'tabs[14].questionList': questionList
          })
          break;
        case 15:
          this.setData({
            'tabs[15].questionList': questionList
          })
          break;
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.updateList(this.data.activeTab)
    if (app.globalData.isAsk) {
      this.loadData(1, true)
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
  stoploading: function () {
    this.setData({ refresherTriggered: false })
  },
  refresh: function () {
    console.log('refresh', this.data.activeTab)
    setTimeout(this.stoploading, 1000)
    this.getData()
    this.loadData(this.data.activeTab, true)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  loadmore: function (index) {
    const { questionList } = this.data.tabs[index]
    const showNum = questionList.length
    if (index === 0) {
      question.where({
        time: _.lte(questionList[0].time),
        tagId: 0
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            time: _.lt(questionList[showNum - 1].time),
            tagId: 0
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
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
    } else {
      const { name } = this.data.tabs[index]
      question.where({
        time: _.lte(questionList[0].time),
        tag: name
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            time: _.lt(questionList[showNum - 1].time),
            tag: name
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = questionList
            if (index === 1) {
              this.setData({
                'tabs[1].questionList': old_data.concat(new_data),
              })
            } else if (index === 2) {
              this.setData({
                'tabs[2].questionList': old_data.concat(new_data),
              })
            } else if (index === 3) {
              this.setData({
                'tabs[3].questionList': old_data.concat(new_data),
              })
            } else if (index === 4) {
              this.setData({
                'tabs[4].questionList': old_data.concat(new_data),
              })
            } else if (index === 5) {
              this.setData({
                'tabs[5].questionList': old_data.concat(new_data),
              })
            } else if (index === 6) {
              this.setData({
                'tabs[6].questionList': old_data.concat(new_data),
              })
            } else if (index === 7) {
              this.setData({
                'tabs[7].questionList': old_data.concat(new_data),
              })
            } else if (index === 8) {
              this.setData({
                'tabs[8].questionList': old_data.concat(new_data),
              })
            } else if (index === 9) {
              this.setData({
                'tabs[9].questionList': old_data.concat(new_data),
              })
            } else if (index === 10) {
              this.setData({
                'tabs[10].questionList': old_data.concat(new_data),
              })
            } else if (index === 11) {
              this.setData({
                'tabs[11].questionList': old_data.concat(new_data),
              })
            } else if (index === 12) {
              this.setData({
                'tabs[12].questionList': old_data.concat(new_data),
              })
            } else if (index === 13) {
              this.setData({
                'tabs[13].questionList': old_data.concat(new_data),
              })
            } else if (index === 14) {
              this.setData({
                'tabs[14].questionList': old_data.concat(new_data),
              })
            } else if (index === 15) {
              this.setData({
                'tabs[15].questionList': old_data.concat(new_data),
              })
            }
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
  reachBottom: function () {
    this.setData({
      reachBottom: true
    })

    this.loadmore(this.data.activeTab)
  },
})