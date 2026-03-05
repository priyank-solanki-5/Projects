// Network Diagnostic Tool for Razorpay Issues
// Run this in browser console to diagnose network problems

const networkDiagnostic = async () => {
  console.log("=== NETWORK DIAGNOSTIC FOR RAZORPAY ===");
  
  // Check basic connectivity
  console.log("1. Basic Connectivity:");
  console.log("- Online status:", navigator.onLine);
  console.log("- User agent:", navigator.userAgent);
  
  // Test DNS resolution
  console.log("\n2. DNS Resolution Test:");
  const testUrls = [
    "https://checkout.razorpay.com",
    "https://cdn.razorpay.com", 
    "https://js.razorpay.com"
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      console.log(`✅ ${url} - Accessible`);
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
  
  // Test script loading
  console.log("\n3. Script Loading Test:");
  const scriptUrls = [
    "https://checkout.razorpay.com/v1/checkout.js",
    "https://cdn.razorpay.com/static/v1/checkout.js"
  ];
  
  for (const scriptUrl of scriptUrls) {
    try {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = (e) => reject(e);
        setTimeout(() => reject(new Error('Timeout')), 5000);
      });
      
      document.head.appendChild(script);
      await loadPromise;
      console.log(`✅ ${scriptUrl} - Loaded successfully`);
      script.remove();
    } catch (error) {
      console.log(`❌ ${scriptUrl} - Error: ${error.message}`);
    }
  }
  
  // Check for ad blockers
  console.log("\n4. Ad Blocker Detection:");
  try {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-999px';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      console.log(`Ad blocker detected: ${isBlocked ? 'YES' : 'NO'}`);
      document.body.removeChild(testAd);
    }, 100);
  } catch (error) {
    console.log("Ad blocker test failed:", error.message);
  }
  
  // Check CORS and security policies
  console.log("\n5. Security Policy Check:");
  console.log("- HTTPS required:", location.protocol === 'https:');
  console.log("- Mixed content allowed:", document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? 'Check CSP' : 'No CSP');
  
  console.log("\n=== DIAGNOSTIC COMPLETE ===");
  console.log("If all tests fail, try:");
  console.log("1. Disable ad blockers");
  console.log("2. Check firewall settings");
  console.log("3. Try different network (mobile hotspot)");
  console.log("4. Use cash payment as fallback");
};

// Run diagnostic
networkDiagnostic();
