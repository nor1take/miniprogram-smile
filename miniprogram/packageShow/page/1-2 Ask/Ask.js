const app = getApp()
const db = wx.cloud.database()
const question = db.collection('question')
Page({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    titleContent: false,
    loading: false,

    id: 1,
    tabs: '学习',
    _unknown: false,
    focus: false,

    fileID:[]
  },

  //0-1 标题的输入状态，更新titleContent数据 → 发布按钮的disable
  title: function (e) {
    if (e.detail.value == '') {
      this.setData({
        titleContent: false
      })
    }
    else {
      this.setData({
        titleContent: true
      })
    }
    // console.log('title',this.data.titleContent)
  },
  //0-2-1 tags标签，更新id, tags数据 → 发布按钮的disable
  tapStudy: function (e) {
    this.setData({
      id: 1,
      tabs: '学习'
    })
  },
  tapLife: function (e) {
    this.setData({
      id: 2,
      tabs: '生活'
    })
  },
  tapLost: function (e) {
    this.setData({
      id: 3,
      tabs: '我丢了...'
    })
  },
  tapFind: function (e) {
    this.setData({
      id: 4,
      tabs: '我捡到...'
    })
  },
  tapAskfor: function (e) {
    this.setData({
      id: 5,
      tabs: '求...'
    })
  },
  tapDIY: function () {
    this.setData({
      id: 6,
      tabs: '其他'
    })
  },
  //0-2-2 自定义标签，更新tabs数据 → 发布按钮的disable
  tagsInput: function (e) {
    if (e.detail.value != '') {
      this.setData({
        tabs: e.detail.value
      })
    }
  },

  //1 获取右上角按钮数据
  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom
    })
  },

  //2-1 写入数据库：上传图片
  upload: function (e) {
    wx.chooseMedia({
      count: 1,
      sizeType: ['original', 'compressed'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        wx.showLoading({
          title: '上传中'
        })
        console.log(res.tempFiles)
        let randString = Math.floor(Math.random() * 1000000).toString()
        wx.cloud.uploadFile({
          cloudPath: app.globalData.openId + '/' + randString + '.png', // 上传至云端的路径
          filePath: res.tempFiles[0].tempFilePath, // 小程序临时文件路径
          success: res => {
            this.data.fileID.push(res.fileID)
            console.log(1)
            // 返回文件 ID
            this.setData({
              fileID: this.data.fileID
            })
            wx.hideLoading()
            wx.showToast({
              title: '上传成功',
            })
            // console.log('fileID: ', res.fileID)
            // console.log('cloudPath: ', cloudPath)
            console.log(this.data.fileID)
          },
          fail: err => {
            console.error('[上传文件] 失败：', err)
            wx.hideLoading()
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          }
        })
      },
      fail: err => {
        console.log(err)
      },
    })
  },
  switchChange: function (e) {
    console.log(e.detail.value)
    const { value } = e.detail
    this.setData({
      _unknown: value
    })
  },
  //2 写入数据库：[发布]按钮
  formSubmit(e) {
    app.globalData.isAsk = true
    this.setData({
      loading: true
    })
    var d = new Date();
    question.add({
      data: {
        //时间
        answerTime: '',
        Ayear: '',
        Amonth: '',
        Aday: '',
        Ah: '',
        Am: '',
        As: '',

        time: d,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
        h: d.getHours(),
        m: d.getMinutes(),
        s: d.getSeconds(),

        image: this.data.fileID,

        unknown: this.data._unknown,
        nickName: app.globalData.nickName,
        avatarUrl: app.globalData.avatarUrl,

        title: e.detail.value.title,
        body: e.detail.value.body,

        tabsId: this.data.id,
        tabs: this.data.tabs,

        watched: 0,
        
        commentNum: 0,
        commenter: [],
        message: 0,

        collector: [],
        collectNum: 0,

        warn: 0,
        warner: [],

        solved: false
      },
    }).then((res) => {
      console.log(res)
      this.setData({
        loading: false
      })
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(function () { wx.navigateBack(); }, 1500);
    })
  },

  //点击图片删除
  imageTap: function (e) {
    console.log(e)
    const { index } = e.currentTarget.dataset
    const { id } = e.currentTarget
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#FA5151',
      success: res => {
        console.log(res.tapIndex)
        this.data.fileID.splice(index, 1)
        this.setData({
          fileID: this.data.fileID
        })
        wx.cloud.deleteFile({
          fileList: [id],
          success: res => {
            console.log('成功删除', res.tempFilePath)
          },
          fail: err => {
            // handle error
          }
        })
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  onLoad: function (options) {
    this.getRightTop()
  },

  focus: function () {
    this.setData({
      focus: true
    })
    console.log('focus')
  },
  onReady: function () {
    setTimeout(this.focus, 250)
  },
    /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '提问',
    }
  }
})