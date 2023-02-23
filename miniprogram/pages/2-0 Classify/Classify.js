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
      { id: 0, name: '自定义', questionList: [] },
      { id: 1, name: '我捡到…', questionList: [] },
      { id: 2, name: '我丢了…', questionList: [] },
      { id: 3, name: '求(组队/资料…)', questionList: [] },
      { id: 4, name: '学习', questionList: [] },
      { id: 5, name: '生活', questionList: [] },
      { id: 6, name: '影视', questionList: [] },
      { id: 7, name: '读书', questionList: [] },
      { id: 8, name: '游戏', questionList: [] },
      { id: 9, name: '音乐', questionList: [] },
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
    const { index } = e.detail
    this.loadData(index)
    this.setData({
      activeTab: index,
      reachBottom: false,
      isBottom: false
    })
  },
  swiperChange: function (e) {
    const { index } = e.detail
    this.loadData(index)
    this.loadData(index + 1)
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

  loadData: function (index) {
    if (index >= this.data.tabs.length) return;
    if (this.data.tabs[index].questionList.length === 0) {
      if (index === 0) {
        question.where({
          tagId: 0
        }).orderBy('time', 'desc').get().then(res => {
          this.setData({
            'tabs[0].questionList': res.data
          })
        })
      } else {
        const { name } = this.data.tabs[index]
        question.where({
          tag: name
        }).orderBy('time', 'desc').get().then(res => {
          if (index === 1) {
            this.setData({
              'tabs[1].questionList': res.data
            })
          } else if (index === 2) {
            this.setData({
              'tabs[2].questionList': res.data
            })
          } else if (index === 3) {
            this.setData({
              'tabs[3].questionList': res.data
            })
          } else if (index === 4) {
            this.setData({
              'tabs[4].questionList': res.data
            })
          } else if (index === 5) {
            this.setData({
              'tabs[5].questionList': res.data
            })
          } else if (index === 6) {
            this.setData({
              'tabs[6].questionList': res.data
            })
          } else if (index === 7) {
            this.setData({
              'tabs[7].questionList': res.data
            })
          } else if (index === 8) {
            this.setData({
              'tabs[8].questionList': res.data
            })
          } else if (index === 9) {
            this.setData({
              'tabs[9].questionList': res.data
            })
          } else if (index === 10) {
            this.setData({
              'tabs[10].questionList': res.data
            })
          } else if (index === 11) {
            this.setData({
              'tabs[11].questionList': res.data
            })
          }
        })
      }
    }
  },

  onLoad: function () {
    this.loadData(0)
    this.loadData(1)
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
    if (app.globalData.isClick) {
      if (app.globalData.questionDelete) {
        app.globalData.questionDelete = false
        questionList.splice(questionIndex, 1)
      }
      else {
        questionList[questionIndex].solved = app.globalData.questionSolved,
          questionList[questionIndex].commentNum = app.globalData.questionCommentNum,
          questionList[questionIndex].watched = app.globalData.questionView,
          questionList[questionIndex].collectNum = app.globalData.questionCollect
      }
      if (index === 0) {
        this.setData({
          'tabs[0].questionList': questionList
        })
      } else if (index === 1) {
        this.setData({
          'tabs[1].questionList': questionList
        })
      } else if (index === 2) {
        this.setData({
          'tabs[2].questionList': questionList
        })
      } else if (index === 3) {
        this.setData({
          'tabs[3].questionList': questionList
        })
      } else if (index === 4) {
        this.setData({
          'tabs[4].questionList': questionList
        })
      } else if (index === 5) {
        this.setData({
          'tabs[5].questionList': questionList
        })
      } else if (index === 6) {
        this.setData({
          'tabs[6].questionList': questionList
        })
      } else if (index === 7) {
        this.setData({
          'tabs[7].questionList': questionList
        })
      } else if (index === 8) {
        this.setData({
          'tabs[8].questionList': questionList
        })
      } else if (index === 9) {
        this.setData({
          'tabs[9].questionList': questionList
        })
      } else if (index === 10) {
        this.setData({
          'tabs[10].questionList': questionList
        })
      } else if (index === 11) {
        this.setData({
          'tabs[11].questionList': questionList
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.updateList(this.data.activeTab)
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
    setTimeout(this.stoploading, 1000)
    this.getData()
    this.loadData(this.data.activeTab + 1)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  loadmore: function (index) {
    const questionList = this.data.tabs[index].questionList
    this.showNumData.showNum = questionList.length
    if (index === 0) {
      question.where({
        tagId: 0
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            tagId: 0
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
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
        tag: name
      }).count().then((res) => {
        if (this.showNumData.showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          //question条件修改 2
          question.where({
            tag: name
          }).orderBy('time', 'desc').skip(this.showNumData.showNum).get().then(res => {
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