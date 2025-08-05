const testUserRegister = async () => {
  const testData = {
    fullName: "Test User",
    phoneNumber: "0123456789",
    username: "testuser" + Date.now(),
    email: "test" + Date.now() + "@example.com",
    password: "password123"
  };

  console.log('🧪 Testing user registration with data:', testData);

  try {
    const response = await fetch('https://api.dinamondbet68.com/functions/v1/user-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', result);

    if (result.success) {
      console.log('✅ Registration successful!');
      console.log('👤 User created:', result.user);
    } else {
      console.log('❌ Registration failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Test error:', error);
  }
};

// Run the test
testUserRegister(); 