const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
/**
 * 审核图片，上传审核通过后的图片
 * @param {*待审核图片列表} tempFiles 
 * @param {*page = this} page 
 */
function checkAndUploadManyImages(tempFiles, page) {
  console.log(tempFiles)
  wx.showLoading({
    title: '审核中',
  })
  let onlyString;
  for (var i = 0; i < tempFiles.length; i++) {
    if (tempFiles[i].size > 1024 * 1024) {
      wx.hideLoading()
      wx.showToast({
        title: '图片大于1MB',
        icon: 'error'
      });
      console.log('图片规格 > 1 MB')
    } else {
      const { tempFilePath } = tempFiles[i]
      wx.cloud.callFunction({
        name: 'checkContent',
        data: {
          value: tempFilePath
        },
        success: json => {
          console.log(json)
          if (json.result.errCode) {
            wx.hideLoading()
            wx.showToast({
              title: '无法上传',
              icon: 'error'
            });
          } else {
            if (json.result.imageR.errCode == 87014) {
              console.log("图片含有违法违规内容")
              wx.hideLoading()
              wx.showToast({
                title: '图片含有违法违规内容',
                icon: 'error'
              });
            } else {
              onlyString = new Date().getTime().toString();
              wx.cloud.uploadFile({
                cloudPath: app.globalData.openId + '/' + onlyString + '.png', // 上传至云端的路径
                filePath: tempFilePath, // 小程序临时文件路径
                success: res => {
                  page.data.fileID.push(res.fileID)
                  // 返回文件 ID
                  page.setData({
                    fileID: page.data.fileID
                  })
                  wx.hideLoading()
                  wx.showToast({
                    title: '合规图片已成功',
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
            }
          }

        },
        fail: err => {
          console.log('checkContent err：', err)
        }
      })


    }
  }
}

function deleteCommentCloudImage(list) {
  for (var i = 0; i < list.length; i++) {
    for (var j = 0; j < list[i].image_upload.length; j++) {
      let id = list[i].image_upload[j]
      wx.cloud.deleteFile({
        fileList: [id],
        success: res => {
          console.log('成功删除', res)
        },
        fail: err => {
          console.error(err)
        }
      })
    }
  }
}
function deleteQuestionCloudImage(list) {
  for (var i = 0; i < list[0].image.length; i++) {
    let id = list[0].image[i]
    wx.cloud.deleteFile({
      fileList: [id],
      success: res => {
        console.log('成功删除', res)
      },
      fail: err => {
        console.error(err)
      }
    })
  }
}

Page({
  /**
   * 页面的初始数据
   */
  options: {
    pureDataPattern: /^_/
  },
  data: {
    isLogin: false,
    // animationData: {},
    isFold: true,
    sortWord: "按最新",
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

    top: 48,
    left: 281,
    right: 367,
    bottom: 80,
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
        console.error(err)
      })
  },
  sort: function () {
    let word0 = ['✓ “最新回应”优先', '“最早回应”优先', '“赞数最多”优先'];
    let word1 = ['“最新回应”优先', '✓ “最早回应”优先', '“赞数最多”优先'];
    let word2 = ['“最新回应”优先', '“最早回应”优先', '✓ “赞数最多”优先'];
    const { sortWord } = this.data
    if (sortWord == '按最新') this.showActionSheetChange(word0)
    else if (sortWord == '按最早') this.showActionSheetChange(word1)
    else this.showActionSheetChange(word2)
  },


  upload: function (e) {
    this.setData({
      inputContent: true
    })
    console.log('上传图片')
    wx.chooseMedia({
      count: 9,
      sizeType: ['original', 'compressed'],
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
        openId: app.globalData.openId
      })
      console.log('成功获取 问题', res.data[0]._openid)

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
    wx.showToast({
      title: '关注成功',
      icon: 'none'
    })
    const { questionList } = this.data
    let { collectNum } = this.data
    console.log('关注 add', questionList[0].collector)
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
  },
  collectCancel: function () {
    wx.showToast({
      title: '取消关注',
      icon: 'none'
    })
    const { questionList } = this.data
    let { collectNum } = this.data
    console.log('关注 cancel', questionList[0].collector)
    // questionList[0].collector.push(app.globalData.openId)
    let collectorIndex = questionList[0].collector.indexOf(app.globalData.openId)
    questionList[0].collector.splice(collectorIndex, 1)
    collectNum--;
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
  getCommentandLikeData: function () {
    comment.where({
      questionId: app.globalData.questionId
      /**desc 时间-新到旧 赞数-高到低；asc 旧到新 */
    }).orderBy('time', 'desc').
      get().then(res => {
        // console.log('成功获取 评论', res.data)
        this.setData({
          commentList: res.data,
          openId: app.globalData.openId
        })
      })
  },
  likeCancel: function (e) {
    const commentId = e.target.id
    console.log('取消点赞', e)
    const commentIndex = e.target.dataset.index
    console.log(this.data.commentList)
    const { commentList } = this.data
    let likerIndex = commentList[commentIndex].liker.indexOf(app.globalData.openId)
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
  // goodAnimation: function () {
  //   var animation = wx.createAnimation({
  //     duration: 200,
  //     timingFunction: 'ease',
  //   })
  //   this.animation = animation
  //   this.animation.scale(0.3, 0.3).step({duration: 100}),
  //   this.animation.scale(1.1, 1.1).step(),
  //     this.setData({
  //       animationData1: this.animation.export(),
  //     })
  //     setTimeout(()=>{
  //       this.animation.scale(1, 1).step({duration: 100}),
  //       this.setData({
  //         animationData1: this.animation.export(),
  //       })
  //     }, 300)
  // },



  //0-4-1 评论的评论

  commentAgain: function (e) {
    // console.log(e.currentTarget.dataset.openid)
    // console.log(e.currentTarget.dataset.nickname)
    this.setData({
      tapReplyButton: true,
      tapAnswerButton: false,
      tapAgainButton: false,
      postNickName: e.currentTarget.dataset.nickname,
      _commentId: e.currentTarget.id,
      _postOpenId: e.currentTarget.dataset.openid,
    })
  },
  //0-4-2 评论的评论的评论
  commentAgainAgain: function (e) {
    if (app.globalData.openId == e.currentTarget.dataset.openid) {
      wx.showActionSheet({
        itemList: ['删除'],
        itemColor: '#FA5151'
      }).then(() => {
        console.log('点击删除')
        wx.showToast({
          title: '删除中...',
          icon: 'none',
        })
        // console.log(this.data.commentList[0].commenter)
        const { commenter } = this.data.commentList[0]
        const { index } = e.currentTarget.dataset
        commenter.splice(index, 1);
        comment.doc(e.currentTarget.id).update({
          data: {
            commenter,
            commentNum: _.inc(-1)
          }
        }).then(() => {
          question.doc(app.globalData.questionId).update({
            data: {
              commentNum: _.inc(-1)
            }
          }).then(() => {
            commentAgain.where({
              commentId: e.currentTarget.id,
              _openid: app.globalData.openId,
              postOpenId: e.currentTarget.dataset.newopenid,
              commentAgainBody: e.currentTarget.dataset.commentagainbody,
            }).remove().then(() => {
              this.getData()
              wx.hideToast({
                success: (res) => {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'none',
                    duration: 1000
                  })
                },
              })
            })

          })
        })
      }).catch(() => {
        console.log('点击取消')
      })
    }
    else {
      this.setData({
        tapAnswerButton: false,
        tapReplyButton: false,
        tapAgainButton: true,
        postNickName: e.currentTarget.dataset.newnickname,
        _commentId: e.currentTarget.id,
        _postOpenId: e.currentTarget.dataset.openid,
      })
    }
    // console.log()
    // console.log(this.data.postNickName)
  },
  // 0-4-3 回复评论的输入框失去焦点
  loseFocus: function (e) {
    console.log('失去焦点')
    if (!this.data.inputContent) {
      this.setData({
        tapAnswerButton: true,
        tapReplyButton: false,
        tapAgainButton: false,
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
                  question.where({
                    _id: app.globalData.questionId
                  }).get().then(res => {
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
              question.doc(app.globalData.questionId).update({
                data: {
                  warnerDetail: _.addToSet({
                    nickName: app.globalData.nickName,
                    _openid: app.globalData.openId,
                    reason: res.content
                  }),
                  warner: _.addToSet(app.globalData.openId)
                }
              })
              wx.showToast({
                title: '感谢举报！管理员会尽快处理',
                icon: 'none',
                duration: 1500
              })
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
          {
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
                commenter.splice(index, 1)
                Promise.all([
                  comment.doc(e.currentTarget.id).get().then(res => {
                    console.log(res.data)
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
                        commenter
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
          }
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
              content: "该评论或评论的回复 不友善/违法违规/色情低俗/网络暴力/不实信息/扰乱社区秩序…",
              editable: true,
              confirmText: "提交举报",
              confirmColor: "#FA5151",
              success: res => {
                comment.doc(e.currentTarget.id).update({
                  data: {
                    warnerDetail: _.addToSet({
                      nickName: app.globalData.nickName,
                      _openid: app.globalData.openId,
                      reason: res.content
                    }),
                    warner: _.addToSet(app.globalData.openId)
                  }
                })
                wx.showToast({
                  title: '感谢举报！管理员会尽快处理',
                  icon: 'none',
                  duration: 1500
                })
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

  sendEnd: function () {
    const { sortWord } = this.data
    wx.showToast({
      title: '发送成功',
      icon: 'none'
    })
    if (sortWord == "按最新") {
      this.NewCommentFirst()
      if (this.data.tapAnswerButton) {
        wx.pageScrollTo({
          scrollTop: 0,
          duration: 1250
        })
      }
    }
    else if (sortWord == "按最早") {
      this.OldCommentFirst()
      if (this.data.tapAnswerButton) {
        wx.pageScrollTo({
          scrollTop: 10000000,
          duration: 1250
        })
      }
    }
    else {
      this.LikemostCommentFisrt()
      if (this.data.tapAnswerButton) {
        wx.pageScrollTo({
          scrollTop: 10000000,
          duration: 1250
        })
      }
    }
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
   * 审核文字，发布审核通过后的评论
   * @param {*} e 
   */
  sendComment: function (e) {
    const { _commentBody } = this.data
    let that = this
    wx.cloud.callFunction({
      name: 'checkContent',
      data: {
        txt: _commentBody
      },
      success(_res) {
        console.log(_res)
        console.log(_res.result.msgR.errCode)
        if (_res.result.msgR.errCode === 87014) {
          wx.showToast({
            title: '包含敏感信息',
            icon: 'error'
          })
        } else {
          wx.showToast({
            title: '发送中...',
            icon: 'none'
          })
          var d = new Date().getTime();
          if (that.data.tapAnswerButton) {
            question.doc(app.globalData.questionId).get().then(res => {
              if (res.data._openid != that.data.openId) {
                question.doc(app.globalData.questionId).update({
                  data: {
                    answerTime: d,
                    commentNum: _.inc(1),
                    message: _.inc(1),

                    commenter: _.push({
                      each: [{ nickName: app.globalData.nickName, openId: app.globalData.openId }],
                      position: 0,
                    }) //头插法
                  }
                })
                  .then(() => {
                    comment.add({
                      data: {
                        //时间
                        time: d,

                        questionId: app.globalData.questionId,
                        body: _commentBody,
                        commentNum: 0,
                        nickname: app.globalData.nickName,
                        image: app.globalData.avatarUrl,
                        commenter: [],
                        liker: [],
                        likerNum: 0,
                        image_upload: that.data.fileID,

                        isAuthentic: app.globalData.isAuthentic
                      },
                    }).then(() => {
                      wx.hideToast()
                      that.sendEnd()
                    })
                  })
              }
              else {
                question.doc(app.globalData.questionId).update({
                  data: {
                    commentNum: _.inc(1),
                  }
                })
                  .then(() => {
                    comment.add({
                      data: {
                        //时间
                        time: d,

                        questionId: app.globalData.questionId,
                        body: _commentBody,
                        commentNum: 0,
                        nickname: app.globalData.nickName,
                        image: app.globalData.avatarUrl,

                        commenter: [],
                        liker: [],
                        likerNum: 0,
                        image_upload: that.data.fileID,

                        isAuthentic: app.globalData.isAuthentic
                      },
                    }).then(() => {
                      wx.hideToast()
                      that.sendEnd()
                    })
                  })
              }
            })
          }
          else if (that.data.tapReplyButton) {
            question.doc(app.globalData.questionId).update({
              data: {
                commentNum: _.inc(1),
              }
            }).then(() => {
              console.log(that.data._commentId)
              comment.doc(that.data._commentId).update({
                data: {
                  commentNum: _.inc(1),
                  commenter: _.push({
                    avatarUrl: app.globalData.avatarUrl,
                    newNickName: app.globalData.nickName,
                    postNickName: that.data.postNickName,
                    newOpenId: app.globalData.openId,
                    postOpenId: that.data._postOpenId,
                    commentAgainBody: _commentBody,

                    image_upload: that.data.fileID,
                  })
                }
              })
            }).then(() => {
              commentAgain.add({
                data: {
                  answerTime: d,

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
              }).then(() => {
                wx.hideToast()
                that.sendEnd()
              })
            })
          }
          else {
            question.doc(app.globalData.questionId).update({
              data: {
                commentNum: _.inc(1),
              }
            }).then(() => {
              comment.doc(that.data._commentId).update({
                data: {
                  commentNum: _.inc(1),
                  commenter: _.push({
                    avatarUrl: app.globalData.avatarUrl,
                    newOpenId: app.globalData.openId,
                    postOpenId: that.data._postOpenId,
                    newNickName: app.globalData.nickName,
                    postNickName: that.data.postNickName,
                    commentAgainBody: _commentBody,

                    image_upload: that.data.fileID,
                  })
                }
              }).then(() => {
                commentAgain.add({
                  data: {
                    answerTime: d,

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
                }).then(() => {
                  wx.hideToast()
                  that.sendEnd()
                })
              })
            })
          }
        }
      },
      fail(_res) {
        console.log('checkContent云函数调用失败', _res)
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
  onLoad: function () {
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
      app.globalData.questionSolved = this.data.questionList[0].solved,
        app.globalData.questionCommentNum = this.data.questionList[0].commentNum,
        app.globalData.questionView = this.data.questionList[0].watched,
        app.globalData.questionCollect = this.data.collectNum
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
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.questionList[0].title,
      path: 'pages/0-0 Show/Show?id=' + app.globalData.questionId
    }
  }
})