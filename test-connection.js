#!/usr/bin/env node

const http = require('http');

console.log('🔍 Testing Frontend-Backend Connection...\n');

// Test backend health endpoint
function testBackend() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend is running on http://localhost:5000');
          console.log('📊 Health check response:', JSON.parse(data));
          resolve(true);
        } else {
          console.log('❌ Backend health check failed');
          reject(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Backend is not running on http://localhost:5000');
      console.log('💡 Start backend with: npm run dev:backend');
      reject(false);
    });

    req.on('timeout', () => {
      console.log('⏰ Backend request timed out');
      req.destroy();
      reject(false);
    });

    req.end();
  });
}

// Test frontend
function testFrontend() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend is running on http://localhost:3000');
        resolve(true);
      } else {
        console.log('❌ Frontend responded with status:', res.statusCode);
        reject(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ Frontend is not running on http://localhost:3000');
      console.log('💡 Start frontend with: npm run dev:frontend');
      reject(false);
    });

    req.on('timeout', () => {
      console.log('⏰ Frontend request timed out');
      req.destroy();
      reject(false);
    });

    req.end();
  });
}

// Test API endpoint
function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/public',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API endpoint is accessible');
          resolve(true);
        } else {
          console.log('❌ API endpoint returned status:', res.statusCode);
          reject(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ API endpoint is not accessible');
      reject(false);
    });

    req.on('timeout', () => {
      console.log('⏰ API request timed out');
      req.destroy();
      reject(false);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Testing connections...\n');
  
  let backendOk = false;
  let frontendOk = false;
  let apiOk = false;

  try {
    backendOk = await testBackend();
  } catch (e) {
    // Backend test failed
  }

  try {
    frontendOk = await testFrontend();
  } catch (e) {
    // Frontend test failed
  }

  if (backendOk) {
    try {
      apiOk = await testAPI();
    } catch (e) {
      // API test failed
    }
  }

  console.log('\n📋 Connection Test Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Backend (http://localhost:5000):  ${backendOk ? '✅ Running' : '❌ Not running'}`);
  console.log(`Frontend (http://localhost:3000): ${frontendOk ? '✅ Running' : '❌ Not running'}`);
  console.log(`API (http://localhost:5000/api):  ${apiOk ? '✅ Accessible' : '❌ Not accessible'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (backendOk && frontendOk && apiOk) {
    console.log('\n🎉 All systems are running! Your application is ready to use.');
    console.log('\n🔗 Quick Links:');
    console.log('   • Frontend: http://localhost:3000');
    console.log('   • Backend:  http://localhost:5000');
    console.log('   • API:      http://localhost:5000/api');
  } else {
    console.log('\n⚠️  Some services are not running. Please check the following:');
    if (!backendOk) {
      console.log('   • Start backend: npm run dev:backend');
    }
    if (!frontendOk) {
      console.log('   • Start frontend: npm run dev:frontend');
    }
    console.log('   • Or start both: npm run dev');
  }
  
  console.log('\n💡 Need help? Check the README.md for setup instructions.');
}

runTests();