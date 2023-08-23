// packageMy/pages/3-0 MySpace/MySpace.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const userInfo = db.collection('userInfo')

Page({
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
    top: app.globalData.top,
    bottom: app.globalData.bottom,

    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    openId: app.globalData.openId,

    isSelf: false,

    tabs: [
      { id: 0, name: '发帖', questionList: [] },
      { id: 1, name: '回应', questionList: [] },
    ],
    activeTab: 0,


    avatarUrl: '',
    nickName: '',
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
  },

  imageTap: function (e) {
    //console.log(e.currentTarget.dataset.src)
    wx.previewImage({
      urls: [e.currentTarget.dataset.src],
    })
  },

  collectAdd() {
    wx.showToast({
      title: '关注成功',
      icon: 'none'
    })
    const { user } = this.data
    if (user[0].collector) {
      user[0].collector.push({
        nickname: app.globalData.nickName,
        openid: app.globalData.openId,
        avatarUrl: app.globalData.avatarUrl
      })
    } else {
      user[0].collector = [{
        nickname: app.globalData.nickName,
        openid: app.globalData.openId,
        avatarUrl: app.globalData.avatarUrl
      }]
    }

    this.setData({
      user
    })
    userInfo.where({
      _openid: app.globalData.openId
    }).update({
      data: {
        following: _.addToSet({
          nickname: user[0].nickName,
          openid: app.globalData.otherOpenId,
          avatarUrl: user[0].avatarUrl
        }),
      }
    })
    userInfo.where({
      _openid: app.globalData.otherOpenId
    }).update({
      data: {
        collector: _.addToSet({
          nickname: app.globalData.nickName,
          openid: app.globalData.openId,
          avatarUrl: app.globalData.avatarUrl
        }),
      }
    })
  },
  collectCancel() {
    wx.showToast({
      title: '取消关注',
      icon: 'none'
    })
    const { user } = this.data

    user[0].collector = user[0].collector.filter(item => item.openid !== app.globalData.openId);

    this.setData({
      user
    })

    userInfo.where({
      _openid: app.globalData.otherOpenId
    }).update({
      data: {
        collector: _.pull({ openid: app.globalData.openId }),
      }
    })

    userInfo.where({
      _openid: app.globalData.openId
    }).update({
      data: {
        following: _.pull({ openid: app.globalData.otherOpenId }),
      }
    })
  },



  getPostNum: function () {
    return new Promise((resolve) => {
      question.where({
        _openid: app.globalData.otherOpenId
      }).count().then(res => {
        resolve()
        this.PostNum = { PostNum: res.total }
      })
    })
  },

  getCommentNum: function () {
    return new Promise((resolve) => {
      comment.where({
        _openid: app.globalData.otherOpenId,
        posterId: _.neq(app.globalData.otherOpenId)
      }).count().then(res => {
        resolve()
        this.CommentNum = { CommentNum: res.total }
      })
    })
  },

  getPostList: function () {
    return new Promise((resolve) => {
      question.where({
        _openid: app.globalData.otherOpenId
      }).orderBy('time', 'desc').get().then(res => {
        resolve()
        this.postList = { postList: res.data }
      })
    })
  },

  getCommentList: function () {
    return new Promise((resolve) => {
      comment.where({
        _openid: app.globalData.otherOpenId,
        posterId: _.neq(app.globalData.otherOpenId)
      }).orderBy('time', 'desc').get().then(res => {
        //console.log(res.data)
        resolve()
        this.commentList = { commentList: res.data }
      })
    })
  },

  getUserInfo() {
    return new Promise((resolve) => {
      userInfo.where({
        _openid: app.globalData.otherOpenId
      }).get().then(res => {
        //console.log(res.data)
        if (res.data.length == 0) {
          wx.navigateBack()
        }
        resolve()
        this.user = { user: res.data }
      })
    })
  },

  beWatched: function (e) {
    app.globalData.questionId = e.currentTarget.id
    app.globalData.questionIndex = e.currentTarget.dataset.index

    wx.navigateTo({
      url: '../../../packageShow/page/1-1 Detail/Detail',
    })
    question.doc(e.currentTarget.id).update({
      data: {
        // watched: _.inc(1)
        watcher: _.addToSet(app.globalData.otherOpenId)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { openid } = options
    if (openid) {
      app.globalData.otherOpenId = openid
    }
    this.setData({
      isSelf: app.globalData.otherOpenId == app.globalData.openId
    })
    //console.log(this.data.isSelf)
    Promise.all([
      this.getUserInfo(),
      this.getPostList(),
      this.getCommentList(),
      this.getCommentNum(),
      this.getPostNum()
    ]).then(() => {
      this.setData({
        postList: this.postList.postList,
        commentList: this.commentList.commentList,
        user: this.user.user,
        'tabs[0].name': this.data.tabs[0].name + " " + this.PostNum.PostNum,
        'tabs[1].name': this.data.tabs[1].name + " " + this.CommentNum.CommentNum
      })
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

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
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    app.globalData.isClick = false
    app.globalData.otherOpenId = app.globalData.openId
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
  onShareAppMessage() {

  },

  reachBottom: function () {
    this.setData({
      reachBottom: true
    })
    const { activeTab, postList, commentList } = this.data
    if (activeTab === 0) {
      const questionList = postList
      const showNum = questionList.length
      question.where({
        _openid: app.globalData.otherOpenId
      }).count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          question.where({
            _openid: app.globalData.otherOpenId
          }).orderBy('time', 'desc').skip(showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              postList: old_data.concat(new_data),
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
      const questionList = commentList
      const showNum = questionList.length
      comment.where({
        _openid: app.globalData.otherOpenId,
        posterId: _.neq(app.globalData.otherOpenId)
      }).orderBy('time', 'desc').count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false
          })
          comment.where({
            _openid: app.globalData.otherOpenId,
            posterId: _.neq(app.globalData.otherOpenId)
          }).orderBy('time', 'desc').skip(showNum).get().then(res => {
            let new_data = res.data
            let old_data = questionList
            this.setData({
              commentList: old_data.concat(new_data),
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
})