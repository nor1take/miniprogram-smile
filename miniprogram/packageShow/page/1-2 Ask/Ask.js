const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const traceId = db.collection('traceId')
const systemMsg = db.collection('systemMsg')
const userInfo = db.collection('userInfo')
const topic = db.collection('topic')

var systemMsgNum = 0

const check = require('../../check.js');


Page({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  data: {
    tag: '生活',
    tagsList: [
      '生活',
      '学习',
      '闲置',
      '毕业',
      '考研',
      '暑假',
      '实习',
      '组队',
      '音乐',
      '美食',
      '游戏',
      '恋爱',
      '读书',
      '摄影',
      '我捡到…',
      '我丢了…',
      '#3 令你心动的offer',
    ],
    titleContent: false,

    tagId: 1,

    _unknown: false,
    focus: false,

    fileID: [],

    top: app.globalData.top,
    left: app.globalData.left,
    right: app.globalData.right,
    bottom: app.globalData.bottom,
  },

  goToRichtext: function () {
    wx.navigateTo({
      url: '../1-2-1 editor/editor?tag=' + this.data.tag,
    })
  },

  //0-1 标题的输入状态，更新titleContent数据 → 发布按钮的disable
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

  myData: {},

  body: function (e) {
    const { value } = e.detail
    this.myData.body = value
  },
  //固定标签
  tagTap: function (e) {
    //console.log(e)
    const { tag } = e.detail
    this.myData.tag = tag
    //console.log('tag', tag)
    this.setData({
      tag
    })
    if (this.data.tagId != 1 && this.data.tagsList.includes(tag)) {
      this.setData({
        tagId: 1
      })
    }
  },

  //自定义标签
  tagInput: function (e) {
    const { value } = e.detail
    this.myData.tag = value
    //console.log('taginput', value)
    this.setData({
      tag: value,
      tagId: 0
    })
  },


  //2-1 写入数据库：上传图片
  upload: function (e) {
    wx.chooseMedia({
      count: 9,
      sizeType: ['original', 'compressed'],
      // sizeType: ['compressed'],
      // sizeType: ['original'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        check.checkAndUploadManyImages(res.tempFiles, this)
      },
      fail: err => {
        //console.log(err)
      },
    })
  },
  switchChange: function (e) {
    if (systemMsgNum > 10) {
      wx.showToast({
        title: '请不要频繁操作',
        icon: 'error'
      })
    } else {
      systemMsgNum++;
    }

    //console.log(e.detail.value)
    const { value } = e.detail
    this.myData.isUnknown = value

    this.setData({
      _unknown: value
    })
  },
  /**
   * 点击发布按钮
   * @param {*传入的表单} e 
   */
  formSubmit(e) {
    this.myData.isSendPost = true


    let that = this

    const { title } = e.detail.value;
    const { body } = e.detail.value;
    const { tag } = that.data;

    //console.log(tag)

    wx.requestSubscribeMessage({
      tmplIds: ['TV_8WCCiyJyxxSar0WTIwJjY_S4BxvAITzaRanOjXWQ'],
      complete(res1) {
        //console.log(res1)
        wx.showLoading({
          title: '审核中',
          mask: true
        })

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
                  txt: title + body + tag,
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
                }
                else if (suggest === 'review') {
                  wx.hideLoading()
                  wx.showToast({
                    title: '可能包含' + check.matchLabel(label) + '信息，建议调整相关表述',
                    icon: 'none'
                  })
                }
                else {
                  app.globalData.isAsk = true
                  var d = new Date().getTime();
                  if (systemMsgNum > 10 && app.globalData.isAuthentic && app.globalData.isManager) {
                    systemMsg.add({
                      data: {
                        time: d,
                        image: that.data.fileID,
                        title: title,
                        body: body,
                        postList: [
                          { postId: '', postTitle: '' }
                        ],
                      }
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
                            systemMsg.doc(_id).update({
                              data: {
                                image: res
                              }
                            }).then(() => {
                              wx.hideLoading()
                              wx.showToast({
                                title: '发布成功',
                              })
                              setTimeout(function () { wx.navigateBack(); }, 1500);
                            }).catch((err) => {
                              //console.log(err)
                            })
                          })
                        })
                    })
                  } else {


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
                        watcher: [],

                        commentNum: 0,
                        commenter: [],

                        message: 0,

                        collector: [],
                        collectNum: 0,

                        liker: [],
                        postLikeNum: 0,

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
                      //console.log(res)
                      let { _id } = res
                      topic.where({
                        tag: tag
                      }).get().then(res => {
                        console.log(res.data)
                        if (res.data.length == 0) {
                          topic.add({
                            data: {
                              tag: tag,
                              updatetime: d,
                              posts: [{
                                _id: _id,
                                _openid: app.globalData.openId,
                                nickName: app.globalData.nickName,
                                time: d,
                                title: title,
                                unknown: that.data._unknown
                              }],
                              num: 1,
                            }
                          })
                        } else {
                          topic.where({
                            tag: tag
                          })
                            .update({
                              data: {
                                updatetime: d,
                                posts: _.push({
                                  each: [{
                                    _id: _id,
                                    _openid: app.globalData.openId,
                                    nickName: app.globalData.nickName,
                                    time: d,
                                    title: title,
                                    unknown: that.data._unknown
                                  }],
                                  position: 0
                                }),
                                num: _.inc(1),
                              }
                            })
                        }
                      })

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
                            if (res && res.length > 0) {
                              topic.where({
                                tag: tag
                              }).update({
                                data: {
                                  image: res[0]
                                }
                              })
                            }
                            question.doc(_id).update({
                              data: {
                                image: res
                              }
                            }).then(() => {
                              wx.hideLoading()
                              wx.showToast({
                                title: '发布成功',
                              })
                              setTimeout(function () { wx.navigateBack(); }, 1500);
                            }).catch((err) => {
                              //console.log(err)
                            })
                          })
                        })
                    })
                  }

                }
              })
            }
          })
      }
    })
  },

  //点击图片删除
  imageTap: function (e) {
    //console.log(e)
    const { index } = e.currentTarget.dataset
    const { id } = e.currentTarget
    wx.showActionSheet({
      itemList: ['删除'],
      itemColor: '#FA5151',
      success: res => {
        //console.log(res.tapIndex)
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
            //console.log('成功删除', res)
          },
          fail: err => {
            //console.log(err)
          }
        })
      },
      fail(res) {
        //console.log(res.errMsg)
      }
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

  onLoad: function (options) {
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
  },

  focus: function () {
    this.setData({
      focus: true
    })
    //console.log('focus')
  },
  onReady: function () {
    setTimeout(this.focus, 250)
  },
  onShow() {
    wx.getStorage({
      key: 'post'
    }).then(res => {
      wx.showToast({
        title: '已恢复到上次的编辑',
        icon: 'none'
      })
      console.log(res.data)
      const post = JSON.parse(res.data)

      const { title, body, imgList, tag, isUnknown } = post
      this.myData = {
        title, body, imgList, tag, isUnknown
      }
      this.setData({
        activeTag: -1,
        value: tag,
        tag: tag,
        titleValue: title,
        bodyValue: body,
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
    const { title, body, isUnknown } = this.myData
    const imgList = this.data.fileID
    const { tag } = this.data

    if (!((title && title.length > 0) || (body && body.length > 0) || imgList.length > 0)) {
      wx.removeStorage({
        key: 'post',
      })
      return
    }

    const post = {
      title, body, tag, isUnknown, imgList
    }

    console.log(post)

    wx.setStorage({
      key: 'post',
      data: JSON.stringify(post),
    }).then(() => {
      wx.showToast({
        title: '已自动保存',
      })
    })
  },
  onUnload: function () {
    if (!this.myData.isSendPost) {
      this.setStorage()
    } else {
      wx.removeStorage({
        key: 'post',
      })
      this.myData.isSendPost = false
    }
  },
  onHide() {
    this.setStorage()
    console.log('onHide')
  }
})