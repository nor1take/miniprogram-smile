const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const question = db.collection('question')
const comment = db.collection('comment')
const commentAgain = db.collection('commentAgain')
const collect = db.collection('collect')
const likerList = db.collection('likerList')

Array.prototype.myUcase = function () {
  if (this.length) {
    var i;
    var j;
    for (i = 0; i < 3; i++) {
      for (j = 0; j < this.length; j++) {
        if (i == this[j].commentIndex) { break; }
      }
      if (j == this.length) {
        this.push({ commentIndex: i, like: 0 })
      }
    }
  }
};
Page({
  /**
   * 页面的初始数据
   */
  options: {
    pureDataPattern: /^_/
  },
  data: {
    loading: false,
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

    like: [],
    like2: []
  },
  otherData: {
    isDelete: false,
  },

  //1-1 获取数据库数据
  getQuestionData: function () {
    question.where({
      _id: app.globalData.questionId
    }).get().then(res => {
      console.log(res.data[0])
      this.setData({
        questionList: res.data,
        collectNum: res.data[0].collectNum
      })

      console.log('成功获取 问题', res.data[0]._openid)
      const { _openid } = res.data[0]

      if (_openid == app.globalData.openId) {
        app.globalData.messageNum = app.globalData.messageNum - res.data[0].message
        if (app.globalData.messageNum < 0) app.globalData.messageNum = 0

        db.collection('question').where({
          _id: app.globalData.questionId
        }).update({
          data: {
            message: 0
          }
        })
      }
    })
  },
  getCommentData: function () {
    comment.where({
      questionId: app.globalData.questionId
    }).get().then(res => {
      console.log('成功获取 评论', res.data)
      this.setData({
        commentList: res.data
      })
    })
  },
  getLikerData: function () {
    likerList.where({
      questionId: app.globalData.questionId,
      _openid: app.globalData.openId
    }).orderBy('commentIndex', 'asc').get().then(res => {
      var likerList = res.data
      likerList.myUcase()
      this.setData({
        likerList: likerList
      })
    }).catch((err) => {
      console.log(err)
    })
  },
  getCollectState: function () {
    db.collection('collect').where({
        questionId: app.globalData.questionId,
        _openid: app.globalData.openId
      }).get().then(res => {
        if (res.data.length) {
          this.setData({
            isCollect: true
          })
        }
      }).catch(() => {
        console.log('没有人收藏')
      })
  },

  getData: function () {
    this.getCollectState()
    this.getQuestionData()
    this.getCommentData()
    this.getLikerData()
  },

  good: function (e) {
    const { like } = this.data
    const { index } = e.currentTarget.dataset
    //点赞：如果like[index] == 0，让like[index] = 1
    if (!like[index]) {
      like[index] = 1
      this.setData({
        like: like
      })

      likerList.add({
        data: {
          questionId: app.globalData.questionId,
          commentIndex: e.currentTarget.dataset.index,
          like: 2,
        }
      }).then(res => {
        console.log('成功在 集合likeList 中插入数据！')
      })

      comment.doc(e.currentTarget.id).update({
        data: {
          good: _.inc(1)
        },
      }).then((res) => {
        console.log('成功更新 集合comment 的赞数')
      })
    }
    else if (like[index]) {
      like[index] = 0
      this.setData({
        like: like
      })
      console.log('更新后的数组', this.data.like)
      likerList.where({
        questionId: app.globalData.questionId,
        commentIndex: e.currentTarget.dataset.index,
      }).remove()
      console.log('当前评论的commentId：', e.currentTarget.id)
      comment.doc(e.currentTarget.id).update({
        data: {
          good: _.inc(-1)
        },
      }).then((res) => {
        console.log('成功更新 集合comment 的赞数')
      })
    }
  },
  good2: function (e) {
    const { like2 } = this.data
    const { index } = e.currentTarget.dataset
    
    if (!like2[index]) {
      like2[index] = 1
      this.setData({
        like2: like2
      })

      likerList.where({
        questionId: app.globalData.questionId,
        commentIndex: e.currentTarget.dataset.index,
      }).remove()

      comment.doc(e.currentTarget.id).update({
        data: {
          good: _.inc(-1)
        },
      }).then((res) => {
        console.log('成功更新 集合comment 的赞数')
      })
    }

    else if (like2[index]) {
      like2[index] = 0
      this.setData({
        like2: like2
      })

      likerList.add({
        data: {
          questionId: app.globalData.questionId,
          commentIndex: e.currentTarget.dataset.index,
          like: 2,
        }
      })
        .then(res => {
          console.log('成功在 集合likeList 中插入数据！')
        })

      comment.doc(e.currentTarget.id).update({
        data: {
          good: _.inc(1)
        },
      }).then((res) => {
        console.log('成功更新 集合comment 的赞数')
      })
    }

  },

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
    if (e.detail.value == '') {
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
          }).then(()=>{
            this.setData({
              'questionList[0].solved' : true,
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
            }).then(()=>{
              this.setData({
                'questionList[0].solved' : false,
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
    const that = this
    if (app.globalData.openId == questionList[0]._openid) {
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
                that.otherData = {
                  isDelete: true
                }
                wx.showLoading({
                  title: '删除中',
                })
                question.where({
                  _openid: '{openid}',
                  _id: app.globalData.questionId
                }).remove({
                  success: function () {
                    comment.where({
                      questionId: app.globalData.questionId
                    }).remove({
                      success: function () {
                        likerList.where({
                          questionId: app.globalData.questionId
                        }).remove({
                          success: function () {
                            collect.where({
                              questionId: app.globalData.questionId
                            }).remove({
                              success: function () {
                                commentAgain.where({
                                  questionId: app.globalData.questionId
                                }).remove({
                                  success: function () {
                                    wx.hideLoading()
                                    wx.showToast({
                                      title: '删除成功',
                                      icon: 'success',
                                      duration: 1500
                                    })
                                    setTimeout(function () { wx.navigateBack(); }, 1500);
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
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
    //[举报]同[关注]
    else {
      wx.showActionSheet({
        itemList: ['举报'],
        itemColor: '#FA5151',
        success: res => {
          console.log(res.tapIndex)
          wx.showToast({
            title: '已举报',
            icon: 'none',
            duration: 1500
          })
          question.doc(app.globalData.questionId).update({
            data: {
              warner: _.addToSet(app.globalData.openId)
            }
          })
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    }

  },
  //评论右上角三个点
  threePointTap2: function (e) {
    console.log(e.currentTarget.dataset.index)
    console.log(this.data.questionList[0].commenter)

    var commentList = [];
    comment.doc(e.currentTarget.id).get().then((res) => {
      commentList = res.data
      console.log(res.data._openid)
      if (app.globalData.openId == commentList._openid) {
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
                const { index } = e.currentTarget.dataset
                let commenter = this.data.questionList[0].commenter
                commenter.reverse()
                commenter.splice(index, 1)
                commenter.reverse()
                comment.doc(e.currentTarget.id).get().then((res) => {
                  console.log(res.data.commenter.length)
                  question.doc(app.globalData.questionId).update({
                    data: {
                      commentNum: _.inc(-(res.data.commenter.length + 1)),
                      commenter
                    }
                  }).then(() => {
                    comment.doc(e.currentTarget.id).remove().then(() => {
                      commentAgain.where({
                        commentId: e.currentTarget.id
                      }).remove().then(() => {
                        wx.hideLoading()
                        this.getData();
                        wx.showToast({
                          title: '删除成功',
                          icon: 'success',
                          duration: 1000
                        })
                      })
                    })
                  })
                })
              }
              else if (res.cancel) {
                console.log('用户点击取消')
              }
            })
          }
        })
      }
      //[举报]同[关注]
      else {
        wx.showActionSheet({
          itemList: ['举报'],
          itemColor: '#FA5151',
          success: res => {
            console.log(res.tapIndex)
            wx.showToast({
              title: '已举报',
              icon: 'none',
              duration: 1500
            })
            comment.doc(e.currentTarget.id).update({
              data: {
                warner: _.addToSet(app.globalData.openId)
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
  //点击[关注]==收藏collect
  collectTap: function () {
    console.log('关注')
    const { isCollect } = this.data
    if (isCollect) {
      wx.showToast({
        title: '取消关注',
        icon: 'none',
        duration: 1000
      })
      this.setData({
        isCollect: false,
        collectNum: this.data.collectNum - 1
      })
      console.log(this.data.collectNum)
      const { collector } = this.data.questionList[0];
      var index = collector.indexOf(app.globalData.openId);
      collector.splice(index, 1);

      question.doc(app.globalData.questionId).update({
        data: {
          collector,
          collectNum: _.inc(-1)
        }
      }).then(
        console.log('question集合的collector数组已移除')
      )

      db.collection('collect').where({
        _openid: app.globalData.openId,
        questionId: app.globalData.questionId
      }).remove({
        success: function (res) {
          console.log('collect集合成功移除')
        }
      })
    }
    else {
      wx.showToast({
        title: '关注成功',
        icon: 'none',
        duration: 1000
      })
      this.setData({
        isCollect: true,
        collectNum: this.data.collectNum + 1
      })
      console.log(this.data.collectNum)
      question.doc(app.globalData.questionId).update({
        data: {
          collector: _.push(app.globalData.openId),
          collectNum: _.inc(1)
        }
      }).then(
        console.log('question成功'),
      )

      db.collection('collect').add({
        data: {
          questionId: app.globalData.questionId,
          collect: true
        }
      }).then(res => {
        console.log('collect成功')
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
    console.log(e.currentTarget.dataset.src)
    wx.previewImage({
      urls: [e.currentTarget.dataset.src]
    })
  },
  //0-6 底部评论框的输入状态，更新参数inputContent → 让[发送]按钮激活disable
  input: function (e) {
    if (e.detail.value == '') {
      this.setData({
        inputContent: false
      })
    }
    else {
      this.setData({
        inputContent: true,
        _commentBody: e.detail.value
      })
    }
  },

  //1-2 获取时间
  getTime: function () {
    var d = new Date();
    this.setData({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),
    })
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

  //2 写入数据库：[发送]按钮
  sendComment: function (e) {
    wx.showToast({
      title: '发送中...',
      icon: 'none'
    })
    var d = new Date();
    if (this.data.tapAnswerButton) {
      question.doc(app.globalData.questionId).update({
        data: {
          answerTime: d,
          Ayear: d.getFullYear(),
          Amonth: d.getMonth() + 1,
          Aday: d.getDate(),
          Ah: d.getHours(),
          Am: d.getMinutes(),
          As: d.getSeconds(),
          commentNum: _.inc(1),
          message: _.inc(1),

          commenter: _.push({
            each: [app.globalData.nickName],
            position: 0,
          }) //头插法
        }
      }).then(() => {
        comment.add({
          data: {
            //时间
            time: d,
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
            h: d.getHours(),
            m: d.getMinutes(),
            s: d.getSeconds(),

            questionId: app.globalData.questionId,
            body: this.data._commentBody,
            good: 0,
            commentNum: 0,
            nickname: app.globalData.nickName,
            image: app.globalData.avatarUrl,
            commentAgainBody: '',
            commenter: []
          },
        }).then(() => {
          wx.hideToast()
          wx.showToast({
            title: '发送成功',
            icon: 'none'
          })
          this.setData({
            inputValue: '',
            inputContent: false,
            tapAnswerButton: true,
            tapReplyButton: false,
            tapAgainButton: false,
            answer: false
          })
          this.getData()
          wx.pageScrollTo({
            scrollTop: 10000000000,
            duration: 1250
          })
        })
      })
    }
    else if (this.data.tapReplyButton) {
      question.doc(app.globalData.questionId).update({
        data: {
          commentNum: _.inc(1),
        }
      }).then(() => {
        console.log(this.data._commentId)
        comment.doc(this.data._commentId).update({
          data: {
            commentNum: _.inc(1),
            commenter: _.push({
              avatarUrl: app.globalData.avatarUrl,
              newNickName: app.globalData.nickName,
              postNickName: this.data.postNickName,
              newOpenId: app.globalData.openId,
              postOpenId: this.data._postOpenId,
              commentAgainBody: this.data._commentBody,
            })
          }
        })
      }).then(() => {
        commentAgain.add({
          data: {
            answerTime: d,
            Ayear: d.getFullYear(),
            Amonth: d.getMonth() + 1,
            Aday: d.getDate(),
            Ah: d.getHours(),
            Am: d.getMinutes(),
            As: d.getSeconds(),
            commentAgainBody: this.data._commentBody,
            newOpenId: app.globalData.openId,
            postOpenId: this.data._postOpenId,
            newNickName: app.globalData.nickName,
            postNickName: this.data.postNickName,
            questionId: app.globalData.questionId,
            commentId: this.data._commentId,
            isWatched: false,
          }
        }).then(() => {
          wx.hideToast()
          wx.showToast({
            title: '发送成功',
            icon: 'none'
          })
          this.setData({
            inputValue: '',
            inputContent: false,
            tapAnswerButton: true,
            tapReplyButton: false,
            tapAgainButton: false,
            answer: false
          })
          this.getData()
        })
      })
    }
    else {
      question.doc(app.globalData.questionId).update({
        data: {
          commentNum: _.inc(1),
        }
      }).then(() => {
        comment.doc().update({
          data: {
            commentNum: _.inc(1),
            commenter: _.push({
              avatarUrl: app.globalData.avatarUrl,
              newOpenId: app.globalData.openId,
              postOpenId: this.data._postOpenId,
              newNickName: app.globalData.nickName,
              postNickName: this.data.postNickName,
              commentAgainBody: this.data._commentBody,
            })
          }
        }).then(() => {
          commentAgain.add({
            data: {
              answerTime: d,
              Ayear: d.getFullYear(),
              Amonth: d.getMonth() + 1,
              Aday: d.getDate(),
              Ah: d.getHours(),
              Am: d.getMinutes(),
              As: d.getSeconds(),
              commentAgainBody: this.data._commentBody,
              newOpenId: app.globalData.openId,
              postOpenId: this.data._postOpenId,
              newNickName: app.globalData.nickName,
              postNickName: this.data.postNickName,
              questionId: app.globalData.questionId,
              commentId: this.data._commentId,
              isWatched: false,
            }
          }).then(() => {
            wx.hideToast()
            wx.showToast({
              title: '发送成功',
              icon: 'none'
            })
            this.setData({
              inputValue: '',
              inputContent: false,
              tapAnswerButton: true,
              tapReplyButton: false,
              tapAgainButton: false,
              answer: false
            })
            this.getData()
          })
        })
      })
    }

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
  onLoad: function (options) {
    console.log('openId: ', app.globalData.openId)
    this.getRightTop()
    this.getData()
    this.getTime()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      loading: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getData()
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
    console.log('this.otherData.isDelete: ',this.otherData.isDelete)
    if (this.otherData.isDelete) {
      app.globalData.questionDelete = true
    }
    else {
      app.globalData.questionDelete = false
      app.globalData.questionSolved = this.data.questionList[0].solved,
      app.globalData.questionCommentNum = this.data.questionList[0].commentNum,
      app.globalData.questionView = this.data.questionList[0].watched,
      app.globalData.questionCollect = this.data.collectNum
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
    }
  }
})