const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
const traceId = db.collection('traceId')
const userInfo = db.collection('userInfo')
const deleteRecord = db.collection('deleteRecord')

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
        scene: 2 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
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

function deleteCommentCloudImage(list) {
  if (list.length > 0) {
    const arr = [].concat(...list.map(item => item.image_upload));
    wx.cloud.deleteFile({
      fileList: arr,
      success: res => {
        console.log('成功删除', res)
      },
      fail: err => {
        console.error(err)
      }
    })
  }
}

function deleteQuestionCloudImage(list) {
  wx.cloud.deleteFile({
    fileList: list[0].image,
    success: res => {
      console.log('成功删除', res)
    },
    fail: err => {
      console.error(err)
    }
  })

}

Page({
  /**
   * 页面的初始数据
   */
  options: {
    pureDataPattern: /^_/
  },
  data: {
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    isLogin: false,

    isAskChatGLM: false,

    isFold: true,
    sortWord: "按赞数",
    fileID: [],

    height: 0,
    colorGray: '#E7E7E7',
    colorGreen: '#07C160',
    colorYellow: '#F9A826',

    answer: false,
    inputContent: false,

    tapAnswerButton: true,
    tapReplyButton: false,
    tapAgainButton: false,

    isCollect: false,

    inputValue: '',
    holderValue1: '试试点亮右侧的logo >>>',
    holderValue2: '本次评论将会被 AI 回复',

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,

    _commentBody: ''
  },
  isAskChatGLM: function () {
    const { isAskChatGLM } = this.data
    if (isAskChatGLM) {
      wx.showToast({
        title: '已取消让 AI 回复评论',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '已选择让 AI 回复评论',
        icon: 'none',
        duration: 4000
      })
    }
    this.setData({
      isAskChatGLM: !isAskChatGLM
    })
  },

  goToLogin: function () {
    wx.navigateTo({
      url: '../../../packageLogin/pages/0-0 Login/Login',
    })
  },
  goToRegist: function () {
    wx.navigateTo({
      url: '../../../packageShow/page/1-2 Ask/Ask',
      // url: '../../../packageShow/page/1-2-2 regist/regist',
    })
  },
  fold: function () {
    const { isFold } = this.data
    if (isFold) {
      this.setData({
        isFold: false
      })
    }
    else {
      this.setData({
        isFold: true
      })
    }
  },
  NewCommentFirst: function () {
    comment.where({
      questionId: app.globalData.questionId
      /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
    }).orderBy('time', 'desc').
      get().then(res => {
        this.setData({
          commentList: res.data,
        })
      })
  },
  OldCommentFirst: function () {
    comment.where({
      questionId: app.globalData.questionId
      /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
    }).orderBy('time', 'asc').
      get().then(res => {
        this.setData({
          commentList: res.data,
          openId: app.globalData.openId
        })
      })
  },
  LikemostCommentFisrt: function () {
    comment.where({
      questionId: app.globalData.questionId
      /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
    }).orderBy('likerNum', 'desc').orderBy('time', 'asc').
      get().then(res => {
        this.setData({
          commentList: res.data,
          openId: app.globalData.openId
        })
      })
  },
  showActionSheetChange: function (word) {
    wx.showActionSheet({
      itemList: word,
      itemColor: '#0C88B5',
    })
      .then((res) => {
        if (res.tapIndex === 0) {
          wx.showToast({
            title: '“最新回应”优先',
            icon: 'none',
            duration: 1500
          })
          this.NewCommentFirst()
          this.setData({
            sortWord: '按最新',
          })
        }
        else if (res.tapIndex === 1) {
          wx.showToast({
            title: '“最早回应”优先',
            icon: 'none',
            duration: 1500
          })
          this.OldCommentFirst()
          this.setData({
            sortWord: '按最早',
          })
        }
        else {
          wx.showToast({
            title: '“赞数最多”优先',
            icon: 'none',
            duration: 1500
          })
          this.LikemostCommentFisrt()
          this.setData({
            sortWord: '按赞数',
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  },
  sort: function () {
    let word0 = ['✓ “最新回应”优先', '“最早回应”优先', '“赞数最多”优先'];
    let word1 = ['“最新回应”优先', '✓ “最早回应”优先', '“赞数最多”优先'];
    let word2 = ['“最新回应”优先', '“最早回应”优先', '✓ “赞数最多”优先'];
    const { sortWord } = this.data
    if (sortWord == '按最新') {
      this.showActionSheetChange(word0)
      this.setData({
        reachBottom: false,
        isBottom: false
      })
    }
    else if (sortWord == '按最早') {
      this.showActionSheetChange(word1)
      this.setData({
        reachBottom: false,
        isBottom: false
      })
    }
    else {
      this.showActionSheetChange(word2)
      this.setData({
        reachBottom: false,
        isBottom: false
      })
    }
  },


  upload: function (e) {
    this.setData({
      inputContent: true
    })
    console.log('上传图片')
    wx.chooseMedia({
      count: 9,
      sizeType: ['original', 'compressed'],
      // sizeType: ['compressed'],
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        console.log(res.tempFiles)
        checkAndUploadManyImages(res.tempFiles, this)
      },
      fail: err => {
        console.log(err)
        this.setData({
          inputContent: false,
          tapAnswerButton: true,
          tapReplyButton: false,
          tapAgainButton: false,
        })
      },
    })
  },
  //点击图片删除
  deleteImage: function (e) {
    console.log('图片id', e.currentTarget.id)
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
        if (this.data.fileID.length === 0) {
          this.setData({
            fileID: this.data.fileID,
            inputContent: false,
            tapAnswerButton: true,
            tapReplyButton: false,
            tapAgainButton: false,
          })
        }
        else {
          this.setData({
            fileID: this.data.fileID,
          })
        }
        wx.cloud.deleteFile({
          fileList: [id],
          success: res => {
            console.log('成功删除', res)
          },
          fail: err => {
            // handle error
            console.log(err)
          }
        })
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },

  //1-1 获取数据库数据
  getQuestionandCollectData: function () {
    question.where({
      _id: app.globalData.questionId
    }).get().then(res => {
      this.setData({
        questionList: res.data,
        collectNum: res.data[0].collector.length,
        postLikeNum: res.data[0].liker.length,
        openId: app.globalData.openId
      })

      if (res.data[0].commentNum <= 1) {
        this.setData({
          isFold: false
        })
      }

      console.log('成功获取 问题', res.data[0]._openid)

      let length = res.data[0].watcher.length;

      console.log('watcher[] = ', length, res.data[0].watcher)
      console.log('watched = ', res.data[0].watched)
      if (length >= 2) {
        res.data[0].watched += length
        res.data[0].watcher = []
        question.doc(app.globalData.questionId).update({
          data: {
            watched: res.data[0].watched,
            watcher: []
          }
        })
      }

      /** 如果发帖人是当前人，app.globalData.messageNum、question的message */
      const { _openid } = res.data[0]
      if (_openid == app.globalData.openId) {
        app.globalData.messageNum = app.globalData.messageNum - res.data[0].message
        if (app.globalData.messageNum < 0) app.globalData.messageNum = 0
        question.where({
          _id: app.globalData.questionId
        }).update({
          data: {
            message: 0
          }
        })
      }
    })
  },
  collectAdd: function () {
    console.log(app.globalData.openId)
    if (app.globalData.openId == undefined) {
      wx.showToast({
        title: '登录后操作。点击左上角←返回主界面',
        icon: 'none'
      })
    } else {
      wx.showToast({
        title: '前往“我的收藏”里查看',
        icon: 'none'
      })
      const { questionList } = this.data
      let { collectNum } = this.data
      console.log('收藏 add', questionList[0].collector, app.globalData.questionId)
      questionList[0].collector.push(app.globalData.openId)
      collectNum++;
      this.setData({
        questionList,
        collectNum
      })
      question.doc(app.globalData.questionId).update({
        data: {
          collector: _.addToSet(app.globalData.openId),
          collectNum: collectNum
        }
      })
    }
  },
  collectCancel: function () {
    wx.showToast({
      title: '取消收藏',
      icon: 'none'
    })
    const { questionList } = this.data
    let { collectNum } = this.data
    console.log('收藏 cancel', questionList[0].collector)
    // questionList[0].collector.push(app.globalData.openId)
    let collectorIndex = questionList[0].collector.indexOf(app.globalData.openId)
    if (collectorIndex != -1) {
      questionList[0].collector.splice(collectorIndex, 1)
      collectNum--;
    }

    this.setData({
      questionList,
      collectNum
    })
    question.doc(app.globalData.questionId).update({
      data: {
        collector: _.pull(app.globalData.openId),
        collectNum: collectNum
      }
    })
  },


  postLikeAdd: function () {
    wx.vibrateLong();  
    console.log(app.globalData.openId)
    if (app.globalData.openId == undefined) {
      wx.showToast({
        title: '登录后操作。点击左上角←返回主界面',
        icon: 'none'
      })
    } else {
      const { questionList } = this.data
      let { postLikeNum } = this.data

      questionList[0].liker.push(app.globalData.openId)
      postLikeNum++;
      this.setData({
        questionList,
        postLikeNum
      })
      question.doc(app.globalData.questionId).update({
        data: {
          liker: _.addToSet(app.globalData.openId),
          postLikeNum: postLikeNum
        }
      })
    }
  },
  postLikeCancel: function () {
    const { questionList } = this.data
    let { postLikeNum } = this.data

    // questionList[0].collector.push(app.globalData.openId)
    let likerIndex = questionList[0].liker.indexOf(app.globalData.openId)
    if (likerIndex != -1) {
      questionList[0].liker.splice(likerIndex, 1)
      postLikeNum--;
    }

    this.setData({
      questionList,
      postLikeNum
    })
    question.doc(app.globalData.questionId).update({
      data: {
        liker: _.pull(app.globalData.openId),
        postLikeNum: postLikeNum
      }
    })
  },
  getCommentandLikeData: function () {
    this.LikemostCommentFisrt()
    // comment.where({
    //   questionId: app.globalData.questionId
    //   /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
    // }).orderBy('time', 'desc').
    //   get().then(res => {
    //     // console.log('成功获取 评论', res.data)
    //     this.setData({
    //       commentList: res.data,
    //       openId: app.globalData.openId
    //     })
    //   })
  },
  likeCancel: function (e) {
    const commentId = e.target.id
    console.log('取消点赞', e)
    const commentIndex = e.target.dataset.index
    console.log(this.data.commentList)
    const { commentList } = this.data
    let likerIndex = commentList[commentIndex].liker.indexOf(app.globalData.openId)
    if (likerIndex != -1)
      commentList[commentIndex].liker.splice(likerIndex, 1)
    let likerNum = commentList[commentIndex].liker.length
    this.setData({
      commentList
    })

    comment.doc(commentId).update({
      data: {
        liker: _.pull(app.globalData.openId),
        likerNum: likerNum
      }
    }).then(res => {
      console.log('like Cancel', res)
    }).catch(err => { console.log(err) })

  },
  likeAdd: function (e) {
    var d = new Date().getTime();
    console.log('点赞', e)
    const commentId = e.target.id
    const commentIndex = e.target.dataset.index
    console.log(this.data.commentList)
    const { commentList } = this.data
    commentList[commentIndex].liker.push(app.globalData.openId)
    let likerNum = commentList[commentIndex].liker.length
    this.setData({
      commentList
    })

    comment.doc(commentId).update({
      data: {
        liker: _.addToSet(app.globalData.openId),
        likerNum: likerNum,
        likeTime: d,
      }
    }).then(res => {
      console.log('like Add', res)
    }).catch(err => { console.log(err) })
  },

  getData: function () {
    this.getQuestionandCollectData()
    this.getCommentandLikeData()
  },

  //0-4-1 评论的评论
  commentAgain: function (e) {
    // console.log(e.currentTarget.dataset.openid)
    // console.log(e.currentTarget.dataset.nickname)
    const postUnknown = e.currentTarget.dataset.unknown
    if (postUnknown) {
      this.setData({
        tapReplyButton: true,
        tapAnswerButton: false,
        tapAgainButton: false,
        postNickName: e.currentTarget.dataset.nickname,
        _commentId: e.currentTarget.id,
        _postOpenId: e.currentTarget.dataset.openid,
        postUnknown,
        postNickName2: '[匿名发帖用户]'
      })
    } else {
      this.setData({
        tapReplyButton: true,
        tapAnswerButton: false,
        tapAgainButton: false,
        postNickName: e.currentTarget.dataset.nickname,
        _commentId: e.currentTarget.id,
        _postOpenId: e.currentTarget.dataset.openid,
        postUnknown,
        postNickName2: e.currentTarget.dataset.nickname
      })
    }

  },

  commentSShortTap: function (e) {
    console.log(e.currentTarget)
    const postUnknown = e.currentTarget.dataset.unknown
    if (postUnknown) {
      this.setData({
        tapAnswerButton: false,
        tapReplyButton: false,
        tapAgainButton: true,
        postNickName: e.currentTarget.dataset.newnickname,
        _commentId: e.currentTarget.id,
        _postOpenId: e.currentTarget.dataset.openid,
        postUnknown,
        postNickName2: '[匿名发帖用户]',
      })
    } else {
      this.setData({
        tapAnswerButton: false,
        tapReplyButton: false,
        tapAgainButton: true,
        postNickName: e.currentTarget.dataset.newnickname,
        _commentId: e.currentTarget.id,
        _postOpenId: e.currentTarget.dataset.openid,
        postUnknown,
        postNickName2: e.currentTarget.dataset.newnickname,
      })
    }

  },
  //0-4-2 评论的评论的评论
  commentSLongTap: function (e) {
    const { idx } = e.currentTarget.dataset
    console.log('e.currentTarget.dataset.openid', e.currentTarget.dataset.openid)
    if (app.globalData.openId == e.currentTarget.dataset.openid || app.globalData.isManager) {
      wx.showActionSheet({
        itemList: ['删除'],
        itemColor: '#FA5151'
      }).then(() => {
        console.log('点击删除')
        wx.showToast({
          title: '删除中...',
          icon: 'none',
        })
        console.log('this.data.commentList', this.data.commentList)
        const { index } = e.currentTarget.dataset
        const { commenter } = this.data.commentList[index]
        console.log(index, idx)

        if (index != -1) {
          const deletedComment = commenter.splice(idx, 1);
          deleteRecord.add({
            data: {
              AComment: true,
              list: deletedComment
            }
          })
        }
        Promise.all([
          comment.doc(e.currentTarget.id).update({
            data: {
              commenter: commenter,
              commentNum: _.inc(-1)
            }
          }),
          question.doc(app.globalData.questionId).update({
            data: {
              commentNum: _.inc(-1)
            }
          }),
          commentAgain.where({
            commentId: e.currentTarget.id,
            newOpenId: app.globalData.openId,
            postOpenId: e.currentTarget.dataset.newopenid,
            commentAgainBody: e.currentTarget.dataset.commentagainbody,
          }).remove()
        ]).then(() => {
          this.deleteCommentEnd()
          wx.hideToast({
            success: () => {
              wx.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 1000
              })
            },
          })
        })
      }).catch(() => {
        console.log('取消删除')
      })
    }
    else {
      wx.showActionSheet({
        itemList: ['举报'],
        itemColor: '#FA5151'
      })
        .then(() => {
          wx.showModal({
            title: "举报理由",
            content: "该评论 不友善/违法违规/色情低俗/网络暴力/不实信息/扰乱社区秩序…",
            editable: true,
            confirmText: "提交举报",
            confirmColor: "#FA5151",
            success: res => {
              if (res.confirm) {
                comment.doc(e.currentTarget.id).update({
                  data: {
                    warnerDetail: _.addToSet({
                      isSelf: false,
                      nickName: app.globalData.nickName,
                      _openid: app.globalData.openId,
                      reason: '该评论下的第 ' + (idx + 1) + ' 条评论：“' + e.currentTarget.dataset.commentagainbody + '”（来自：' + e.currentTarget.dataset.newnickname + ' - ' + e.currentTarget.dataset.openid + '）' + res.content
                    }),
                    warner: _.addToSet(app.globalData.openId)
                  }
                }).then(() => {
                  wx.showToast({
                    title: '感谢举报！管理员会尽快处理',
                    icon: 'none',
                    duration: 1500
                  })
                })
              }
            },
            fail: err => {
              console.log(err)
            }
          })
        })
        .catch(() => {
          console.log('取消举报')
        })
    }
  },
  // 0-4-3 回复评论的输入框失去焦点
  loseFocus: function (e) {
    console.log('失去焦点')
    if (!this.data.inputContent) {
      this.setData({
        height: 0,
        tapAnswerButton: true,
        tapReplyButton: false,
        tapAgainButton: false,
      })
    } else {
      this.setData({
        height: 0,
      })
    }
  },

  //左上角的点切换状态
  colorfulPoint: function () {
    const { questionList } = this.data
    if (questionList[0]._openid == app.globalData.openId) {
      if (!questionList[0].solved) {
        wx.showActionSheet({
          itemList: ['改为“已解决”'],
          itemColor: '#07C160',
        }).then(res => {
          question.doc(app.globalData.questionId).update({
            data: {
              solved: true
            }
          }).then(() => {
            this.setData({
              'questionList[0].solved': true,
            })
            wx.showToast({
              title: '状态更新成功！',
              icon: 'none',
            })
          })
        }).catch((err) => {
          console.log(err)
        })
      }
      else {
        wx.showActionSheet({
          itemList: ['改为“待解决”'],
          itemColor: '#F9A826',
          success: res => {
            question.doc(app.globalData.questionId).update({
              data: {
                solved: false
              }
            }).then(() => {
              this.setData({
                'questionList[0].solved': false,
              })
              wx.showToast({
                title: '状态更新成功！',
                icon: 'none',
              })
            })
          },
          fail(res) {
            console.log(res.errMsg)
          }
        })
      }
    }
  },
  //问题右上角三个点
  threePointTap: function () {
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '登录后操作。点击左上角←返回主界面',
        icon: 'none'
      })
    } else {
      const { questionList } = this.data
      if (app.globalData.openId == questionList[0]._openid || app.globalData.isManager) {
        wx.showActionSheet({
          itemList: ['删除'],
          itemColor: '#FA5151',
          success: res => {
            wx.showModal({
              title: '提醒',
              content: '删除后将无法恢复，相关评论也将被删除，确定删除吗？',
              cancelText: '取消',
              confirmText: '删除',
              cancelColor: '#576B95',
              confirmColor: '#FA5151',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  app.globalData.questionDelete = true
                  wx.showLoading({
                    title: '删除中',
                  })
                  Promise.all([
                    deleteRecord.add({
                      data: {
                        APost: true,
                        list: questionList[0]
                      }
                    }),
                    question.where({
                      _id: app.globalData.questionId
                    }).get().then(res => {
                      console.log(res.data)
                      deleteQuestionCloudImage(res.data)
                    }),
                    comment.where({
                      questionId: app.globalData.questionId
                    }).get().then(res => {
                      deleteCommentCloudImage(res.data)
                    }),
                    commentAgain.where({
                      questionId: app.globalData.questionId
                    }).get().then(res => {
                      deleteCommentCloudImage(res.data)
                    })
                  ]).then(() => {
                    Promise.all([
                      question.where({
                        _id: app.globalData.questionId
                      }).remove(),
                      comment.where({
                        questionId: app.globalData.questionId
                      }).remove(),
                      commentAgain.where({
                        questionId: app.globalData.questionId
                      }).remove()
                    ]).then(() => {
                      wx.hideLoading()
                      wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 1500
                      })
                      setTimeout(function () { wx.navigateBack(); }, 1500);
                    })
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          },
          fail(res) {
            console.log(res.errMsg)
          }
        })
      }
      //warn
      else {
        wx.showActionSheet({
          itemList: ['举报'],
          itemColor: '#FA5151',
          success: res => {
            console.log(res.tapIndex)
            wx.showModal({
              title: "举报理由",
              content: "该帖 不友善/违法违规/色情低俗/网络暴力/不实信息/扰乱社区秩序…",
              editable: true,
              confirmText: "提交举报",
              confirmColor: "#FA5151",
              success: res => {
                if (res.confirm) {
                  question.doc(app.globalData.questionId).update({
                    data: {
                      warnerDetail: _.addToSet({
                        nickName: app.globalData.nickName,
                        _openid: app.globalData.openId,
                        reason: res.content
                      }),
                      warner: _.addToSet(app.globalData.openId)
                    }
                  }).then(() => {
                    wx.showToast({
                      title: '感谢举报！管理员会尽快处理',
                      icon: 'none',
                      duration: 1500
                    })
                  })
                }
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
      }
    }
  },

  deleteCommentEnd: function () {
    const { sortWord } = this.data
    this.getQuestionandCollectData()
    if (sortWord == "按最新") this.NewCommentFirst()
    else if (sortWord == "按最早") this.OldCommentFirst()
    else this.LikemostCommentFisrt()
  },
  //评论右上角三个点
  threePointTap2: function (e) {
    if (!app.globalData.isLogin) {
      wx.showToast({
        title: '登录后操作。点击左上角←返回主界面',
        icon: 'none'
      })
    } else {
      console.log(e.currentTarget.dataset.index)
      console.log(this.data.questionList[0].commenter)

      var commentList = [];
      comment.doc(e.currentTarget.id).get().then((res) => {
        commentList = res.data
        console.log(res.data._openid)
        if (app.globalData.openId == commentList._openid || app.globalData.isManager) {
          wx.showActionSheet({
            itemList: ['删除'],
            itemColor: '#FA5151',
          }).then(() => {
            wx.showModal({
              title: '提醒',
              content: '删除后将无法恢复，相关评论也将被删除，确定删除吗？',
              cancelText: '取消',
              confirmText: '删除',
              cancelColor: '#576B95',
              confirmColor: '#FA5151',
            }).then((res) => {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.showLoading({
                  title: '删除中',
                })
                let { commenter } = this.data.questionList[0]
                let index = commenter.findIndex((value) => value.openId == this.data.openId);
                if (index != -1) {
                  commenter.splice(index, 1)
                }
                Promise.all([
                  comment.doc(e.currentTarget.id).get().then(res => {
                    console.log(res.data)
                    deleteRecord.add({
                      data: {
                        AComment: true,
                        list: res.data
                      }
                    }),
                      deleteCommentCloudImage(res.data)
                  }),
                  commentAgain.where({
                    commentId: e.currentTarget.id
                  }).get().then(res => {
                    console.log(res.data)
                    deleteCommentCloudImage(res.data)
                  }),
                  comment.doc(e.currentTarget.id).get().then((res) => {
                    console.log(res.data.commenter.length)
                    question.doc(app.globalData.questionId).update({
                      data: {
                        commentNum: _.inc(-(res.data.commenter.length + 1)),
                        commenter: commenter
                      }
                    })
                  })
                ]).then(() => {
                  Promise.all([
                    comment.doc(e.currentTarget.id).remove(),
                    commentAgain.where({
                      commentId: e.currentTarget.id
                    }).remove()
                  ]).then(() => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '删除成功',
                      icon: 'success',
                      duration: 1000
                    })
                    this.deleteCommentEnd();
                  })
                })
              }
              else if (res.cancel) {
                console.log('用户点击取消')
              }
            })
          }).catch(err => { console.log(err) })
        }
        //warn
        else {
          wx.showActionSheet({
            itemList: ['举报'],
            itemColor: '#FA5151',
            success: res => {
              console.log(res.tapIndex)
              wx.showModal({
                title: "举报理由",
                content: "该评论 不友善/违法违规/色情低俗/网络暴力/不实信息/扰乱社区秩序…",
                editable: true,
                confirmText: "提交举报",
                confirmColor: "#FA5151",
                success: res => {
                  console.log(res)
                  if (res.confirm) {
                    comment.doc(e.currentTarget.id).update({
                      data: {
                        warnerDetail: _.addToSet({
                          isSelf: true,
                          nickName: app.globalData.nickName,
                          _openid: app.globalData.openId,
                          reason: res.content
                        }),
                        warner: _.addToSet(app.globalData.openId)
                      }
                    }).then(() => {
                      wx.showToast({
                        title: '感谢举报！管理员会尽快处理',
                        icon: 'none',
                        duration: 1500
                      })
                    })
                  }
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
        }
      })
    }
  },

  //0-5 点击[回应]按钮，更新参数answer → 让底部评论框激活focus（弹起）
  answer: function () {
    this.setData({
      answer: true
    })
  },
  imageTap: function (e) {
    console.log(e.currentTarget.dataset.imagelist)
    let { imagelist } = e.currentTarget.dataset

    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: imagelist
    })
  },
  //0-6 底部评论框的输入状态，更新参数inputContent → 让[发送]按钮激活disable
  input: function (e) {
    const { value } = e.detail
    if (value === '') {
      this.setData({
        inputContent: false,
        _commentBody: ''
      })
    } else {
      this.setData({
        inputContent: true,
        _commentBody: e.detail.value
      })
    }
  },

  //1-3 获取右上角按钮数据
  getRightTop: function () {
    const res = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom
    })
  },

  sendEnd: function (title = '发送成功', isScrollTop = true) {
    const { sortWord } = this.data
    wx.showToast({
      title: title,
      icon: 'success'
    })
    let scrollTop = 0;
    if (this.data.tapAnswerButton && isScrollTop) {
      if (sortWord == "按最新") {
        scrollTop = 0
      } else {
        scrollTop = 10000000
      }
      wx.pageScrollTo({
        scrollTop: scrollTop,
        duration: 1250
      })
    }

    if (sortWord == "按最新") { this.NewCommentFirst() }
    else if (sortWord == "按最早") { this.OldCommentFirst() }
    else { this.LikemostCommentFisrt() }

    this.getQuestionandCollectData()
    this.setData({
      inputValue: '',
      inputContent: false,
      tapAnswerButton: true,
      tapReplyButton: false,
      tapAgainButton: false,
      answer: false,

      fileID: [],
    })
  },

  /**
   * （文字审核已通过）图片审核：处理异步检测结果推送
   * @param {} _commentBody 
   */
  sendContent: function (_commentBody) {
    if (this.data.isAskChatGLM) {
      this.sendContent2(_commentBody)
      return;
    }
    let that = this
    var d = new Date().getTime()
    //回应帖子
    if (that.data.tapAnswerButton) {
      question.doc(app.globalData.questionId).get().then(res => {
        let isUnknown = false
        // 非本人帖
        if (res.data._openid != that.data.openId) {
          wx.cloud.callFunction({
            name: 'sendMsg',
            data: {
              receiver: that.data.questionList[0]._openid,
              questionId: app.globalData.questionId,
              sender: app.globalData.nickName,
              commentBody: _commentBody,
              postTitle: that.data.questionList[0].title
            }
          })

          let position = 0
          if (res.data.commenter[0] && res.data.commenter[0].nickName == 'AI') {
            position = 1
          }
          question.doc(app.globalData.questionId).update({
            data: {
              answerTime: d,
              commentNum: _.inc(1),
              message: _.inc(1),

              commenter: _.push({
                each: [{ nickName: app.globalData.nickName, openId: app.globalData.openId }],
                position: position
              }) //头插法
            }
          })
        }
        // 本人发帖
        else {
          question.doc(app.globalData.questionId).update({ data: { commentNum: _.inc(1) } })
          isUnknown = res.data.unknown
        }
        comment.add({
          data: {
            //时间
            time: d,

            isUnknown: isUnknown,
            questionId: app.globalData.questionId,
            questionTitle: this.data.questionList[0].title,
            posterId: this.data.questionList[0]._openid,

            body: _commentBody,
            commentNum: 0,
            nickname: app.globalData.nickName,
            image: app.globalData.avatarUrl,

            commenter: [],
            liker: [],
            likerNum: 0,
            image_upload: that.data.fileID,

            isAuthentic: app.globalData.isAuthentic,
            idTitle: app.globalData.idTitle,

            warner: [],
            warnerDetail: [],
          },
        }).then((res) => {
          //二、图片审核：处理异步检测结果推送
          //1、拿到全部的traceId集合（违规图片集合）
          const { _id } = res
          traceId.orderBy('CreateTime', 'desc').get()
            .then((res) => {
              // 2、删除上传图片列表中违规图片
              deleteInvalidImages(that.data.fileID, res.data).then((res) => {
                // 3、更新图片列表
                comment.doc(_id).update({
                  data: { image_upload: res }
                }).then(() => {
                  wx.hideLoading()
                  that.sendEnd()
                })
              })
            })
        })
      })
    }
    //回应评论
    else {
      question.doc(app.globalData.questionId).update({ data: { commentNum: _.inc(1) } })
      let isUnknown = false;
      if (app.globalData.openId == this.data.questionList[0]._openid) {
        isUnknown = this.data.questionList[0].unknown
      }
      commentAgain.add({
        data: {
          answerTime: d,
          isUnknown,
          commentAgainBody: _commentBody,
          newOpenId: app.globalData.openId,
          postOpenId: that.data._postOpenId,
          newNickName: app.globalData.nickName,
          postNickName: that.data.postNickName,
          questionId: app.globalData.questionId,
          commentId: that.data._commentId,
          isWatched: false,

          image_upload: that.data.fileID,
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
            /**
             * 2、删除上传图片列表中违规图片
             */
            deleteInvalidImages(that.data.fileID, res.data).then((res) => {
              /**
               * 3、更新图片列表
               */

              comment.doc(that.data._commentId).update({
                data: {
                  commentNum: _.inc(1),
                  commenter: _.push({
                    isUnknown,
                    avatarUrl: app.globalData.avatarUrl,
                    newOpenId: app.globalData.openId,
                    postOpenId: that.data._postOpenId,
                    newNickName: app.globalData.nickName,
                    postNickName: that.data.postNickName,
                    commentAgainBody: _commentBody,
                    isAuthentic: app.globalData.isAuthentic,
                    idTitle: app.globalData.idTitle,
                    postUnknown: that.data.postUnknown,

                    image_upload: res,
                  })
                }
              })

              commentAgain.doc(_id).update({
                data: {
                  image_upload: res
                }
              }).then(() => {
                wx.hideLoading()
                that.sendEnd()
              })
            })
          })
      })
    }
  },

  sendContent2: function (_commentBody) {
    let that = this
    const d = new Date().getTime()
    const postId = app.globalData.questionId

    if (that.data.tapAnswerButton) {
      question.doc(postId).get().then(res => {
        let history = []
        if (res.data.history) {
          history = res.data.history
        }


        comment.add({
          data: {
            history: history,

            time: d,

            isUnknown: false,
            questionId: postId,
            questionTitle: this.data.questionList[0].title,
            posterId: this.data.questionList[0]._openid,

            body: _commentBody,
            commentNum: 0,
            nickname: app.globalData.nickName,
            image: app.globalData.avatarUrl,

            commenter: [{
              isUnknown: false,
              avatarUrl: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/643e9b5d-5bb3223d-55291b27',
              newOpenId: 'ChatGLM',
              postOpenId: app.globalData.openId,
              newNickName: 'AI',
              postNickName: app.globalData.nickName,
              commentAgainBody: '[正在根据该帖上下文进行回答...预计需要 10-15s]',
              isAuthentic: true,
              idTitle: 'ChatGLM',
              postUnknown: false,

              image_upload: [],
            }],
            liker: [],
            likerNum: 0,
            image_upload: [],

            isAuthentic: app.globalData.isAuthentic,
            idTitle: app.globalData.idTitle,

            warner: [],
            warnerDetail: [],
          },
        }).then((res) => {
          const commentId = res._id
          wx.cloud.callFunction({
            name: 'chatglm',
            data: {
              input: _commentBody,
              history: history,
            }
          }).then((res) => {
            wx.hideLoading()
            that.sendEnd()

            console.log(res.result.completion)
            that.gptsentComment(res.result.completion, commentId, postId)
          }).catch((err) => {
            console.log(err)
          })
        })
      })
    } else {
      const commentId = that.data._commentId;
      comment.doc(commentId).get().then((res) => {
        let history = []
        if (res.data.history) {
          history = res.data.history
        }

        commentAgain.add({
          data: {
            answerTime: d,
            isUnknown: false,
            commentAgainBody: _commentBody,
            newOpenId: app.globalData.openId,
            postOpenId: that.data._postOpenId,
            newNickName: app.globalData.nickName,
            postNickName: that.data.postNickName,
            questionId: app.globalData.questionId,
            commentId: commentId,
            isWatched: false,

            image_upload: [],
          }
        }).then((res) => {
          comment.doc(commentId).update({
            data: {
              history: history,

              commentNum: _.inc(1),
              commenter: _.push([{
                isUnknown: false,
                avatarUrl: app.globalData.avatarUrl,
                newOpenId: app.globalData.openId,
                postOpenId: that.data._postOpenId,
                newNickName: app.globalData.nickName,
                postNickName: that.data.postNickName,
                commentAgainBody: _commentBody,
                isAuthentic: app.globalData.isAuthentic,
                idTitle: app.globalData.idTitle,
                postUnknown: false,

                image_upload: [],
              }, {
                isUnknown: false,
                avatarUrl: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/643e9b5d-5bb3223d-55291b27',
                newOpenId: 'ChatGLM',
                postOpenId: app.globalData.openId,
                newNickName: 'AI',
                postNickName: app.globalData.nickName,
                commentAgainBody: '[正在根据该帖上下文进行回答...预计需要 10-15s]',
                isAuthentic: true,
                idTitle: 'ChatGLM',
                postUnknown: false,

                image_upload: [],
              }])
            }
          }).then(() => {
            wx.cloud.callFunction({
              name: 'chatglm',
              data: {
                input: _commentBody,
                history: history,
              }
            }).then((res) => {
              wx.hideLoading()
              that.sendEnd()

              console.log(res.result.completion)
              that.gptsentComment(res.result.completion, commentId, postId)
            }).catch((err) => {
              console.log(err)
            })
          })
        })
      })

    }
  },
  //AI内测使用：审核 completion
  gptsentComment: function (completion, commentId, postId) {
    let that = this
    wx.cloud.callFunction({
      name: 'checkContent',
      data: {
        txt: completion,
        scene: 2 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
      },
      success(res) {
        console.log(res)
        if (res.result.msgR) {
          const { label } = res.result.msgR.result
          const { suggest } = res.result.msgR.result
          if (suggest === 'risky') {
            that.sendCompletion('[危险：包含' + matchLabel(label) + '信息！]', commentId, postId)
          }
          else if (suggest === 'review') {
            console.log('可能包含' + matchLabel(label) + '信息')
            that.sendCompletion('[可能包含' + matchLabel(label) + '信息]：' + completion, commentId, postId)
          }
          else {
            that.sendCompletion(completion, commentId, postId)
          }
        } else {
          that.sendCompletion(completion, commentId, postId)
        }
      },
      fail(err) {
        console.log('checkContent云函数调用失败', err)
      }
    })
  },

  //AI内测使用：发布 completion
  sendCompletion: function (completion, commentId, postId) {
    let that = this
    const prompt = this.data._commentBody
    var d = new Date().getTime()

    if (completion == {}) {
      completion = ''
    }

    question.doc(postId).update({
      data: {
        commentNum: _.inc(2),
        history: _.push([prompt, completion])
      }
    })

    question.doc(postId).get().then(res => {
      commentAgain.add({
        data: {
          answerTime: d,
          isUnknown: false,
          commentAgainBody: completion,
          newOpenId: 'ChatGLM',
          postOpenId: app.globalData.openId,
          newNickName: 'AI',
          postNickName: app.globalData.nickName,
          questionId: postId,
          commentId: commentId,
          isWatched: false,

          image_upload: [],
        }
      }).then((res) => {
        const { _id } = res
        comment.doc(commentId).update({
          data: {
            commenter: _.pop()
          }
        }).then(() => {
          comment.doc(commentId).update({
            data: {
              commentNum: _.inc(1),
              commenter: _.push([{
                isUnknown: false,
                avatarUrl: 'cloud://smile-9gkoqi8o7618f34a.736d-smile-9gkoqi8o7618f34a-1316903232/643e9b5d-5bb3223d-55291b27',
                newOpenId: 'ChatGLM',
                postOpenId: app.globalData.openId,
                newNickName: 'AI',
                postNickName: app.globalData.nickName,
                commentAgainBody: completion,
                isAuthentic: true,
                idTitle: 'ChatGLM',
                postUnknown: false,

                image_upload: [],
              }]),

              history: _.push([prompt, completion])
            }
          }).then(() => {
            wx.hideToast()
            that.sendEnd('回答已生成', false)
          })
        })
      })
    })
  },
  /**
   * 点击发送按钮
   * @param {*} e 
   */
  sendComment: function (e) {
    wx.showLoading({
      title: '审核中',
      mask: true
    })
    const { _commentBody } = this.data
    let that = this
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        const { _id } = res.data[0]
        if (res.data[0].isForbidden) {
          wx.hideLoading()
          wx.navigateTo({
            url: '../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          if (this.data.isAskChatGLM) {
            let askTime = res.data[0].askTime
            askTime = askTime - 1;
            if (askTime < 0) {
              wx.showToast({
                title: '提问次数已用尽！请前往“意见反馈”联系开发者',
                icon: 'none',
                duration: 5000
              })
              return;
            } else {
              userInfo.doc(_id).update({
                data: {
                  askTime: askTime
                }
              })
            }
          }
          //文字审核
          wx.cloud.callFunction({
            name: 'checkContent',
            data: {
              txt: _commentBody,
              scene: 2 //场景枚举值（1 资料；2 评论；3 论坛；4 社交日志）
            },
            success(_res) {
              console.log(_res)
              if (_res.result.msgR) {
                const { label } = _res.result.msgR.result
                const { suggest } = _res.result.msgR.result
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
                }
                else {
                  that.sendContent(_commentBody)
                }
              } else {
                that.sendContent(_commentBody)
              }
            },
            fail(_res) {
              console.log('checkContent云函数调用失败', _res)
            }
          })
        }
      })
  },

  //0-2 获取键盘高度
  focus: function (e) {
    console.log(e.detail.height)
    this.setData({
      height: e.detail.height
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  getNicknameandImage: function () {
    userInfo.where({
      _openid: '{openid}'
    }).get()
      .then((res) => {
        if (res.data[0].isForbidden) {
          wx.navigateTo({
            url: '../../../packageLogin/pages/0-1 Forbidden/Forbidden',
          })
        } else {
          question.doc(app.globalData.questionId).update({
            data: {
              // watched: _.inc(1)
              watcher: _.addToSet(res.data[0]._openid),
              tmp: _.addToSet(res.data[0]._openid)
            }
          })

          this.setData({
            nickName: res.data[0].nickName,
            avatarUrl: res.data[0].avatarUrl,
            isLogin: true,
            isManager: res.data[0].isManager
          })
          app.globalData.openId = res.data[0]._openid
          app.globalData.isLogin = true
          app.globalData.isManager = res.data[0].isManager
          app.globalData.isAuthentic = res.data[0].isAuthentic
          app.globalData.idTitle = res.data[0].idTitle
          app.globalData.modifyNum = res.data[0].modifyNum
          app.globalData.isCheckSystemMsg = res.data[0].isCheckSystemMsg

          app.globalData.nickName = res.data[0].nickName
          app.globalData.avatarUrl = res.data[0].avatarUrl
          console.log('成功获取昵称、头像：', app.globalData.nickName, app.globalData.avatarUrl)
        }
      })
      .catch(() => {
        console.log('用户未登录')
        let d = new Date().getTime();
        question.doc(app.globalData.questionId).update({
          data: {
            // watched: _.inc(1)
            watcher: _.addToSet('guest' + d)
          }
        })
        this.setData({
          nickName: '',
          avatarUrl: '',
          isLogin: false,
        })
        app.globalData.isLogin = false,
          wx.showToast({
            icon: 'none',
            title: '游客模式。登录后评论。点击左上角←返回主界面',
            duration: 3500,
          })
      })
  },
  onLoad: function (options) {
    console.log('onLoad')
    const { id } = options
    if (id != undefined) {
      app.globalData.questionId = id
      this.getNicknameandImage()
    }
    this.getRightTop()
    this.getData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.isAsk) {
      wx.navigateBack()
        .catch(() => {
          wx.switchTab({
            url: '../../../pages/0-0 Show/Show'
          })
        })
      return
    }
    if (!app.globalData.isLogin) {
      wx.showToast({
        icon: 'none',
        title: '点击左上角←返回主界面',
        duration: 3500,
      })
    }
    if (app.globalData.isModify) {
      this.getNicknameandImage()
    }
    this.setData({
      isLogin: app.globalData.isLogin
    })
    this.deleteCommentEnd()
    app.globalData.isClick = true
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log(app.globalData.questionDelete)
    if (!app.globalData.questionDelete) {
      app.globalData.questionSolved = this.data.questionList[0].solved
      app.globalData.questionCommentNum = this.data.questionList[0].commentNum
      app.globalData.questionWatcher = this.data.questionList[0].watcher
      app.globalData.questionWatched = this.data.questionList[0].watched
      app.globalData.questionCollect = this.data.collectNum
      app.globalData.questionLikeNum = this.data.postLikeNum
    }
    else {
      app.globalData.questionDelete = true
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { commentList } = this.data
    if (commentList.length == 0) return;
    this.setData({
      reachBottom: true
    })
    console.log('触底')
    const { sortWord } = this.data
    const showNum = commentList.length

    if (sortWord == "按最新") {
      comment.where({
        time: _.lte(commentList[0].time),
        questionId: app.globalData.questionId
        /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
      }).orderBy('time', 'desc').count().then((res) => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          comment.where({
            time: _.lt(commentList[showNum - 1].time),
            questionId: app.globalData.questionId
            /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
          }).orderBy('time', 'desc').get().then(res => {
            let new_data = res.data
            let old_data = commentList
            this.setData({
              commentList: old_data.concat(new_data),
            })
          })
        } else {
          this.setData({
            isBottom: true
          })
        }
      })
    }
    else if (sortWord == "按最早") {
      comment.where({
        time: _.gte(commentList[0].time),
        questionId: app.globalData.questionId
        /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
      }).orderBy('time', 'asc').count().then(res => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          comment.where({
            time: _.gt(commentList[showNum - 1].time),
            questionId: app.globalData.questionId
            /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
          }).orderBy('time', 'asc').get().then(res => {
            let new_data = res.data
            let old_data = commentList
            this.setData({
              commentList: old_data.concat(new_data),
            })
          })
        } else {
          this.setData({
            isBottom: true
          })
        }
      })
    } else {
      comment.where({
        // time: _.gte(commentList[0].time),
        questionId: app.globalData.questionId
        /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
      }).orderBy('likerNum', 'desc').orderBy('time', 'asc').count().then(res => {
        if (showNum < res.total) {
          this.setData({
            isBottom: false,
          })
          comment.where({
            // time: _.gt(commentList[showNum - 1].time),
            questionId: app.globalData.questionId
            /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
          }).orderBy('likerNum', 'desc').orderBy('time', 'asc').skip(showNum).
            get().then(res => {
              let new_data = res.data
              let old_data = commentList
              this.setData({
                commentList: old_data.concat(new_data),
              })
            })
        } else {
          this.setData({
            isBottom: true
          })
        }
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      imageUrl: this.data.questionList[0].image[0],
      title: this.data.questionList[0].title,
      path: 'pages/0-0 Show/Show?id=' + app.globalData.questionId
    }
  },

  onShareTimeline: function () {
    return {
      imageUrl: this.data.questionList[0].image[0],
      title: this.data.questionList[0].title,
      query: 'id=' + app.globalData.questionId
    }
  }
})