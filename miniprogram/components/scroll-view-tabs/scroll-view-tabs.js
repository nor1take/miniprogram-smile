// components/tabs/tabs.js
Component({
  options: {
    multipleSlots: true   //使用[具名插槽]要配置multipleSlots
  },
  /**
   * 组件的属性列表
   */
  properties: {
    top: { type: Number, value: 0, },
    left: { type: Number, value: 0, },
    right: { type: Number, value: 0, },
    bottom: { type: Number, value: 0, },

    tabs: { type: Array, value: [] },
    activeTab: { type: Number, value: 0 },
    refresherTriggered: { type: Boolean, value: false }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentView: 0,
  },
  observers: {
    activeTab: function activeTab(_activeTab) {
      const len = this.data.tabs.length
      if (len === 0) return
      let currentView = _activeTab - 1
      if (currentView < 0) currentView = 0
      if (currentView > len - 1) currentView = len - 1
      this.setData({ currentView })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    tabsTap: function (e) {
      const { index } = e.currentTarget.dataset;
      this.setData({ activeTab: index })
      this.triggerEvent('tabclick', { index })
    },
    swiperChange: function (e) {
      const index = e.detail.current;
      this.setData({ activeTab: index })
      this.triggerEvent('change', { index })
    },
    reachBottom: function () {
      this.triggerEvent('reachBottom')
    },
    refresh: function () {
      this.triggerEvent('refresh')
    }
  }
})
