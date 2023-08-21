// components/tags/tags.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isScroll: { type: Boolean, value: true },
    tagsList: { type: Array, value: [] },
    activeTag: { type: Number, value: 0 },
    value: { type: String, value: "" }
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
    tagTap: function (e) {
      const { index } = e.currentTarget.dataset
      const { tag } = e.currentTarget.dataset
      this.setData({
        activeTag: index
      })
      this.triggerEvent('tagtap', { tag })
    },

    tapDIY: function (e) {
      const tag = e.detail.value
      this.setData({
        activeTag: -1
      })
      this.triggerEvent('tagtap', { tag })
    },

    input: function (e) {
      const { value } = e.detail
      this.triggerEvent('taginput', { value })
    }
  }
})
