const app = getApp()
const db = wx.cloud.database()
const question = db.collection('question')

let a = {
  "event":
  {
    "CreateTime": 1677316324,
    "Event": "wxa_media_check",
    "FromUserName": "oJ-6m5aJ3V8l-fq_MgUnOv81AYaQ",
    "MsgType": "event",
    "ToUserName": "gh_ebf8df85caf6",
    "appid": "wxe948b891c10e8a38",
    "detail": [{ "errcode": 0, "label": 100, "prob": 90, "strategy": "content_model", "suggest": "pass" }], "errcode": 0,
    "errmsg": "ok",
    "result": { "label": 100, "suggest": "pass" },
    "trace_id": "63f9d0e1-3696b72c-2e0abae0",
    "userInfo": { "appId": "wxe948b891c10e8a38", "openId": "oJ-6m5aJ3V8l-fq_MgUnOv81AYaQ" },
    "version": 2
  }
};


function matchLabel(labelNum) {
  switch (labelNum) {
    case 100:
      return '正常';
      break;
    case 10001:
      return '广告';
      break;
    case 20001:
      return '时政';
      break;
    case 20002:
      return '色情';
      break;
    case 20003:
      return '辱骂';
      break;
    case 20006:
      return '违法犯罪';
      break;
    case 20008:
      return '欺诈';
      break;
    case 20012:
      return '低俗';
      break;
    case 20013:
      return '版权';
      break;
    case 21000:
      return '其他';
      break;
  }
}
/**
 * 上传需要审核图片。审核不通过通过云函数getMediaCheckResult对图片进行删除
 * @param {*待审核图片列表} tempFiles 
 * @param {*page = this} page 
 */
function checkAndUploadManyImages(tempFiles, page) {
  console.log(tempFiles)
  wx.showLoading({
    title: '上传中',
    mask: true
  })

  for (var i = 0; i < tempFiles.length; i++) {
    const { tempFilePath } = tempFiles[i]
    wx.cloud.callFunction({
      name: 'checkContent',
      data: {
        value: wx.cloud.CDN({
          type: 'filePath',
          filePath: tempFilePath
        }),
        scene: 3 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
      },
      success: json => {
        console.log(json)
        const { traceId } = json.result.imageR

        wx.cloud.uploadFile({
          cloudPath: app.globalData.openId + '/' + traceId, // 上传至云端的路径
          filePath: tempFilePath, // 小程序临时文件路径
          success: res => {
            const { fileID } = res
            console.log('fileID', fileID)
            page.data.fileID.push(fileID)
            page.setData({
              fileID: page.data.fileID,
            })
            wx.hideLoading()
            wx.showToast({
              title: '上传成功 等待审核',
              icon: 'none'
            })
          },
          fail: err => {
            console.error('uploadFile err：', err)
            wx.hideLoading()
            wx.showToast({
              icon: 'error',
              title: '上传失败',
            })
          }
        })
      },
      fail: err => {
        console.log('checkContent err：', err)
      }
    })

  }
}

Page({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    tagsList: ['学习', '生活', '影视', '读书', '游戏', '音乐', '求(组队/资料…)', '我捡到…', '我丢了…',],

    titleContent: false,

    tagId: 1,
    tag: '学习',
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
  //0-2-1 tags标签 → 发布按钮的disable
  tagTap: function (e) {
    console.log(e)
    const { tagname } = e.detail
    console.log('tagname', tagname)
    this.setData({
      tag: tagname
    })
    if (this.data.tagId != 1 && this.data.tagsList.includes(tagname)) {
      this.setData({
        tagId: 1
      })
    }
  },
  tagInput: function (e) {
    const { value } = e.detail
    console.log('taginput', value)
    this.setData({
      tag: value,
      tagId: 0
    })
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
          title: '上传中',
          mask: true
        })
        checkAndUploadManyImages(res.tempFiles, this)
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
  /**
   * 审核文字，发布审核通过后的帖子
   * @param {*传入的表单} e 
   */
  formSubmit(e) {
    wx.showLoading({
      title: '审核中',
      mask: true
    })
    const { title } = e.detail.value;
    const { body } = e.detail.value;
    const { tag } = this.data;

    let that = this

    wx.cloud.callFunction({
      name: 'checkContent',
      data: {
        txt: title + body + tag,
        scene: 3 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
      }
    }).then((res) => {
      console.log(res)
      const { label } = res.result.msgR.result
      const { suggest } = res.result.msgR.result
      if (suggest === 'risky') {
        wx.hideLoading()
        wx.showToast({
          title: '危险：包含' + matchLabel(label) + '信息！',
          icon: 'none'
        })
      } else if (suggest === 'review') {
        wx.hideLoading()
        wx.showToast({
          title: '包含' + matchLabel(label) + '信息，建议调整相关表述',
          icon: 'none'
        })
      } else {
        app.globalData.isAsk = true
        var d = new Date().getTime();
        question.add({
          data: {
            //时间
            answerTime: 0,

            time: d,

            image: that.data.fileID,

            unknown: that.data._unknown,
            nickName: app.globalData.nickName,
            avatarUrl: app.globalData.avatarUrl,

            title: title,
            body: body,

            tagId: that.data.tagId,
            tag: tag,

            watched: 1,

            commentNum: 0,
            commenter: [],

            message: 0,

            collector: [],
            collectNum: 0,

            warner: [],
            warnerDetail: [],

            solved: false,

            isAuthentic: app.globalData.isAuthentic,
          },
        }).then((res) => {
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '发布成功',
          })
          setTimeout(function () { wx.navigateBack(); }, 1500);
        })
      }
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
          fileID: this.data.fileID,
        })
        wx.cloud.deleteFile({
          fileList: [id],
          success: res => {
            console.log('成功删除', res)
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