// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境


apiKey = 'GfQBA4ahwaBilvjmZpBAWQ=='
secretKey = 'IJIsXMqhHqvKb0kNwrmu66pRJNMJP2HqP4qqFKVCl1g='

// 引入blueimp-md5库
var md5 = require("blueimp-md5");
const rp = require('request-promise')

const d = new Date().getTime()

// 签名生成函数
function generateSignature(secretKey) {
  // 获取当前时间戳（毫秒）
  var currentTimeMillis = d
  // 拼接密钥和时间戳
  var str = secretKey + currentTimeMillis;
  // 计算MD5值
  var signature = md5(str);
  // 返回签名
  return signature;
}

const signature = generateSignature(secretKey)

async function getResponseFromAPI(input, previousAnswer) {
  const a = {
    apiKey: apiKey,
    timestamp: d,
    signature: signature,
    question: input,
    previousAnswer: previousAnswer
  };

  let result;
  try {
    result = await rp({
      method: "POST",
      uri: 'https://api.fengshenbang-lm.com/v1/mindbot_lite',
      body: a,
      json: true,
    });
    console.log(result)
    console.log(result.data.answer.content);
    return result.data.answer.content

  } catch (err) {
    console.error(err);
    return "[错误: 姜子牙Ziya 暂时不可用，请点击输入框左侧图标切换模型]"
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { input, history } = event;
  let completion = await getResponseFromAPI(input, history);

  return {
    completion,
    input
  }
}