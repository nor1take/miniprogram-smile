const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const traceId = db.collection('traceId')
const systemMsg = db.collection('systemMsg')
const userInfo = db.collection('userInfo')

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
 * 删除已上传图片列表中的违规图片，并移除traceId对象
 * @param {已上传图片列表} fileIds 
 * @param {*违规图片集合} cloudFileIds 
 */
async function deleteInvalidImages(fileIds, cloudFileIds) {
  return new Promise(async function (resolve, reject) {
    try {
      const promises = [];
      let fileIdsWithoutCommon = [];
      promises.push(new Promise((resolve, reject) => {
        // 找到数组 fileIds 和数组 cloudFileIds 共有的元素
        const common = fileIds.filter((elementA) =>
          cloudFileIds.some((elementB) => elementA === elementB.fileId)
        );

        // 删除数组 fileIds 中的共有元素
        fileIdsWithoutCommon = fileIds.filter((elementA) =>
          !cloudFileIds.some((elementB) => elementA === elementB.fileId)
        );
        /**
         * 删除云存储中的违规图片
         */
        wx.cloud.deleteFile({
          fileList: common,
          success: res => {
            console.log(res)
            resolve();
          },
          fail: err => {
            console.log(err)
            reject(err);
          }
        })

        /**
         * 移除traceId对象
         */
        traceId.where({
          fileId: _.in(common)
        }).remove({
          success: res => {
            console.log(res)
            resolve();
          },
          fail: err => {
            console.log(err)
            reject(err);
          }
        })
      }));

      await Promise.all(promises);
      resolve(fileIdsWithoutCommon);
    } catch (error) {
      reject(error);
    }
  })
}

Page({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    formats: {},
    readOnly: false,
    placeholder: '补充说明你的帖子…',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    safeHeight: 0,
    toolBarHeight: 50,

    _unknown: false,
    tagId: 1,

    fileID: [],

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    tag: '#8 你向往的恋爱是什么样子的',
    tagsList: [
      '#8 你向往的恋爱是什么样子的',
      '恋爱',
      '生活',
      '美食',
      '音乐',
      '游戏',
      '学习',
      '读书',
      '摄影',
      '闲置',
      '组队',
      '我捡到…',
      '我丢了…',
      '#3 令你心动的offer',
    ],
  },

  switchChange: function (e) {
    console.log(e.detail.value)
    const { value } = e.detail
    this.setData({
      _unknown: value
    })
  },

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

  sendPost: function () {
    let that = this
    wx.requestSubscribeMessage({
      tmplIds: ['TV_8WCCiyJyxxSar0WTIwJjY_S4BxvAITzaRanOjXWQ'],
      complete(res1) {
        console.log(res1)
        wx.showLoading({
          title: '审核中',
          mask: true
        })
        const { title } = that.data;
        const { html } = that.data;
        const { text } = that.data;
        const { tag } = that.data;

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
                    title: '可能包含' + matchLabel(label) + '信息，建议调整相关表述',
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
                        console.log(res)
                        /**
                         * 2、删除上传图片列表中违规图片
                         */
                        deleteInvalidImages(that.data.fileID, res.data).then((res) => {
                          console.log('deleteInvalidImages', res)
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
                            console.log(err)
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

  title: function (e) {
    const { value } = e.detail
    if (value == '') {
      this.setData({
        title: value
      })
    }
    else {
      this.setData({
        title: value
      })
    }
  },

  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom,
      height: res.height
    })
    console.log(res)
  },

  loseFocus: function (e) {
    console.log(e.detail.html)
    console.log(e.detail.text)
    this.setData({
      html: e.detail.html,
      text: e.detail.text
    })
  },

  onLoad() {
    this.getRightTop()
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
  onShow() {
    console.log('onShow')
  },
  onHide() {
    console.log('onHide')
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
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
  },
  blur() {
    this.editorCtx.blur()
  },
  format(e) {
    const { name, value } = e.target.dataset
    if (!name) return
    // console.log('format', name, value)
    this.editorCtx.format(name, value)
  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({ formats })
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success() {
        console.log('insert divider success')
      }
    })
  },
  clear() {
    this.editorCtx.clear({
      success() {
        console.log('clear success')
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
        console.log(tempFilePath)

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
            /**
             * 2、将traceId作为图片的云存储路径
             */
            wx.cloud.uploadFile({
              cloudPath: traceId, // 上传至云端的路径
              filePath: tempFilePath, // 小程序临时文件路径
              success: res => {
                const { fileID } = res
                console.log('fileID', fileID)
                that.data.fileID.push(fileID)
                that.setData({
                  fileID: that.data.fileID,
                })
                that.editorCtx.insertImage({
                  src: fileID,
                  width: '100%',
                  success() {
                    console.log('insert image success')
                  }
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
      },
      fail: err => {
        console.log(err)
      },
    })
  },
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    })
  },
})
