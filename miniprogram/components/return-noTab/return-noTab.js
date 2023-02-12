// components/return-noTab/return-noTab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top:{
      type:Number,
      value:0,
    },
    bottom:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    return: function (e) {
      wx.navigateBack()
    },
  }
})
