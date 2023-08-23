// pages/Classify/Classify.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
const question = db.collection('question')

const topic = db.collection('topic')

Page({
  data: {
    tabs: [
      { id: 0, name: '推荐', topic: [] },
      { id: 1, name: '热门', topic: [] },
      { id: 2, name: '最新', topic: [] },
      { id: 3, name: '探索', topic: [] },
    ],
    activeTab: 1,
    top: app.globalData.top,
    openId: app.globalData.openId
  },

  goToAI: function () {
    wx.navigateTo({
      url: '../../packageShow/page/1-5 AI/AI',
    })
  },

  goToSearch() {
    wx.navigateTo({
      url: '../../packageShow/page/1-3 Search/Search',
    })
  },

  goToTopic(e) {
    //console.log(e.currentTarget.dataset.tag)
    app.globalData.tag = e.currentTarget.dataset.tag
    app.globalData.tagimg = e.currentTarget.dataset.tagimg
    wx.navigateTo({
      url: '../../packageShow/page/1-6 Topic/Topic',
    })
  },

  myData: {},

  getSelectedData() {
    return new Promise((resolve) => {
      topic.where(
        // _id: _.exists(true)
        _.or([{ star: true },
        { posts: { _openid: '{openid}' } },
        { collector: '{openid}' }
        ])
      ).orderBy('updatetime', 'desc')
        .get().then((res) => {
          //console.log(res)
          resolve()
          this.myData.SelectedData = res.data
          // this.setData({
          //   'tabs[0].topicList': res.data
          // })
        })
    })
  },

  getHotData() {
    var now = new Date().getTime();
    return new Promise((resolve) => {
      topic
        .aggregate()
        .match({
          _id: _.exists(true)
        })
        .project({
          _id: 1,
          image: 1,
          num: 1,
          posts: 1,
          star: 1,
          tag: 1,
          updatetime: 1,
          collector: 1,

          totalScores: $.divide([
            // $.multiply([$.log10($.size('$posts')), 1]),
            $.multiply([$.size('$posts'), 1]),
            $.pow([
              $.sum(([$.subtract([now, '$updatetime']), 2]), 1),
              1.5
            ])
          ])
        })
        .sort({ totalScores: -1 })
        .end()
        .then((res) => {
          //console.log(res.list)
          resolve()
          this.myData.HotData = res.list
        })
    })
  },

  getExploreData() {
    return new Promise((resolve) => {
      topic.where({
        num: _.lt(5)
      }).orderBy('num', 'asc').orderBy('updatetime', 'desc')
        .get().then((res) => {
          //console.log(res)
          resolve()
          this.myData.ExploreData = res.data
        })
    })
  },
  getNewData() {
    return new Promise((resolve) => {
      topic.where({
        _id: _.exists(true)
      }).orderBy('updatetime', 'desc')
        .get().then((res) => {
          //console.log(res)
          resolve()
          this.myData.NewData = res.data

        })
    })
  },

  getData() {
    this.getHotData().then(() => {
      this.setData({
        'tabs[1].topicList': this.myData.HotData,
      })
      wx.hideLoading()
    })
    Promise.all([
      this.getSelectedData(),
      this.getNewData(),
      this.getExploreData()]).then(() => {
        this.setData({
          'tabs[0].topicList': this.myData.SelectedData,
          'tabs[2].topicList': this.myData.NewData,
          'tabs[3].topicList': this.myData.ExploreData,
        })
      })
  },

  onLoad() {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    this.getData()
  },

  onShow() {
    if (app.globalData.follow) {
      this.getSelectedData().then(() => {
        this.setData({
          'tabs[0].topicList': this.myData.SelectedData,
        })
      })
      app.globalData.follow = false
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
  reachBottom: function () {
    this.setData({
      reachBottom: true
    })
    //console.log('触底')
    const { activeTab } = this.data
    const { topicList } = this.data.tabs[activeTab]
    const showNum = topicList.length
    if (activeTab === 0) {
      topic.where(
        // _id: _.exists(true)
        _.or([{ star: true }, { posts: { _openid: '{openid}' } },
        { collector: '{openid}' }])
      ).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          topic.where(
            // _id: _.exists(true)
            _.or([{ star: true }, { posts: { _openid: '{openid}' } },
            { collector: '{openid}' }])
          ).orderBy('updatetime', 'desc').skip(showNum).get().then(res => {
            let new_data = res.data
            let old_data = topicList
            this.setData({
              'tabs[0].topicList': old_data.concat(new_data),
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
    else if (activeTab === 1) {
      this.setData({
        reachBottom: false
      })
    }
    else if (activeTab === 2) {
      topic.where({
        _id: _.exists(true)
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          topic.where({
            _id: _.exists(true)
          }).orderBy('updatetime', 'desc').skip(showNum).get().then(res => {
            let new_data = res.data
            let old_data = topicList
            this.setData({
              'tabs[2].topicList': old_data.concat(new_data),
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
    else if (activeTab === 3) {
      topic.where({
        num: _.lte(5)
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          topic.where({
            num: _.lte(5)
          }).orderBy('num', 'asc').orderBy('updatetime', 'desc').skip(showNum).get().then(res => {
            let new_data = res.data
            let old_data = topicList
            this.setData({
              'tabs[3].topicList': old_data.concat(new_data),
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.isClick = false
  },
})