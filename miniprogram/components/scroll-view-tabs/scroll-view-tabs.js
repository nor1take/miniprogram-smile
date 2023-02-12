// components/tabs/tabs.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabs:{
      type:Array,
      value:[]
    },
    top:{
        type:Number,
        value:0
    }
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    currentView:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tabsTap:function(e){
      // console.log(e.currentTarget.dataset.index)
      const {index} = e.currentTarget.dataset;
      let currentView = index - 1
      if (currentView < 0) currentView = 0
      if (currentView > 5) currentView = 4
      this.setData({currentView})
      //子向父传递参数index，父自定义事件 bind+itemChange
      this.triggerEvent('itemChange',{index})
      
    },
    search:function(){
      wx.navigateTo({
        url: '../1-3 Search/Search',
      })
    },
  }
})
