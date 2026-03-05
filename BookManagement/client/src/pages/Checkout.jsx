import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../store/cartContextValue";
import Button from "../components/Buttons";

const MOBILE_UPI_APPS = [
  "google_pay",
  "phonepe",
  "paytm",
  "amazon_pay",
  "bhim",
  "cred",
];

const detectMobileDevice = () => {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test((navigator.userAgent || "").toLowerCase());
};

const getDeviceSnapshot = () => {
  if (typeof navigator === "undefined") return {};
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    vendor: navigator.vendor,
    online: navigator.onLine,
  };
};

const Checkout = () => {
  const API_BASE =
    (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
    "https://bookstore-c1tt.onrender.com";
  const navigate = useNavigate();

  // Enhanced payment configuration for LIVE mode only
  const PAYMENT_CONFIG = {
    timeout: 600000, // 10 minutes
    retryAttempts: 3,
    retryDelay: 3000, // 3 seconds
    scriptTimeout: 8000, // 8 seconds
    cdnSources: [
      "https://checkout.razorpay.com/v1/checkout.js",
      "https://cdn.razorpay.com/static/v1/checkout.js",
      "https://js.razorpay.com/v1/checkout.js",
    ],
    environment: 'live' // Force live mode
  };

  // Log API base URL for debugging
  // console.log("API Base URL:", API_BASE);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const { cart = [], clearCart } = useContext(CartContext) || {};
  const [paymentType, setPaymentType] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [razorpayPreloaded, setRazorpayPreloaded] = useState(false);
  const reportPaymentIssue = async (payload = {}) => {
    try {
      await axios.post(`${API_BASE}/api/payments/report-client-error`, {
        ...payload,
        deviceInfo: getDeviceSnapshot(),
      });
    } catch (error) {
      console.debug("Payment issue logging failed", error?.message);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Preload Razorpay script when component mounts
  useEffect(() => {
    if (paymentType === "online" && !razorpayPreloaded) {
      console.log("Preloading Razorpay script...");

      // Check network connectivity first
      if (!navigator.onLine) {
        console.warn("No internet connection detected");
        return;
      }

      loadRazorpayScript()
        .then(() => {
          setRazorpayPreloaded(true);
          console.log("Razorpay preloaded successfully");
        })
        .catch((error) => {
          console.warn("Razorpay preload failed:", error);
          // Don't show error to user during preload, but log for debugging
        });
    }
  }, [paymentType]);

  // Enhanced Razorpay script loading with multiple CDN fallbacks
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        console.log("Razorpay already loaded");
        resolve(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector(
        'script[src*="checkout.razorpay.com"]'
      );
      if (existingScript) {
        console.log("Razorpay script already exists, waiting for load...");
        const checkLoaded = () => {
          if (window.Razorpay) {
            resolve(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Use configured CDN sources for better reliability
      const cdnSources = PAYMENT_CONFIG.cdnSources;

      let currentSourceIndex = 0;
      let timeoutId;

      const tryLoadScript = () => {
        if (currentSourceIndex >= cdnSources.length) {
          reject(
            new Error(
              "All Razorpay CDN sources failed. Please check your internet connection or try using cash payment."
            )
          );
          return;
        }

        const scriptSrc = cdnSources[currentSourceIndex];
        console.log(`Loading Razorpay script from: ${scriptSrc}`);

        const script = document.createElement("script");
        script.src = scriptSrc;
        script.async = true;
        script.crossOrigin = "anonymous";
        // Remove integrity attribute as it's causing issues and Razorpay doesn't provide SRI hashes
        script.referrerPolicy = "strict-origin-when-cross-origin";

        script.onload = () => {
          console.log(`Razorpay script loaded successfully from: ${scriptSrc}`);
          clearTimeout(timeoutId);
          resolve(true);
        };

        script.onerror = (error) => {
          console.error(
            `Failed to load Razorpay script from ${scriptSrc}:`,
            error
          );
          script.remove();
          currentSourceIndex++;

          if (currentSourceIndex < cdnSources.length) {
            console.log(`Trying next CDN source...`);
            setTimeout(tryLoadScript, 1000); // Wait 1 second before trying next source
          } else {
            clearTimeout(timeoutId);
            reject(
              new Error(
                "Failed to load Razorpay payment gateway from all sources. Please check your internet connection or try using cash payment."
              )
            );
          }
        };

        // Set timeout for script loading
        timeoutId = setTimeout(() => {
          console.error(`Razorpay script loading timeout from ${scriptSrc}`);
          script.remove();
          currentSourceIndex++;

          if (currentSourceIndex < cdnSources.length) {
            console.log(`Timeout, trying next CDN source...`);
            setTimeout(tryLoadScript, PAYMENT_CONFIG.retryDelay);
          } else {
            reject(
              new Error(
                "Payment gateway loading timeout from all sources. Please try again or use cash payment."
              )
            );
          }
        }, PAYMENT_CONFIG.scriptTimeout);

        document.head.appendChild(script);
      };

      tryLoadScript();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.phone) {
      alert("⚠️ Please fill in all required fields");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      alert("⚠️ Phone number must be 10 digits");
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("⚠️ Please enter a valid email address or leave it blank");
      return;
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      alert("⚠️ Cart is empty. Add items before placing an order.");
      return;
    }

    // Validate stock availability
    const stockErrors = [];
    for (const item of cart) {
      if (item.stock !== undefined && item.quantity > item.stock) {
        stockErrors.push(
          `${item.title || item.name}: Only ${item.stock} available, ${
            item.quantity
          } requested`
        );
      }
    }

    if (stockErrors.length > 0) {
      alert("⚠️ Stock validation failed:\n" + stockErrors.join("\n"));
      return;
    }

    // Validate and prepare payload
    const payload = {
      items: (cart || []).map((it) => {
        const item = {
          isCombo: Boolean(it.isCombo),
          bookId: it.isCombo ? null : it._id || it.id || null,
          title: (it.title || it.name || "").trim(),
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
        };

        // Validate item data
        if (!item.title) {
          throw new Error(`Item title is required for all items`);
        }
        if (item.price <= 0) {
          throw new Error(`Invalid price for item: ${item.title}`);
        }
        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for item: ${item.title}`);
        }

        return item;
      }),
      totalAmount: (cart || []).reduce(
        (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1),
        0
      ),
      customer: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || "",
      },
    };

    // Validate total amount
    if (payload.totalAmount <= 0) {
      alert("⚠️ Total amount must be greater than 0");
      return;
    }

    console.log("Prepared payload:", payload);

    setProcessing(true);
    setPaymentStatus("Processing...");

    try {
      // Create customer first
      const custBody = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };
      if (formData.email?.trim()) {
        custBody.email = formData.email.trim();
      }

      // Validate customer data before sending
      if (!custBody.name || custBody.name.length < 2) {
        throw new Error("Customer name must be at least 2 characters long");
      }
      if (!custBody.phone || !/^\d{10}$/.test(custBody.phone)) {
        throw new Error("Phone number must be exactly 10 digits");
      }
      if (
        custBody.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(custBody.email)
      ) {
        throw new Error("Invalid email format");
      }

      console.log("Creating customer with data:", custBody);
      const custRes = await axios.post(`${API_BASE}/api/customers`, custBody);
      // Support both response shapes: legacy (customer object) and new { success, data }
      const customerFromDb =
        custRes?.data?.success && custRes?.data?.data
          ? custRes.data.data
          : custRes.data || {};
      console.log("Customer created successfully:", customerFromDb);

      const firstCombo = (cart || []).find((c) => c.isCombo);
      const payloadWithCustomer = {
        ...payload,
        ...(firstCombo ? { comboId: firstCombo._id || firstCombo.id } : {}),
        customer: {
          name: customerFromDb.name,
          phone: customerFromDb.phone,
          email: customerFromDb.email,
        },
      };

      if (paymentType === "cash") {
        // Cash payment - direct order creation
        setPaymentStatus("Creating order...");
        console.log("Creating cash order with payload:", {
          ...payloadWithCustomer,
          paymentType: "cash",
          paymentStatus: "paid",
        });
        await axios.post(`${API_BASE}/api/orders`, {
          ...payloadWithCustomer,
          paymentType: "cash",
          paymentStatus: "paid",
        });
        afterSuccess();
        return;
      }

      // Online payment with Razorpay
      setPaymentStatus("Creating payment order...");

      // Create order with pending status
      console.log("Creating pending order with payload:", {
        ...payloadWithCustomer,
        paymentType: "online",
        paymentStatus: "pending",
      });
      const preOrder = await axios.post(`${API_BASE}/api/orders`, {
        ...payloadWithCustomer,
        paymentType: "online",
        paymentStatus: "pending",
      });
      const created = preOrder.data;
      console.log("Order created successfully:", created);

      // Create Razorpay order
      console.log(
        "Creating Razorpay order with amount:",
        Math.round((created.totalAmount || 0) * 100)
      );
      const razorpayOrderRes = await axios.post(
        `${API_BASE}/api/payments/create-order`,
        {
          amount: Math.round((created.totalAmount || 0) * 100), // Convert to paise
          currency: "INR",
          receipt: `order_${created._id}`,
        }
      );

      if (!razorpayOrderRes.data.success) {
        throw new Error(
          razorpayOrderRes.data.message || "Failed to create payment order"
        );
      }

      const razorpayOrder = razorpayOrderRes.data.order;
      const razorpayKeyId = razorpayOrderRes.data.key_id;

      setPaymentStatus("Loading payment gateway...");

      // Load Razorpay script with enhanced retry mechanism
      let scriptLoaded = false;
      let retryCount = 0;
      const maxRetries = PAYMENT_CONFIG.retryAttempts;

      while (!scriptLoaded && retryCount < maxRetries) {
        try {
          await loadRazorpayScript();
          scriptLoaded = true;
          console.log(
            "Razorpay script loaded successfully on attempt",
            retryCount + 1
          );
        } catch (scriptError) {
          retryCount++;
          console.error(
            `Razorpay script loading failed (attempt ${retryCount}):`,
            scriptError
          );

          if (retryCount < maxRetries) {
            setPaymentStatus(
              `Retrying payment gateway loading... (${retryCount}/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, PAYMENT_CONFIG.retryDelay));
          } else {
            // Enhanced error detection and user guidance
            const networkError =
              scriptError.message.includes("ERR_CONNECTION_RESET") ||
              scriptError.message.includes("ERR_NAME_NOT_RESOLVED") ||
              scriptError.message.includes("Failed to load");

            let errorMessage =
              "❌ Payment gateway failed to load after multiple attempts.\n\n";

            if (networkError) {
              errorMessage +=
                "🔍 Network Issue Detected:\n" +
                "• Check your internet connection\n" +
                "• Try disabling VPN/proxy if active\n" +
                "• Check if firewall is blocking Razorpay\n" +
                "• Try refreshing the page\n\n";
            } else {
              errorMessage +=
                "This might be due to:\n" +
                "• Ad blockers or security software\n" +
                "• Browser compatibility issues\n" +
                "• Corporate network restrictions\n\n";
            }

            errorMessage +=
              "Would you like to:\n" +
              "• Click OK to switch to cash payment\n" +
              "• Click Cancel to retry online payment";

            const userConfirmed = confirm(errorMessage);

            if (userConfirmed) {
              // Switch to cash payment
              setPaymentType("cash");
              setPaymentStatus("Switched to cash payment");
              // Continue with cash payment flow
              setPaymentStatus("Creating order...");
              await axios.post(`${API_BASE}/api/orders`, {
                ...payloadWithCustomer,
                paymentType: "cash",
                paymentStatus: "paid",
              });
              afterSuccess();
              return;
            } else {
              setPaymentStatus(
                "Payment gateway loading failed - please try again"
              );
              return;
            }
          }
        }
      }

      setPaymentStatus("Opening payment gateway...");

      // Configure Razorpay options with enhanced error handling
      // Sanitize and validate contact
      const sanitizedContact = String(customerFromDb.phone || "").replace(
        /\D/g,
        ""
      );
      const isValidContact = /^\d{10}$/.test(sanitizedContact);

      const isMobile = detectMobileDevice();

      const buildRazorpayOptions = (forceCollectFlow = false) => {
        const baseOptions = {
          key: razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "ESchool Book Store",
          description: `Order #${created._id} - ${(cart || []).length} item(s)`,
          order_id: razorpayOrder.id,
          image: "https://via.placeholder.com/150x50/22c55e/ffffff?text=ESchool",
          handler: async function (response) {
            try {
              setPaymentStatus("Verifying payment...");

              // Verify payment on server with timeout
              const verifyPromise = axios.post(
                `${API_BASE}/api/payments/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }
              );

              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Payment verification timeout")),
                  30000
                )
              );

              const verifyRes = await Promise.race([
                verifyPromise,
                timeoutPromise,
              ]);

              if (verifyRes.data.success && verifyRes.data.verified) {
                // Update order status to paid
                await axios.put(`${API_BASE}/api/orders/${created._id}`, {
                  paymentStatus: "paid",
                  paymentId: response.razorpay_payment_id,
                  paymentOrderId: response.razorpay_order_id,
                  paymentSignature: response.razorpay_signature,
                  paymentMethod: "razorpay",
                  paymentTimestamp: new Date().toISOString(),
                });

                setPaymentStatus("Payment successful!");
                alert("✅ Payment successful! Order placed successfully.");
                afterSuccess();
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              console.error("Payment verification error:", error);

              // Handle different types of errors
              let errorMessage = "❌ Payment verification failed.";
              if (error.message.includes("timeout")) {
                errorMessage +=
                  " The verification is taking longer than expected. Please contact support with your payment ID.";
              } else if (error.response?.status === 500) {
                errorMessage += " Server error occurred. Please contact support.";
              } else {
                errorMessage += " Please contact support.";
              }

              alert(errorMessage);
              setPaymentStatus("Payment verification failed");

              // Log error for debugging
              console.error("Payment verification details:", {
                orderId: created._id,
                paymentId: response.razorpay_payment_id,
                error: error.message,
              });
            }
          },
          prefill: {
            name: customerFromDb.name,
            email: customerFromDb.email || "",
            ...(isValidContact ? { contact: sanitizedContact } : {}),
          },
          customer: {
            name: customerFromDb.name,
            email: customerFromDb.email || "",
            ...(isValidContact ? { contact: sanitizedContact } : {}),
          },
          theme: {
            color: "#22c55e",
            backdrop_color: "#000000",
          },
          modal: {
            ondismiss: function () {
              setPaymentStatus("Payment cancelled");
              console.log("Payment modal dismissed by user");
            },
          },
          retry: {
            enabled: true,
            max_count: PAYMENT_CONFIG.retryAttempts,
          },
          timeout: PAYMENT_CONFIG.timeout / 1000, // Convert to seconds
          remember_customer: false,
          // Production-ready configurations
          notes: {
            order_id: created._id,
            customer_phone: customerFromDb.phone,
            items_count: (cart || []).length,
          },
          // Enable all payment methods
          method: {
            netbanking: true,
            wallet: true,
            emi: true,
            upi: true,
            card: true,
          },
          upi: {
            flow: "collect",
          },
        };

        if (forceCollectFlow) {
          return {
            ...baseOptions,
            upi: {
              flow: "collect",
            },
            config: {
              display: {
                blocks: {
                  upi_manual: {
                    name: "Pay via any UPI ID",
                    instruments: [
                      {
                        method: "upi",
                        flows: ["collect"],
                      },
                    ],
                  },
                },
                sequence: ["block.upi_manual"],
                preferences: {
                  show_default_blocks: true,
                  show_description: true,
                },
              },
            },
          };
        }

        if (isMobile) {
          return {
            ...baseOptions,
            config: {
              display: {
                blocks: {
                  upi: {
                    name: "Pay via UPI Apps",
                    instruments: [
                      {
                        method: "upi",
                        flows: ["intent"],
                        apps: MOBILE_UPI_APPS,
                      },
                      {
                        method: "upi",
                        flows: ["collect"],
                      },
                    ],
                  },
                },
                preferences: {
                  show_default_blocks: true,
                  show_description: true,
                },
              },
            },
            upi: {
              flow: "intent",
            },
            external: {
              wallets: ["paytm", "phonepe", "amazon_pay"],
            },
          };
        }

        return baseOptions;
      };

      const openRazorpayCheckout = (forceCollectFlow = false) => {
        const options = buildRazorpayOptions(forceCollectFlow);
        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", async function (response) {
          try {
            console.error("Payment failed:", response.error);

            reportPaymentIssue({
              orderId: created._id,
              razorpayOrderId: razorpayOrder.id,
              paymentFlow: forceCollectFlow ? "upi_collect" : "upi_intent",
              error: response.error,
              customer: {
                name: customerFromDb.name,
                email: customerFromDb.email,
                phone: customerFromDb.phone,
              },
              extra: {
                paymentType,
                retryCount,
              },
            });
          } catch (logError) {
            console.debug("Failed to capture payment error", logError);
          }

          // Enhanced error handling for different failure types
          let errorMessage = "❌ Payment failed: ";
          const errorCode = response.error?.code;
          const errorDescription = response.error?.description || "Unknown error";
          const errorReason = response.error?.reason || "";
          const paymentMethod = response.error?.metadata?.payment_method;

          switch (errorCode) {
            case "BAD_REQUEST_ERROR":
              errorMessage +=
                "Invalid payment details. Please check your information.";
              break;
            case "GATEWAY_ERROR":
              errorMessage += "Payment gateway error. Please try again.";
              break;
            case "NETWORK_ERROR":
              errorMessage +=
                "Network error. Please check your internet connection.";
              break;
            case "SERVER_ERROR":
              errorMessage += "Server error. Please try again later.";
              break;
            default:
              errorMessage += errorDescription;
          }

          const shouldFallbackToCollect =
            isMobile &&
            !forceCollectFlow &&
            (paymentMethod === "upi" ||
              response.error?.metadata?.payment_mode === "upi") &&
            /invalid payment details/i.test(
              `${errorDescription} ${errorReason}`.trim() || ""
            );

          if (shouldFallbackToCollect) {
            setPaymentStatus(
              "UPI app rejected payment. Switching to manual UPI entry..."
            );
            openRazorpayCheckout(true);
            return;
          }

          alert(
            errorMessage +
              "\n\nYou can try again (another app or manual UPI) or use cash payment."
          );
          setPaymentStatus("Payment failed");

          // Log detailed error for debugging
          console.error("Payment failure details:", {
            orderId: created._id,
            errorCode,
            errorDescription,
            errorReason,
            response,
          });
        });

      // Add additional event listeners for better monitoring
        rzp.on("payment.authorized", function (response) {
          console.log("Payment authorized:", response);
        });

        rzp.on("payment.captured", function (response) {
          console.log("Payment captured:", response);
        });

        try {
          rzp.open();
        } catch (error) {
          console.error("Error opening Razorpay modal:", error);
          alert(
            "❌ Failed to open payment gateway. Please try again or use cash payment."
          );
          setPaymentStatus("Failed to open payment gateway");
        }
      };

      // Open Razorpay payment gateway in default mode
      openRazorpayCheckout(false);
    } catch (err) {
      console.error("Checkout failed", err);

      // Enhanced error logging to identify which API call failed
      if (err.response) {
        console.error("API Error Details:", {
          status: err.response.status,
          statusText: err.response.statusText,
          url: err.config?.url,
          method: err.config?.method,
          data: err.response.data,
          requestData: err.config?.data,
        });
      }

      let errorMessage = "❌ Failed to place order: ";
      let specificError = "";

      // Determine which API call failed
      const url = err.config?.url || "";
      if (url.includes("/api/customers"))
        specificError = "Customer creation failed. ";
      else if (url.includes("/api/orders"))
        specificError = "Order creation failed. ";
      else if (url.includes("/api/payments/create-order"))
        specificError = "Payment order creation failed. ";
      else if (url.includes("/api/payments/verify-payment"))
        specificError = "Payment verification failed. ";

      // Extract server response body if present
      const respData = err.response?.data;

      if (respData) {
        // Common shapes handled: { success: false, code, message }, { message }, or legacy raw object
        const serverMessage =
          respData?.message || respData?.error || respData?.msg;
        const serverCode = respData?.code || respData?.error_code;

        if (serverMessage) {
          errorMessage += specificError + serverMessage;
        } else if (serverCode) {
          errorMessage += `${specificError}Server responded with code: ${serverCode}`;
        } else {
          // Fallback: show the entire response body for debugging (trimmed)
          try {
            const bodyPreview = JSON.stringify(respData);
            errorMessage += `${specificError}Unexpected server response: ${bodyPreview}`;
          } catch {
            errorMessage += specificError + "Unknown error";
          }
        }

        // Attach HTTP status for more context
        if (err.response.status) {
          errorMessage += `\n\nHTTP Status: ${err.response.status}`;
        }
      } else if (err.request) {
        // Request was made but no response (network error / CORS / server down)
        errorMessage +=
          specificError + "No response from server (network error or CORS).";
        if (err.message) errorMessage += `\n\nDetail: ${err.message}`;
      } else {
        // Something else happened
        errorMessage += err.message || "Unknown error";
      }

      alert(errorMessage);
      setPaymentStatus("Order failed");
    } finally {
      setProcessing(false);
    }
  };

  function afterSuccess() {
    try {
      clearCart && clearCart();
    } catch (e) {
      console.debug("clearCart failed", e);
    }
    try {
      localStorage.removeItem("cart");
    } catch (e) {
      console.debug("localStorage remove cart failed", e);
    }
    navigate("/orders");
  }

  return (
    <div className="p-4 lg:p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">
        🧾 Checkout
      </h2>

      {/* Payment Status */}
      {paymentStatus && (
        <div
          className={`mb-4 p-3 border rounded-lg ${
            paymentStatus.includes("failed") || paymentStatus.includes("error")
              ? "bg-red-50 border-red-200"
              : paymentStatus.includes("success")
              ? "bg-green-50 border-green-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {paymentStatus.includes("failed") ||
            paymentStatus.includes("error") ? (
              <div className="text-red-600">❌</div>
            ) : paymentStatus.includes("success") ? (
              <div className="text-green-600">✅</div>
            ) : (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <span
              className={`font-medium ${
                paymentStatus.includes("failed") ||
                paymentStatus.includes("error")
                  ? "text-red-800"
                  : paymentStatus.includes("success")
                  ? "text-green-800"
                  : "text-blue-800"
              }`}
            >
              {paymentStatus}
            </span>
          </div>

          {/* Show Razorpay preload status */}
          {paymentType === "online" && (
            <div className="mt-2 text-xs text-gray-600">
              {razorpayPreloaded ? (
                <span className="text-green-600">✅ Payment gateway ready</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">
                    ⏳ Loading payment gateway...
                  </span>
                  <button
                    onClick={() => {
                      setRazorpayPreloaded(false);
                      loadRazorpayScript()
                        .then(() => setRazorpayPreloaded(true))
                        .catch(() => console.warn("Manual retry failed"));
                    }}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    🔄 Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {paymentStatus.includes("failed") && retryCount < 3 && (
            <div className="mt-2">
              <button
                onClick={() => {
                  setRetryCount(retryCount + 1);
                  setPaymentStatus("");
                  setProcessing(false);
                }}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                🔄 Retry Payment Gateway
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Name */}
        <div>
          <label className="block mb-1 font-medium">Customer Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-green-300"
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block mb-1 font-medium">Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-green-300"
            placeholder="Enter 10-digit phone number"
            required
          />
        </div>

        {/* Email (optional) */}
        <div>
          <label className="block mb-1 font-medium">Email (optional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:ring-green-300"
            placeholder="Enter email (optional)"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block mb-1 font-medium">Payment Method</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentType"
                value="cash"
                checked={paymentType === "cash"}
                onChange={() => setPaymentType("cash")}
              />
              💵 Cash
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="paymentType"
                value="online"
                checked={paymentType === "online"}
                onChange={() => setPaymentType("online")}
              />
              💳 Online Payment (Razorpay)
            </label>
          </div>
          {paymentType === "online" && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <strong>💡 Payment Gateway Status:</strong>
                {razorpayPreloaded ? (
                  <span className="text-green-600 font-medium">Ready ✅</span>
                ) : (
                  <span className="text-yellow-600 font-medium">
                    Loading... ⏳
                  </span>
                )}
              </div>
              <div className="text-xs text-blue-700">
                • 🔴 LIVE MODE: Real payment processing by Razorpay
                <br />
                • Supports UPI, Cards, Net Banking, Wallets
                <br />• If gateway fails to load, you can switch to cash payment
                {!navigator.onLine && (
                  <div className="mt-1 text-red-600 font-medium">
                    ⚠️ No internet connection detected
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-medium mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span>
                  {item.title || item.name} x{item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-1 mt-2 font-medium">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>
                  ₹
                  {cart
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <Button
          type="submit"
          disabled={processing}
          variant="primary"
          className="w-full disabled:opacity-60"
        >
          {processing
            ? "Processing..."
            : paymentType === "online"
            ? "💳 Pay with Razorpay"
            : "✅ Place Order"}
        </Button>
      </form>
    </div>
  );
};

export default Checkout;
