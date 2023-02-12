const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();

// 修改数据库信息云函数入口函数
exports.main = async (event, context) => { 
  return await db.collection('comment').update({
      data: {
        like:false
      },
    });
    
};
