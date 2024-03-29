// app.js
App({
  globalData: {
    tmpPost: {},
    follow: false,
    questionId: '',
    isClick: false,

    questionDelete: false,

    isAsk: false,

    openId: '',
    otherOpenId: '',
    title: '',
    nickName: '',
    avatarUrl: '',

    messageNum: 0,

    isManager: false,
    isLogin: false,
    isAuthentic: false,
    idTitle: '',
    modifyNum: 0,
    isCheckSystemMsg: true,
    isModify: false,
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: '',
        traceUser: true,
      });
    }

    const res = wx.getMenuButtonBoundingClientRect()
    const windowInfo = wx.getWindowInfo()
    this.globalData = {
      top: res.top,
      left: res.left,
      right: res.right,
      bottom: res.bottom,
      
      screenHeight: windowInfo.screenHeight,

      questionIndex: -1,
    };
  },
});
