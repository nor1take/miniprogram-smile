const app = getApp()
const db = wx.cloud.database()
const question = db.collection('question')

function uploadManyImages(tempFiles, page) {
  let onlyString
  for (var i = 0; i < tempFiles.length; i++) {
    onlyString = new Date().getTime().toString()
    wx.cloud.uploadFile({
      cloudPath: app.globalData.openId + '/' + onlyString + '.png', // 上传至云端的路径
      filePath: tempFiles[i].tempFilePath, // 小程序临时文件路径
      success: res => {
        page.data.fileID.push(res.fileID)
        console.log(1)
        // 返回文件 ID
        page.setData({
          fileID: page.data.fileID
        })
        wx.hideLoading()
        wx.showToast({
          title: '上传成功',
        })
        console.log(page.data.fileID)
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
  }
}
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

    fileID: [],

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
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
      count: 9,
      sizeType: ['original', 'compressed'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        wx.showLoading({
          title: '上传中'
        })
        console.log(res.tempFiles)
        uploadManyImages(res.tempFiles, this)
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
    var d = new Date().getTime();
    question.add({
      data: {
        //时间
        answerTime: 0,

        time: d,

        image: this.data.fileID,

        unknown: this.data._unknown,
        nickName: app.globalData.nickName,
        avatarUrl: app.globalData.avatarUrl,

        title: e.detail.value.title,
        body: e.detail.value.body,

        tabsId: this.data.id,
        tabs: this.data.tabs,

        watched: 1,

        commentNum: 0,
        commenter: [],

        message: 0,

        collector: [],
        collectNum: 0,

        warner: [],
        warnerDetail: [],

        solved: false,

        isAuthentic: app.globalData.isAuthentic
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
        wx.showToast({
          title: '删除成功',
          icon: 'none'
        })
        this.setData({
          fileID: this.data.fileID
        })
        wx.cloud.deleteFile({
          fileList: [id],
          success: res => {
            console.log('成功删除', res.tempFilePath)
          },
          fail: err => {
            console.log(err)
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
})