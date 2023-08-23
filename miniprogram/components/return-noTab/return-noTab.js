const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    topWord: { type: String, value: '' },
    color: { type: String, value: '' },
    bkgColor: { type: String, value: '' },
  },

  /**
   * 组件的初始数据
   */
  data: {
    top: app.globalData.top,
    bottom: app.globalData.bottom,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    return: function () {
      wx.navigateBack()
        .catch(() => {
          wx.switchTab({
            url: '../../../pages/0-0 Show/Show'
          })
        })
    },
  }
})
