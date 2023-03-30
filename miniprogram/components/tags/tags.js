// components/tags/tags.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isScroll: { type: Boolean, value: true },
    tagsList: { type: Array, value: [] }
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeTag: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tagTap: function (e) {
      const { index } = e.currentTarget.dataset
      const { tagname } = e.currentTarget.dataset
      this.setData({
        activeTag: index
      })
      this.triggerEvent('tagtap', { tagname })
    },

    tapDIY: function (e) {
      const tagname = e.detail.value
      this.setData({
        activeTag: -1
      })
      this.triggerEvent('tagtap', { tagname })
    },

    input: function (e) {
      const { value } = e.detail
      this.triggerEvent('taginput', { value })
    }
  }
})
