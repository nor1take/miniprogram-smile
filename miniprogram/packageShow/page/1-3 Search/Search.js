// pages/Search/Search.js
const app = getApp()
const db = wx.cloud.database()
const $ = db.command.aggregate
const _ = db.command
const question = db.collection('question')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',
    inputValue: '',
    reachBottom: false,
    isDone: false,

    top: app.globalData.top,
    left: app.globalData.left,
    right: app.globalData.right,
    bottom: app.globalData.bottom,

    tabs: [
      { id: 1, name: '热门', questionList: [] },
      { id: 2, name: '最新', questionList: [] },
    ],
    activeTab: 0,
  },

  //0-1 搜索框的输入状态，更新searchList数组数据
  input: function (e) {
    if (e.detail.value == '') {
      this.setData({
        searchList: [],
        reachBottom: false,
        isBottom: false,
        isDone: false
      })
    }
  },

  getHotData(value) {
    return new Promise((resolve) => {
      var now = new Date().getTime();
      question
        .aggregate()
        .match(
          _.or([
            { title: db.RegExp({ regexp: value, options: 'i', }) },
            { body: db.RegExp({ regexp: value, options: 'i', }), },
            { tag: db.RegExp({ regexp: value, options: 'i', }), }
          ])
        )
        .project({
          _id: 1,
          tag: 1,

          title: 1,
          body: 1,

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
          const list = this.highlightValue(value, res.list)
          this.tmp0 = { data0: list }
        })
    })
  },
  getNewData(value) {
    return new Promise((resolve) => {
      question.where(
        _.or([
          { title: db.RegExp({ regexp: value, options: 'i', }) },
          { body: db.RegExp({ regexp: value, options: 'i', }), },
          { tag: db.RegExp({ regexp: value, options: 'i', }), }
        ])
      ).orderBy('time', 'desc')
        .get()
        .then(res => {
          //console.log(res.data)
          resolve()
          const list = this.highlightValue(value, res.data)
          this.tmp1 = { data1: list }
        }).catch(err => {
          //console.log(err)
        })
    })
  },

  highlightValue(value, list) {
    const searchList = list.map(item => {
      // Highlight the matched keyword in title, body, and tag
      const highlightedTitle = item.title.replace(new RegExp(value, 'gi'), '<span class="highlight">$&</span>');
      const highlightedBody = item.body.replace(new RegExp(value, 'gi'), '<span class="highlight">$&</span>');
      const highlightedTag = item.tag.replace(new RegExp(value, 'gi'), '<span class="highlight">$&</span>');

      return {
        ...item,
        highlightedTitle,
        highlightedBody,
        highlightedTag
      };
    });
    return searchList

  },

  //1-1 获取、查询数据库数据：[搜索]按钮
  confirm: function (e) {
    const { value } = e.detail;

    if (value != '') {
      Promise.all([
        this.getHotData(value),
        this.getNewData(value)
      ]).then(() => {
        this.setData({
          'tabs[0].questionList': this.tmp0.data0,
          'tabs[1].questionList': this.tmp1.data1,
          inputValue: value,
          isDone: true
        })
      })
    } else {
      this.setData({ isDone: true });
    }
  },

  //2 点击，跳转到Detail页面
  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.openId)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
  onLoad: function (options) {
  },

  onUnload: function () {
    app.globalData.isClick = false
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.setData({
      reachBottom: true
    })
    //console.log('触底')
    const questionList = this.data.searchList
    const value = this.data.inputValue
    const showNum = questionList.length
    question.where(
      _.or([
        {
          time: _.lte(questionList[0].time),
          title: db.RegExp({
            regexp: value,
            options: 'i',
          })
        },
        {
          time: _.lte(questionList[0].time),
          body: db.RegExp({
            regexp: value,
            options: 'i',
          }),
        },
        {
          time: _.lte(questionList[0].time),
          tag: db.RegExp({
            regexp: value,
            options: 'i',
          }),
        }
      ])
    ).count().then((res) => {
      if (showNum < res.total) {
        this.setData({
          isBottom: false,
        })
        question.where(_.or([
          {
            time: _.lt(questionList[showNum - 1].time),
            title: db.RegExp({
              regexp: value,
              options: 'i',
            })
          },
          {
            time: _.lt(questionList[showNum - 1].time),
            body: db.RegExp({
              regexp: value,
              options: 'i',
            }),
          },
          {
            time: _.lt(questionList[showNum - 1].time),
            tag: db.RegExp({
              regexp: value,
              options: 'i',
            }),
          }
        ])).orderBy('time', 'desc').get().then(res => {

          const searchList = res.data.map(item => {
            // Highlight the matched keyword in title, body, and tag
            const highlightedTitle = item.title.replace(new RegExp(value, 'gi'), '<span class="highlight">$&</span>');
            const highlightedBody = item.body.replace(new RegExp(value, 'gi'), '<span class="highlight">$&</span>');
            const highlightedTag = item.tag.replace(new RegExp(value, 'gi'), '<span class="highlight">$&</span>');

            return {
              ...item,
              highlightedTitle,
              highlightedBody,
              highlightedTag
            };
          });

          let new_data = searchList
          let old_data = questionList
          this.setData({
            searchList: old_data.concat(new_data),
          })
        })
      }
      else {
        this.setData({
          isBottom: true
        })
      }
    })
  },
})