// components/avatar/avatar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    avatarUrl: { type: String, value: '' },
    length: { type: Number, value: 55 },
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
    goToMySpace: function () {
      wx.navigateTo({
        url: '../../packageMy/pages/3-0 MySpace/MySpace',
      })
    }
  }
})
