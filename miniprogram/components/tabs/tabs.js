// components/tabs/tabs.js

Component({
  options: {
    multipleSlots: true   //使用[具名插槽]要配置multipleSlots
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: { type: Array, value: [] },
    top: { type: Number, value: 0 },
    scrollTop: { type: Number, value: 0 },
    activeTab: { type: Number, value: 0 },
    refresherTriggered:{type:Boolean,value:false}
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
    tabsTap: function (e) {
      const { index } = e.currentTarget.dataset;
      this.setData({activeTab: index})
      this.triggerEvent('tabclick', { index })
    },
    swiperChange: function (e) {
      const index = e.detail.current;
      this.setData({activeTab: index})
      this.triggerEvent('change', { index })
    },
    reachBottom:function(){
      this.triggerEvent('reachBottom')
    },
    refresh:function(){
      this.triggerEvent('refresh')
    }
  }
})
