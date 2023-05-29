// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const crypto = require("crypto");
const rp = require('request-promise')
const { OPENID } = cloud.getWXContext()

var apiKeyArr = [
  "d35e4df0c6d54e74b3bd35cf3e608b26",
  "02f25a84342f4b8ea32b261e8f347fdf",
  "8726beccba9b40138560d682bee416c8"
]

var publicKeyArr = [
  "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKBRzxjnRbvr+gaK56bQ9u23ZlEWL3d7g1zUC5SaZxipJj9l/DuQPgEFcczwFIv3lqkIgfAVNOkR1f0RYtjJTJsCAwEAAQ==",
  "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJWTKkF+XsT2t6WF2cRyyndL5/uNXlE5l2dNCEU1tzfoqtm3qkLAhCHXxURdOjMdKyFJkVUWPjTGXO5nlsbO0YcCAwEAAQ==",
  "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMTw0IaTxHQvDRKji7xu/7XkJEhojMyCJ6q8cXehmjSp+LGzObWSayttHun5YS21+/BbOp3bjHT3v4HS1Rl4KokCAwEAAQ=="
]
const randomNum = Math.floor(Math.random() * 3);

const apiKey = apiKeyArr[randomNum];
// 定义公钥
const publicKey = publicKeyArr[randomNum];

const ChatGLM_6B_url = "https://maas.aminer.cn/api/paas/model/v2/open/engines/chatglm_qa_6b/chatglm_6b"
const ChatGLM_130B_url = "https://maas.aminer.cn/api/paas/model/v1/open/engines/chatGLM/chatGLM"

function rsaEncode(text, publicKey) {
  const buffer = Buffer.from(text, "utf-8");
  const key = crypto.createPublicKey({
    key: "-----BEGIN PUBLIC KEY-----\n" + publicKey + "\n-----END PUBLIC KEY-----",
    format: "pem",
    type: "spki",
  });

  const encrypted = crypto.publicEncrypt(
    {
      key,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    buffer
  );

  return encrypted.toString("base64");
}

async function getResponseFromAPI2(input, history) {
  const a = {
    generatedLength: 450,
    top_p: 0.7,
    temperature: 0.9,
    prompt: input,
    history: history,
    requestTaskNo: OPENID + Date.now().toString(),
  };
  console.log(publicKey);
  const encrypted = rsaEncode(Date.now().toString(), publicKey);
  console.log(encrypted);

  let chatData;
  try {
    const tokenData = await rp({
      method: "POST",
      uri: "https://maas.aminer.cn/api/paas/passApiToken/createApiToken",
      body: {
        encrypted: encrypted,
        apiKey,
      },
      json: true,
    });
    console.log(tokenData.data);
    chatData = await rp({
      method: "POST",
      uri: ChatGLM_130B_url,
      // uri: ChatGLM_6B_url,
      headers: {
        Authorization: tokenData.data,
      },
      body: a,
      json: true,
    });
    console.log(chatData);
    //return chatData.data;
    const { taskOrderNo } = chatData.data

    var result;
    let taskStatus = "PROCESSING"
    while (taskStatus == 'PROCESSING') {
      result = await rp({
        method: "GET",
        uri:
          "https://maas.aminer.cn/api/paas/request-task/query-request-task-result/" + taskOrderNo,
        headers: {
          Authorization: tokenData.data,
        },
        json: true
      })
      taskStatus = result.data.taskStatus
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return result.data.outputText
  } catch (err) {
    console.error(err);
    return chatData.msg;
  }
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

// 云函数入口函数
exports.main = async (event, context) => {
  let { input, history } = event;
  if (history.length == 0) {
    history = [
      '北工大学生的门诊、急诊费用具体报销有哪些要求？',
      '1. 2022年1月至11月发生的医疗费用，请于2022年12月9日（含当日）前进行报销；2. 本学期最后一次报销日为：2022年12月9日在一站式服务大厅办理；3. 2022年12月发生的医疗费用，请于新学期2023年3月份的报销日进行报销。特别提示：2022年12月的门诊、急诊等相关医疗费用报销截止日为2023年3月31日；逾期未报者，责任自负。',
    ]
  }
  let completion = await getResponseFromAPI2(input, history);

  if (isEmpty(completion)) {
    completion = '[当前接口提问人数过多！请稍后再试或重新提问]'
  }

  return {
    completion,
    input
  }
}