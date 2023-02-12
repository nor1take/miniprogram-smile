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
    tabs: [
      {
        id: 5,
        name: '自定义',
        Active: true
      },
      {
        id: 0,
        name: '失物招领',
        Active: false
      },
      {
        id: 1,
        name: '寻物启事',
        Active: false
      },
      {
        id: 2,
        name: '求(组队/资料...)',
        Active: false
      },
      {
        id: 3,
        name: '学习',
        Active: false
      },
      {
        id: 4,
        name: '生活',
        Active: false
      },

    ],

    showNum: 0,
    lastIndex: 0,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826'
  },

  //1-1 获取数据库数据
  getFindData: function () {
    question.where({
      tabs: "我捡到..."
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListFind: res.data
      })
    })
  },
  getLostData: function () {
    question.where({
      tabs: "我丢了..."
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListLost: res.data
      })
    })
  },
  getAskforData: function () {
    question.where({
      tabs: "求..."
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListAskfor: res.data
      })
    })
  },
  getStudyData: function () {
    question.where({
      tabs: "学习"
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListStudy: res.data
      })
    })
  },
  getLifeData: function () {
    question.where({
      tabs: "生活"
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListLife: res.data
      })
    })
  },
  getOtherData: function () {
    question.where({
      tabsId: 6
    }).orderBy('time', 'desc').get().then(res => {
      this.setData({
        questionListOther: res.data
      })
    })
  },
  getData: function () {
    this.getFindData()
    this.getLostData()
    this.getAskforData()
    this.getStudyData()
    this.getLifeData()
    this.getOtherData()
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

  //2 写入数据量：浏览量
  //2 点击，跳转到Detail页面
  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    wx.navigateTo({
      url: '../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        watched: _.inc(1)
      }
    })
  },

  //3 点击Tab，对上一个Tab数组更新
  tabsTap: function (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })

    const { index } = e.detail

    if (this.data.lastIndex == 0) {
      this.getFindData()
    }
    else if (this.data.lastIndex == 1) {
      this.getLostData()
    }
    else if (this.data.lastIndex == 2) {
      this.getAskforData()
    }
    else if (this.data.lastIndex == 3) {
      this.getStudyData()
    }
    else if (this.data.lastIndex == 4) {
      this.getLifeData()
    }
    else {
      this.getOtherData()
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


  onLoad: function (options) {
    this.getRightTop()
    this.getData()
    this.getTime()
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
    this.getTime()
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
    console.log('刷新')
    this.getData()
    this.getTime()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('触底')

    let showNum = this.data.showNum + 20;
    if (this.data.tabs[1].Active) {
      question.where({
        tabs: "我捡到..."
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListFind
        this.setData({
          questionListFind: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else if (this.data.tabs[2].Active) {
      question.where({
        tabs: "我丢了..."
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListLost
        this.setData({
          questionListLost: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else if (this.data.tabs[3].Active) {
      question.where({
        tabs: "求..."
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListAskfor
        this.setData({
          questionListAskfor: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else if (this.data.tabs[4].Active) {
      question.where({
        tabs: "学习"
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListStudy
        this.setData({
          questionListStudy: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else if (this.data.tabs[5].Active) {
      question.where({
        tabs: "生活"
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListLife
        this.setData({
          questionListLife: old_data.concat(new_data),
          showNum: showNum
        })
      })
    }
    else {
      question.where({
        tabs: "其他"
      }).orderBy('time', 'desc').skip(showNum).get().then(res => {
        let new_data = res.data
        let old_data = this.data.questionListOther
        this.setData({
          questionListOther: old_data.concat(new_data),
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
      title: '分类',
    }
  }

})