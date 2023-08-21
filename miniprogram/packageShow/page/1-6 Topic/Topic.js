// packageShow/page/1-6 Topic/Topic.js
const app = getApp()
const db = wx.cloud.database()
const $ = db.command.aggregate
const _ = db.command
const question = db.collection('question')
const topicdb = db.collection('topic')
const userInfo = db.collection('userInfo')
Page({

  return: function () {
    wx.navigateBack()
      .catch(() => {
        wx.switchTab({
          url: '../../../pages/0-0 Show/Show'
        })
      })
  },

  onPageScroll(event) {
    const query = wx.createSelectorQuery();
    query.select('#sticky-element').boundingClientRect();
    query.exec(res => {
      const stickyElement = res[0];
      const scrollTop = event.scrollTop;
      const isSticky = this.data.isSticky;

      if (stickyElement && scrollTop >= stickyElement.top) {
        if (!isSticky) {
          //console.log("元素进入吸附状态");
          this.setData({
            isSticky: true
          });
          // 在吸附状态时执行你想要的操作
        }
      } else {
        if (isSticky) {
          //console.log("元素不在吸附状态");
          this.setData({
            isSticky: false
          });
          // 在非吸附状态时执行其他操作
        }
      }
    });
  },

  /**
   * 页面的初始数据
   */
  data: {
    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',
    top: 48,
    tag: '标签',
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    tabs: [
      // { id: 0, name: '关注', questionList: [] },
      { id: 1, name: '热门', questionList: [] },
      { id: 2, name: '最新', questionList: [] },
    ],
  },

  goToAsk: function () {
    if (app.globalData.isLogin) {
      wx.navigateTo({
        url: '../1-2 Ask/Ask?tag=' + app.globalData.tag,
      })
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
    }

  },

  goToAI: function () {
    wx.navigateTo({
      url: '../1-5 AI/AI',
    })
  },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    if (app.globalData.questionId == '') return;
    app.globalData.questionIndex = e.currentTarget.dataset.index

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1),
        watcher: _.addToSet(app.globalData.openId),
        tmp: _.addToSet(app.globalData.openId)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  collectAdd() {
    app.globalData.follow = true
    wx.showToast({
      title: '关注成功，将在“推荐”中展示',
      icon: 'none'
    })
    const { topic } = this.data
    if (topic[0].collector) {
      topic[0].collector.push(app.globalData.openId)
    } else {
      topic[0].collector = [app.globalData.openId]
    }

    this.setData({
      topic
    })
    topicdb.where({
      tag: app.globalData.tag
    }).update({
      data: {
        collector: _.addToSet(app.globalData.openId),
      }
    })
  },
  collectCancel() {
    app.globalData.follow = true
    wx.showToast({
      title: '取消关注',
      icon: 'none'
    })
    const { topic } = this.data

    let collectorIndex = topic[0].collector.indexOf(app.globalData.openId)
    if (collectorIndex != -1) {
      topic[0].collector.splice(collectorIndex, 1)
    }

    this.setData({
      topic
    })

    topicdb.where({
      tag: app.globalData.tag
    }).update({
      data: {
        collector: _.pull(app.globalData.openId),
      }
    })
  },

  getTopicData() {
    return new Promise((resolve) => {
      topicdb.where({
        tag: app.globalData.tag
      }).get().then(res => {
        resolve()
        this.topic = { topic: res.data }
      })
    })
  },
  getHotData() {
    return new Promise((resolve) => {
      var now = new Date().getTime();
      question
        .aggregate()
        .match({
          tag: _.eq(app.globalData.tag)
        })
        .project({
          _id: 1,

          unknown: 1,
          nickName: 1,
          avatarUrl: 1,

          title: 1,
          body: 1,
          image: 1,

          watched: 1,
          commentNum: 1,
          collectNum: 1,
          postLikeNum: 1,

          time: 1,
          comments: 1,

          totalScores: $.divide([
            $.sum([
              $.multiply([$.log10(
                $.sum(['$watched', $.size('$watcher')])
              ), 1]),
              $.multiply(['$collectNum', 8000]),
              $.multiply(['$commentNum', 16000]),
              $.multiply(['$postLikeNum', 32000]),
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
          //console.log(res.list)
          resolve()
          this.tmp0 = { data0: res.list }
        })
    })
  },
  getNewData() {
    return new Promise((resolve) => {
      question.where({
        tag: app.globalData.tag
      }).orderBy('time', 'desc').get().then(res => {
        //console.log(res.data)
        resolve()
        this.tmp1 = { data1: res.data }
      }).catch(err => {
        //console.log(err)
      })
    })
  },

  getNicknameandImage: function () {
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data[0].isForbidden) {
          wx.navigateTo({
            url: '../../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl,
            isLogin: true,
            isManager: res.data[0].isManager
          })
          app.globalData.openId = res.data[0]._openid
          app.globalData.isLogin = true
          app.globalData.isManager = res.data[0].isManager
          app.globalData.isAuthentic = res.data[0].isAuthentic
          app.globalData.idTitle = res.data[0].idTitle
          app.globalData.modifyNum = res.data[0].modifyNum
          app.globalData.isCheckSystemMsg = res.data[0].isCheckSystemMsg

          app.globalData.nickName = res.data[0].nickName
          app.globalData.avatarUrl = res.data[0].avatarUrl
          //console.log('成功获取昵称、头像：', app.globalData.nickName, app.globalData.avatarUrl)
        }
      })
      .catch(() => {
        //console.log('用户未登录')
        this.setData({
          nickName: '',
          avatarUrl: '',
          isLogin: false,
        })
        app.globalData.isLogin = false,
          wx.showToast({
            icon: 'none',
            title: '游客模式。点击←返回主界面',
            duration: 3500,
          })
      })
  },

  getData() {
    Promise.all([
      this.getHotData(),
      this.getNewData(),
      this.getTopicData()
    ]).then(() => {
      this.setData({
        'tabs[0].questionList': this.tmp0.data0,
        'tabs[1].questionList': this.tmp1.data1,
        topic: this.topic.topic,
        tag: app.globalData.tag,
        tagimg: app.globalData.tagimg,
        openId: app.globalData.openId
      })
    })
  },

  onLoad(options) {
    const { tag } = options
    //console.log(tag)
    if (tag) {
      this.getNicknameandImage();
      topicdb.where({
        tag: tag
      }).get().then(res => {
        //console.log(res)
        //console.log(res.data[0].tag)
        app.globalData.tag = res.data[0].tag
        app.globalData.tagimg = res.data[0].image
        this.getData()
      }).catch(err => {
        //console.log(err)
      })
    } else {
      this.getData()
    }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (app.globalData.isAsk) {
      this.getData();
      this.setData({
        activeTab: 1,
        scrollTop: 0
      })
    }

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      imageUrl: app.globalData.tagimg,
      title: "话题：" + app.globalData.tag,
      path: 'packageShow/page/1-6 Topic/Topic?tag=' + this.data.topic[0].tag
    }
  },

  onShareTimeline: function () {
    return {
      imageUrl: app.globalData.tagimg,
      title: "话题：" + app.globalData.tag,
      query: 'tag=' + this.data.topic[0].tag
    }
  }
})