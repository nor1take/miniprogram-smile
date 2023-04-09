const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const traceId = db.collection('traceId')
const systemMsg = db.collection('systemMsg')
const userInfo = db.collection('userInfo')

var systemMsgNum = 0

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
 * 触发图片审核
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
    /**
     * 1、触发审核，获取traceId
     */
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
    tagsList: [
      '#4 耳机分你一半',
      '音乐',
      '学习',
      '#3 令你心动的offer',
      '生活',
      '美食',
      '恋爱',
      '读书',
      '游戏',
      '摄影',
      '闲置',
      '组队',
      '我捡到…',
      '我丢了…',
    ],

    titleContent: false,

    tagId: 1,
    tag: '#4 耳机分你一半',
    _unknown: false,
    focus: false,

    fileID: [],

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
  },

  goToRichtext: function () {
    wx.navigateTo({
      url: '../1-2-1 editor/editor',
    })
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
  //固定标签
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

  //自定义标签
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
        checkAndUploadManyImages(res.tempFiles, this)
      },
      fail: err => {
        console.log(err)
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
    console.log(e.detail.value)
    const { value } = e.detail
    this.setData({
      _unknown: value
    })
  },
  /**
   * 点击发布按钮
   * @param {*传入的表单} e 
   */
  formSubmit(e) {

    let that = this

    const { title } = e.detail.value;
    const { body } = e.detail.value;
    const { tag } = that.data;


    //ChatGPT 内测使用：限制提问文字长度
    const prompt = title + body
    if (tag == 'ChatGPT') {
      if (prompt.length > 300) {
        wx.showToast({
          title: '字数超过 300 字',
          icon: 'none'
        })
        return;
      }
    }

    wx.requestSubscribeMessage({
      tmplIds: ['TV_8WCCiyJyxxSar0WTIwJjY_S4BxvAITzaRanOjXWQ'],
      complete(res1) {
        console.log(res1)
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
                          console.log(res)
                          /**
                           * 2、删除上传图片列表中违规图片
                           */
                          deleteInvalidImages(that.data.fileID, res.data).then((res) => {
                            console.log('deleteInvalidImages', res)
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
                              console.log(err)
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
                      const { _id } = res

                      //ChatGPT内测使用：tag为ChatGPT时发布评论
                      if (tag == 'ChatGPT') {
                        /**
                         * 云函数
                         */
                        // wx.cloud.callFunction({
                        //   name: 'gptComment',
                        //   data: {
                        //     prompt: prompt,
                        //     postId: _id
                        //   },
                        // })
                        
                        /**
                         * 本地函数
                         */
                        //that.gptsentComment(prompt, _id)
                      }

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
                              setTimeout(function () { wx.navigateBack(); }, 1500);
                            }).catch((err) => {
                              console.log(err)
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

  //ChatGPT内测使用：审核 completion
  gptsentComment: function (prompt, postId) {
    let that = this
    wx.request({
      url: 'https://n58770595y.zicp.fun/gpt',
      data: {
        prompt: prompt
      },
      timeout: 60000000,
      success(res) {
        console.log(res.data)
        const completion = res.data
        wx.cloud.callFunction({
          name: 'checkContent',
          data: {
            txt: completion,
            scene: 2 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
          },
          success(_res) {
            console.log(_res)
            if (_res.result.msgR) {
              const { label } = _res.result.msgR.result
              const { suggest } = _res.result.msgR.result
              if (suggest === 'risky') {
                that.sendCompletion('[危险：包含' + matchLabel(label) + '信息！]', postId)
              } else if (suggest === 'review') {
                console.log('可能包含' + matchLabel(label) + '信息')
                that.sendCompletion('[可能包含' + matchLabel(label) + '信息]：' + completion, postId)
              } else {
                that.sendCompletion(completion, postId)
              }
            } else {
              that.sendCompletion(completion, postId)
            }
          },
          fail(_res) {
            console.log('checkContent云函数调用失败', _res)
          }
        })
      },
      fail(err) {
        console.log(err.data)
      }
    })
  },

  //ChatGPT内测使用：发布 completion
  sendCompletion: function (completion, postId) {
    var d = new Date().getTime()


    question.doc(postId).update({ data: { commentNum: _.inc(1) } })
    question.doc(postId).get().then(res => {
      console.log(res)
      //console.log(res[0].data)
      console.log(res.data)
      console.log(res.data.title)
      const { title } = res.data
      const posterId = res.data._openid
      wx.cloud.callFunction({
        name: 'sendMsg',
        data: {
          receiver: posterId,
          questionId: postId,
          sender: 'ChatGPT',
          commentBody: completion,
          postTitle: title
        }
      })
      comment.add({
        data: {
          //时间
          time: d,

          isUnknown: false,
          questionId: postId,
          questionTitle: title,
          posterId: posterId,

          body: completion,
          commentNum: 0,
          nickname: 'ChatGPT',
          image: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/oJ-6m5axZUm5_3cDLwmUjyA0Jwvs/avatar1680586472951',

          commenter: [],
          liker: [],
          likerNum: 0,
          image_upload: [],

          isAuthentic: true,
          idTitle: '内测版',

          warner: [],
          warnerDetail: [],
        },
      })
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
    systemMsgNum = 0;
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
  onUnload: function () {
    console.log('onUnload')
    wx.clearStorageSync()
  }
})