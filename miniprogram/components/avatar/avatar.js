// components/avatar/avatar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    avatarUrl: { type: String, value: '' },
    length: { type: Number, value: 55 },
    color: { type: String, value: 'transparent' },
    openid: { type: String, value: '' },
    fromShow: { type: Boolean, value: false }
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
      if (this.data.fromShow) {
        wx.navigateTo({
          url: '../../packageMy/pages/3-0 MySpace/MySpace?openid=' + this.data.openid,
        }).catch((err) => {
          //console.log(err)
        })
      } else {
        //console.log('跳转')
        wx.navigateTo({
          url: '../../../packageMy/pages/3-0 MySpace/MySpace?openid=' + this.data.openid,
        }).catch((err) => {
          //console.log(err)
        })
      }

    }
  }
})
