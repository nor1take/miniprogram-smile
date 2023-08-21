// components/search/search.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    top: { type: Number, value: 48, },
    left: { type: Number, value: 281, },
    right: { type: Number, value: 367, },
    bottom: { type: Number, value: 80, },
    nickName: { type: String, value: '' },
    avatarUrl: { type: String, value: '' },
    isManager: { type: Boolean, value: false },
    isAuthentic: { type: Boolean, value: false },
    idTitle: { type: String, value: '' },

  },

  /**
   * 组件的初始数据
   */
  data: {
    menu: false,
    menuAnimation: {},
    backAnimation: {},
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
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

    modify: function () {
      wx.navigateTo({
        url: '../../packageLogin/pages/0-0 Login/Login',
        // url: '../../packageMy/pages/3-0 MySpace/MySpace'
      })
    },

    menu: function () {
      //console.log('menu')
      var animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      })
      var b = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      })
      this.animation = animation
      this.b = b
      b.opacity(0.75).step()
      animation.left(0).step()
      this.setData({
        menuAnimation: this.animation.export(),
        backAnimation: this.b.export(),
        menu: true
      })
    },
    back: function () {
      //console.log('back')
      var animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      })
      var b = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease',
      })
      this.animation = animation
      this.b = b
      b.opacity(0).step()
      animation.left(-this.data.left).step()
      this.setData({
        menuAnimation: this.animation.export(),
        backAnimation: this.b.export(),
        menu: false
      })
    },

    mySpace: function () {
      wx.navigateTo({
        url: '../../packageMy/pages/3-0 MySpace/MySpace',
      })
    },

    myCollect: function () {
      wx.navigateTo({
        url: '../../packageMy/pages/3-2 MyCollect/MyCollect',
      })
    },

    // help: function () {
    //   wx.navigateTo({
    //     url: '../../packageMy/pages/0-1 TopPost/TopPost',
    //   })
    // },
    warn: function () {
      wx.navigateTo({
        url: '../../packageMy/pages/3-4 WarnPosts/WarnPosts',
      })
    },
    systemMsg: function () {
      wx.navigateTo({
        url: '../../packageMy/pages/3-5 SystemMsg/SystemMsg',
      })
    }
  }
})
