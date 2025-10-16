/**
 * 简单的验证码测试
 */

const axios = require('axios');

async function simpleTest() {
  console.log('🔍 简单验证码测试...');
  
  try {
    const response = await axios.post('http://localhost:3000/api/auth/send-verification-code', {
      email: 'test@example.com'
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 成功:', response.data);
    
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.log('❌ 请求超时');
    } else if (error.response) {
      console.log('❌ 错误响应:', error.response.data);
    } else {
      console.log('❌ 网络错误:', error.message);
    }
  }
}

simpleTest();