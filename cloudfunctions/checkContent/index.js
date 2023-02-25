const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { value, txt, scene } = event;
  const { OPENID } = cloud.getWXContext()
  try {
    let msgR = false;
    let imageR = false;
    
    //检查 文字内容是否违规
    if (txt) {
      msgR = await cloud.openapi.security.msgSecCheck({
        content: txt,
        version: 2,
        scene: scene,
        openid: OPENID
      })
    }
    //检查 图片内容是否违规
    if (value) {
      console.log(value)
      imageR = await cloud.openapi.security.mediaCheckAsync({
        openid: OPENID,
        scene: scene,
        version: 2,
        media_type: 2,
        media_url: value
      })
    }
    return {
      msgR,   //内容检查返回值
      imageR,   //图片检查返回值
    };
  } catch (err) {
    // 错误处理
    // err.errCode !== 0
    return err
  }
}