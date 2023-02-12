// components/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top:{
      type:Number,
      value:0,
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
    search: function () {
      wx.navigateTo({
        url: '../../packageShow/page/1-3 Search/Search',
      })
    },
  }
})
