async function testRegister() {
  try {
    console.log('🧪 Testing registration with auto-login...');
    console.log('📡 Making request to backend...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Test User Auto Login',
        username: 'testuser123',
        email: 'test@example.com',
        password: '123456'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      // Check if user data includes login info
      if (data.data.user.lastLoginAt) {
        console.log('🎉 Auto-login successful! User has lastLoginAt:', data.data.user.lastLoginAt);
      } else {
        console.log('❌ Auto-login failed - no lastLoginAt found');
      }
    } else {
      console.log('❌ Registration failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRegister();
