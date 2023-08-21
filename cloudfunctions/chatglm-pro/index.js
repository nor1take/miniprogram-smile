// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const jwt = require('jsonwebtoken');

const apiKey = [
  process.env.key1,
  process.env.key2,
  process.env.key3,
  process.env.key4,
  process.env.key5,
  process.env.key6,
  process.env.key7,
  process.env.key8,
  process.env.key9,
  process.env.key10,
]; // 替换为您的API Key

const randomNum = Math.floor(Math.random() * apiKey.length);

const secret = apiKey[randomNum].split('.')[1]; // 提取API Key中的secret部分

function generateToken(apiKey, expSeconds) {
  const id = apiKey.split('.')[0];

  const payload = {
    api_key: id,
    exp: Math.floor(Date.now() / 1000) + expSeconds,
    timestamp: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    header: { alg: 'HS256', sign_type: 'SIGN' },
  });

  return token;
}

function trimString(inputString) {
  // 去除首尾双引号
  while (inputString.startsWith('"')) {
    inputString = inputString.slice(1);
  }
  while (inputString.endsWith('"')) {
    inputString = inputString.slice(0, -1);
  }
  inputString = inputString.replace(/\\n/g, '\n');
  // 去除首尾空格和回车
  inputString = inputString.trim();
  return inputString;
}

const request = require('request-promise');

// Function to make an asynchronous API call to start a conversation
async function startConversation(authToken, history) {
  const url = 'https://open.bigmodel.cn/api/paas/v3/model-api/chatglm_pro/async-invoke';

  const requestData = {
    prompt: history
  };

  const options = {
    method: 'POST',
    uri: url,
    headers: {
      'Authorization': authToken
    },
    body: requestData,
    json: true
  };

  const response = await request(options);
  return response;
}

// Function to query the result of an asynchronous API call
async function queryResult(taskId, authToken) {
  const url = `https://open.bigmodel.cn/api/paas/v3/model-api/-/async-invoke/${taskId}`;

  const options = {
    method: 'GET',
    uri: url,
    headers: {
      'Authorization': authToken
    },
    json: true
  };

  const response = await request(options);
  return response;
}

// Example usage
async function main(authToken, history) {
  let queryResponse;
  try {
    const startResponse = await startConversation(authToken, history);
    console.log('Start Response:', startResponse);

    if (startResponse.success) {
      const taskId = startResponse.data.task_id;
      do {
        queryResponse = await queryResult(taskId, authToken);
        console.log('Query Response:', queryResponse);

        if (queryResponse.success && queryResponse.data.task_status === 'SUCCESS') {
          // Handle successful response here
          console.log('content:', queryResponse.data.choices[0].content);
          const completion = trimString(queryResponse.data.choices[0].content)
          return completion
        } else if (queryResponse.success && queryResponse.data.task_status === 'PROCESSING') {
          // Wait before querying again
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 500ms
        } else {
          console.error('Query API Call failed:', queryResponse.msg);
          break; // Exit loop in case of error
        }
      } while (queryResponse.success && queryResponse.data.task_status === 'PROCESSING');
    } else {
      console.error('Start API Call failed:', startResponse.msg);
    }
  } catch (error) {
    console.error('An error occurred:', error);
    //     return completion

  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const expSeconds = 3600; // 设置过期时间，单位为秒
  const authToken = generateToken(apiKey[randomNum], expSeconds);
  console.log(authToken); // 输出生成的鉴权token

  let { input, history } = event;
  if (history.length % 2 != 0) {
    history.push("")
  }
  history.push(input)
  console.log(history)

  const historyInRoleFormat = history.map((message, index) => {
    const role = index % 2 === 0 ? 'user' : 'assistant';
    return { role, content: message };
  });
  //   const formattedHistoryString = JSON.stringify(historyInRoleFormat);
  console.log(historyInRoleFormat);
  const completion = await main(authToken, historyInRoleFormat)

  return {
    completion,
    input
  }
}