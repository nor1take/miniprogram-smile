const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const traceId = db.collection('traceId')
const systemMsg = db.collection('systemMsg')
const userInfo = db.collection('userInfo')
const topic = db.collection('topic')

const check = require('../../check.js');
Page({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    editorCtx: null,
    formats: {},
    readOnly: false,
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    safeHeight: 0,
    toolBarHeight: 50,

    _unknown: false,
    tagId: 1,

    fileID: [],

    top: app.globalData.top,
    left: app.globalData.left,

    tag: '生活',
    tagsList: [
      '生活',
      '学习',
      '闲置',
      '毕业',
      '考研',
      '暑假',
      '实习',
      '音乐',
      '美食',
      '游戏',
      '恋爱',
      '读书',
      '摄影',
      '组队',
      '我捡到…',
      '我丢了…',
      '#3 令你心动的offer',
    ],
  },

  tagTap: function (e) {
    const { tag } = e.detail
    this.myData.tag = tag
    this.setData({
      tag: tag
    })
    if (this.data.tagId != 1 && this.data.tagsList.includes(tag)) {
      this.setData({
        tagId: 1
      })
    }
  },
  tagInput: function (e) {
    const { value } = e.detail
    this.myData.tag = value
    this.setData({
      tag: value,
      tagId: 0
    })
  },

  sendPost: function () {
    this.myData.isSendPost = true
    let that = this
    wx.requestSubscribeMessage({
      tmplIds: ['TV_8WCCiyJyxxSar0WTIwJjY_S4BxvAITzaRanOjXWQ'],
      complete(res1) {
        //console.log(res1)
        wx.showLoading({
          title: '审核中',
          mask: true
        })
        const { title, html, text, tag } = that.data;
        userInfo.where({
          _openid: '{openid}'
        }).get()
          .then((res) => {
            if (res.data[0].isForbidden) {
              wx.hideLoading()
              wx.navigateTo({
                url: '../../../packageLogin/pages/0-1 Forbidden/Forbidden',
              })
            } else {
              /**
               * 一、文字审核
               */
              wx.cloud.callFunction({
                name: 'checkContent',
                data: {
                  txt: title + text + tag,
                  scene: 3 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
                }
              }).then((res) => {
                //console.log(res)
                const { label } = res.result.msgR.result
                const { suggest } = res.result.msgR.result
                if (suggest === 'risky') {
                  wx.hideLoading()
                  wx.showToast({
                    title: '危险：包含' + check.matchLabel(label) + '信息！',
                    icon: 'none'
                  })
                } else if (suggest === 'review') {
                  wx.hideLoading()
                  wx.showToast({
                    title: '可能包含' + check.matchLabel(label) + '信息，建议调整相关表述',
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

                      isHTML: true,

                      unknown: that.data._unknown,
                      nickName: app.globalData.nickName,
                      avatarUrl: app.globalData.avatarUrl,

                      title: title,
                      body: text,
                      html: html,
                      image: that.data.fileID,

                      tagId: that.data.tagId,
                      tag: tag,

                      watched: 1,
                      watcher: [],

                      commentNum: 0,
                      commenter: [],

                      liker: [],
                      postLikeNum: 0,

                      message: 0,

                      collector: [],
                      collectNum: 0,

                      warner: [],
                      warnerDetail: [],

                      solved: false,

                      isAuthentic: app.globalData.isAuthentic,
                      idTitle: app.globalData.idTitle
                    },
                  }).then((res) => {
                    /**
                     * 二、图片审核：处理异步检测结果推送
                     */

                    /**
                     * 1、拿到全部的traceId集合（违规图片集合）
                     */
                    const { _id } = res
                    traceId.orderBy('CreateTime', 'desc').get()
                      .then((res) => {
                        //console.log(res)
                        /**
                         * 2、删除上传图片列表中违规图片
                         */
                        check.deleteInvalidImages(that.data.fileID, res.data).then((res) => {
                          //console.log('check.deleteInvalidImages', res)
                          /**
                           * 3、更新图片列表
                           */
                          question.doc(_id).update({
                            data: {
                              image: res
                            }
                          }).then(() => {
                            wx.hideLoading()
                            wx.showToast({
                              title: '发布成功',
                            })
                            setTimeout(function () {
                              wx.switchTab({
                                url: '../../../pages/0-0 Show/Show'
                              })
                            }, 1500);
                          }).catch((err) => {
                            //console.log(err)
                          })
                        })
                      })
                  })

                }
              })
            }
          })
      }
    })
  },

  myData: {},

  title: function (e) {
    const { value } = e.detail
    this.myData.title = value
    const { titleContent } = this.data
    if (value == '' && titleContent) {
      this.setData({
        titleContent: false
      })
    }
    else if (!titleContent) {
      this.setData({
        titleContent: true
      })
    }
    // //console.log('title',this.data.titleContent)
  },

  body: function (e) {
    const { html, text, delta } = e.detail
    this.myData = {
      html, text, delta
    }
  },


  loseFocus: function (e) {
    //console.log(e.detail.html)
    //console.log(e.detail.text)
    this.setData({
      html: e.detail.html,
      text: e.detail.text
    })
  },

  getTopic() {
    topic.where({
      tag: _.neq('AI')
    })
      .orderBy('updatetime', 'desc')
      .orderBy('num', 'desc')
      .get().then((res) => {
        //console.log(res.data)
        const tagsList = res.data.map(item => item.tag);
        this.setData({
          tagsList,
        })
        if (this.data.activeTag != -1) {
          this.setData({
            tag: tagsList[0]
          })
        }
      })
  },

  onLoad(options) {
    const { tag } = options
    //console.log(tag)
    if (tag) {
      this.setData({
        activeTag: -1,
        value: tag,
        tag: tag
      })
      //console.log('>>> ' + this.data.tag)
    }
    this.getTopic()
    this.setData({
      theme: wx.getSystemInfoSync().theme || 'light'
    })

    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => {
        this.setData({ theme })
      })
    }
    const {
      platform, safeArea, screenHeight
    } = wx.getSystemInfoSync()
    let safeHeight
    if (safeArea) {
      safeHeight = (screenHeight - safeArea.bottom)
    } else {
      safeHeight = 32
    }
    this._safeHeight = safeHeight
    const isIOS = platform === 'ios'
    this.setData({ isIOS, safeHeight, toolBarHeight: isIOS ? safeHeight + 50 : 50 })
    this.updatePosition(0)
  },

  updatePosition(keyboardHeight) {
    const toolbarHeight = 50
    const { windowHeight } = wx.getSystemInfoSync()
    let editorHeight = windowHeight
    if (keyboardHeight > 0) {
      editorHeight = windowHeight - keyboardHeight - toolbarHeight
    }
    if (keyboardHeight === 0) {
      this.setData({
        editorHeight,
        keyboardHeight,
        toolBarHeight: this.data.isIOS ? 50 + this._safeHeight : 50,
        safeHeight: this._safeHeight,
      })
    } else {
      this.setData({
        editorHeight,
        keyboardHeight,
        toolBarHeight: 50,
        safeHeight: 0,
      })
    }
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync()
    const { statusBarHeight, platform } = systemInfo
    const isIOS = platform === 'ios'
    const navigationBarHeight = isIOS ? 44 : 48
    return statusBarHeight + navigationBarHeight
  },
  onEditorReady() {
    let that = this;
    wx.createSelectorQuery().select('#editor').context((res) => {
      that.editorCtx = res.context;
      that.editorCtx.setContents({
        delta: that.myData.delta
      })
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    const { name, value } = e.target.dataset
    if (!name) return
    // //console.log('format', name, value)
    this.editorCtx.format(name, value)
  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success() {
        //console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success() {
        //console.log('clear success')
      }
    })
  },
  removeFormat() {
    this.editorCtx.removeFormat()
  },
  insertDate() {
    const date = new Date()
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.editorCtx.insertText({
      text: formatDate
    })
  },
  insertImage() {
    const that = this
    wx.chooseMedia({
      count: 1,
      sizeType: ['original', 'compressed'],
      // sizeType: ['compressed'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        wx.showLoading({
          title: '上传中',
          mask: true
        })
        //checkAndUploadManyImages(res.tempFiles, this)
        const { tempFilePath } = res.tempFiles[0]
        //console.log(tempFilePath)

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
            //console.log(json)
            const { traceId } = json.result.imageR
            /**
             * 2、将traceId作为图片的云存储路径
             */
            wx.cloud.uploadFile({
              cloudPath: traceId, // 上传至云端的路径
              filePath: tempFilePath, // 小程序临时文件路径
              success: res => {
                const { fileID } = res
                //console.log('fileID', fileID)
                that.data.fileID.push(fileID)
                that.setData({
                  fileID: that.data.fileID,
                })
                that.editorCtx.insertImage({
                  src: fileID,
                  width: '100%',
                  success() {
                    //console.log('insert image success')
                  }
                })
                wx.hideLoading()
                wx.showToast({
                  title: '上传成功 等待审核',
                  icon: 'none'
                })
              },
              fail: err => {
                //console.error('uploadFile err：', err)
                wx.hideLoading()
                wx.showToast({
                  icon: 'error',
                  title: '上传失败',
                })
              }
            })
          },
          fail: err => {
            //console.log('checkContent err：', err)
          }
        })
      },
      fail: err => {
        //console.log(err)
      },
    })
  },

  onShow() {

    wx.getStorage({
      key: 'postHTML'
    }).then(res => {
      wx.showToast({
        title: '已恢复到上次的编辑',
        icon: 'none'
      })
      console.log(res.data)
      const post = JSON.parse(res.data)

      const { title, html, text, delta, tag, isUnknown, imgList } = post

      this.myData = {
        title, html, text, delta, tag, isUnknown
      }
      this.setData({
        html, text,
        activeTag: -1,
        value: tag,
        tag: tag,
        titleValue: title,
        title,
        fileID: imgList ? imgList : [],
        isChecked: isUnknown,
        _unknown: isUnknown,
        titleContent: title && title != ''
      })
    }).catch(err => {
      console.log('无缓存', err)
    })
  },
  setStorage() {
    const { title, html, text, delta, isUnknown } = this.myData
    const imgList = this.data.fileID
    const { tag } = this.data

    console.log(text)

    if (!((title && title.length > 0) || (text && text != '\n'))) {
      wx.removeStorage({
        key: 'postHTML',
      })
      return
    }

    const post = {
      title, html, text, delta, tag, isUnknown, imgList
    }
    wx.setStorage({
      key: 'postHTML',
      data: JSON.stringify(post),
    }).then((res) => {
      console.log(res)
      wx.showToast({
        title: '已自动保存',
      }).catch(err => {
        console.log(err)
      })
    })
  },
  onUnload: function () {
    if (!this.myData.isSendPost) {
      this.setStorage()
    } else {
      wx.removeStorage({
        key: 'postHTML',
      })
    }
  },
  onHide() {
    this.setStorage()
    console.log('onHide')
  }
})
