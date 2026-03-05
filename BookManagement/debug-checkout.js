// Debug helper for checkout issues
// Add this to your Checkout.jsx temporarily to debug the 400 error

const debugCheckout = async () => {
  const API_BASE =
    (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
    "https://bookstore-roan-nu.vercel.app";

  console.log("=== CHECKOUT DEBUG ===");
  console.log("API Base URL:", API_BASE);

  // Test customer creation
  try {
    console.log("Testing customer creation...");
    const testCustomer = {
      name: "Test User",
      phone: "9876543210",
      email: "test@example.com",
    };

    const response = await fetch(`${API_BASE}/api/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCustomer),
    });

    console.log("Customer API Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Customer API Error:", errorData);
    } else {
      const data = await response.json();
      console.log("Customer created successfully:", data);
    }
  } catch (error) {
    console.error("Customer creation failed:", error);
  }

  // Test order creation
  try {
    console.log("Testing order creation...");
    const testOrder = {
      items: [
        {
          isCombo: false,
          bookId: "test-book-id",
          title: "Test Book",
          price: 100,
          quantity: 1,
        },
      ],
      totalAmount: 100,
      customer: {
        name: "Test User",
        phone: "9876543210",
        email: "test@example.com",
      },
      paymentType: "cash",
      paymentStatus: "paid",
    };

    const response = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testOrder),
    });

    console.log("Order API Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Order API Error:", errorData);
    } else {
      const data = await response.json();
      console.log("Order created successfully:", data);
    }
  } catch (error) {
    console.error("Order creation failed:", error);
  }

  // Test payment order creation
  try {
    console.log("Testing payment order creation...");
    const testPayment = {
      amount: 10000, // 100 rupees in paise
      currency: "INR",
      receipt: "test_receipt_123",
    };

    const response = await fetch(`${API_BASE}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayment),
    });

    console.log("Payment API Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Payment API Error:", errorData);
    } else {
      const data = await response.json();
      console.log("Payment order created successfully:", data);
    }
  } catch (error) {
    console.error("Payment order creation failed:", error);
  }

  console.log("=== DEBUG COMPLETE ===");
};

// Call this function in browser console to debug
// debugCheckout();
