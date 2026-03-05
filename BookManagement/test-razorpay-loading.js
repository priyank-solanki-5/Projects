// Test script to verify Razorpay script loading
// Run this in browser console to test

function testRazorpayLoading() {
  console.log('🧪 Testing Razorpay Script Loading...');
  
  // Check if Razorpay is already loaded
  if (window.Razorpay) {
    console.log('✅ Razorpay is already loaded');
    return true;
  }
  
  // Try to load Razorpay script
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      resolve(true);
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Razorpay script:', error);
      resolve(false);
    };
    
    // Set timeout
    setTimeout(() => {
      console.error('❌ Razorpay script loading timeout');
      script.remove();
      resolve(false);
    }, 10000);
    
    document.head.appendChild(script);
  });
}

// Run the test
testRazorpayLoading().then(success => {
  if (success) {
    console.log('🎉 Razorpay loading test passed!');
  } else {
    console.log('❌ Razorpay loading test failed!');
    console.log('💡 Try these solutions:');
    console.log('1. Check your internet connection');
    console.log('2. Try refreshing the page');
    console.log('3. Check if Razorpay is blocked by firewall');
    console.log('4. Use cash payment as fallback');
  }
});
