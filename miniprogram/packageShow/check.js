const db = wx.cloud.database()
const _ = db.command
const traceId = db.collection('traceId')


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
  //console.log(tempFiles)
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
            //console.log(res)
            resolve();
          },
          fail: err => {
            //console.log(err)
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
            //console.log(res)
            resolve();
          },
          fail: err => {
            //console.log(err)
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
        //console.log('成功删除', res)
      },
      fail: err => {
        //console.error(err)
      }
    })
  }
}

function deleteQuestionCloudImage(list) {
  wx.cloud.deleteFile({
    fileList: list[0].image,
    success: res => {
      //console.log('成功删除', res)
    },
    fail: err => {
      //console.error(err)
    }
  })
}

module.exports = {
  matchLabel: matchLabel,
  checkAndUploadManyImages: checkAndUploadManyImages,
  deleteInvalidImages: deleteInvalidImages,
  deleteCommentCloudImage: deleteCommentCloudImage,
  deleteQuestionCloudImage: deleteQuestionCloudImage
}