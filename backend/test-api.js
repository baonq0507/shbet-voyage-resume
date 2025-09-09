// Script test API endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test data
const testUser = {
  fullName: 'Test User',
  username: 'testuser123',
  email: 'test@example.com',
  password: 'password123',
  phoneNumber: '0123456789'
};

let authToken = '';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error.message);
    return { status: 500, data: { error: error.message } };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiRequest('/health');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  
  if (result.data.success && result.data.data) {
    authToken = result.data.data.token;
    console.log('✅ Registration successful, token saved');
    return true;
  }
  return false;
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: testUser.username,
      password: testUser.password
    })
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  
  if (result.data.success && result.data.data) {
    authToken = result.data.data.token;
    console.log('✅ Login successful, token updated');
    return true;
  }
  return false;
}

async function testGetCurrentUser() {
  console.log('\n👤 Testing Get Current User...');
  const result = await apiRequest('/auth/me');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testGetGames() {
  console.log('\n🎮 Testing Get Games...');
  const result = await apiRequest('/games/all?limit=5');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testGetGameCategories() {
  console.log('\n📂 Testing Get Game Categories...');
  const result = await apiRequest('/games/categories');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testCreateDepositOrder() {
  console.log('\n💰 Testing Create Deposit Order...');
  const result = await apiRequest('/transactions/deposit', {
    method: 'POST',
    body: JSON.stringify({
      amount: 100000
    })
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testGetTransactions() {
  console.log('\n📊 Testing Get Transactions...');
  const result = await apiRequest('/transactions?limit=5');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testGetUserProfile() {
  console.log('\n👤 Testing Get User Profile...');
  const result = await apiRequest('/users/profile');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testAddBankAccount() {
  console.log('\n🏦 Testing Add Bank Account...');
  const result = await apiRequest('/users/bank-accounts', {
    method: 'POST',
    body: JSON.stringify({
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountHolder: 'Test User'
    })
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 201;
}

async function testGetBankAccounts() {
  console.log('\n🏦 Testing Get Bank Accounts...');
  const result = await apiRequest('/users/bank-accounts');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

async function testLogout() {
  console.log('\n🚪 Testing Logout...');
  const result = await apiRequest('/auth/logout', {
    method: 'POST'
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.status === 200;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('=====================================');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Get Games', fn: testGetGames },
    { name: 'Get Game Categories', fn: testGetGameCategories },
    { name: 'Create Deposit Order', fn: testCreateDepositOrder },
    { name: 'Get Transactions', fn: testGetTransactions },
    { name: 'Get User Profile', fn: testGetUserProfile },
    { name: 'Add Bank Account', fn: testAddBankAccount },
    { name: 'Get Bank Accounts', fn: testGetBankAccounts },
    { name: 'Logout', fn: testLogout }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Test Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('🎉 All tests passed! System is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the logs above.');
  }

  return results;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
