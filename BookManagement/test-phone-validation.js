// Test script for phone number validation
// Run this in browser console to test the validation logic

function testPhoneValidation() {
  console.log('🧪 Testing Phone Number Validation...\n');

  const testCases = [
    // Valid cases
    { input: "9876543210", expected: "valid", description: "10-digit number" },
    { input: "+919876543210", expected: "valid", description: "+91 format" },
    { input: "1234567890", expected: "valid", description: "Another 10-digit number" },
    
    // Invalid cases
    { input: "987654321", expected: "invalid", description: "9-digit number" },
    { input: "98765432101", expected: "invalid", description: "11-digit number" },
    { input: "+91987654321", expected: "invalid", description: "+91 with 9 digits" },
    { input: "+9198765432101", expected: "invalid", description: "+91 with 11 digits" },
    { input: "+819876543210", expected: "invalid", description: "+81 instead of +91" },
    { input: "abc1234567", expected: "invalid", description: "Contains letters" },
    { input: "123-456-7890", expected: "invalid", description: "Contains dashes" },
    { input: "", expected: "invalid", description: "Empty string" }
  ];

  function validatePhone(phone) {
    if (!phone.trim()) {
      return { valid: false, error: "Phone number is required" };
    }

    const phoneTrimmed = phone.trim();
    const digitsOnly = phoneTrimmed.replace(/\D/g, "");

    // Check for +91 format
    if (phoneTrimmed.startsWith("+91")) {
      if (phoneTrimmed.length !== 13 || !/^\+91\d{10}$/.test(phoneTrimmed)) {
        return { valid: false, error: "Please enter a valid phone number in format +91XXXXXXXXXX (10 digits after +91)" };
      }
      return { valid: true, error: null };
    }
    // Check for 10-digit format
    else if (digitsOnly.length === 10 && /^\d{10}$/.test(digitsOnly)) {
      return { valid: true, error: null };
    }
    // Invalid format
    else {
      return { valid: false, error: "Please enter a valid 10-digit phone number or +91 followed by 10 digits" };
    }
  }

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    const result = validatePhone(testCase.input);
    const isCorrect = (testCase.expected === "valid") === result.valid;
    
    if (isCorrect) {
      console.log(`✅ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}" → Expected: ${testCase.expected} → Got: ${result.valid ? 'valid' : 'invalid'}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}" → Expected: ${testCase.expected} → Got: ${result.valid ? 'valid' : 'invalid'}`);
      console.log(`   Error: ${result.error}`);
      failed++;
    }
    console.log('');
  });

  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All phone validation tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the validation logic.');
  }
}

// Run the test
testPhoneValidation();
