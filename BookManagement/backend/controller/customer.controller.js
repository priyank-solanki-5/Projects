import Customer from "../models/customer.models.js";
import Order from "../models/order.models.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        code: "INVALID_INPUT",
        message: "name and phone are required",
      });
    }

    // normalize phone (strip non-digits)
    const normalizedPhone = String(phone).replace(/\D/g, "");
    if (!/^\d{10,15}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        code: "INVALID_PHONE",
        message: "phone must contain 10-15 digits",
      });
    }

    // Upsert by phone: create new or update existing customer's name/email
    const updated = await Customer.findOneAndUpdate(
      { phone: normalizedPhone },
      {
        $set: {
          name: String(name).trim(),
          email: email ? String(email).trim() : "",
          phone: normalizedPhone,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("createCustomer error:", err && err.stack ? err.stack : err);
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_PHONE",
        message: "Phone number already exists",
      });
    }
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: err?.message || "Internal server error",
    });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    // Option A: return customers table
    const customers = await Customer.find().sort({ createdAt: -1 });

    // Optionally augment with orders count and total spent
    const out = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({ "customer.phone": c.phone });
        const total = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        return {
          ...c.toObject(),
          ordersCount: orders.length,
          totalSpent: total,
        };
      })
    );

    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Customer not found" });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Customer not found" });
    res.json(updated);
  } catch (err) {
    // duplicate key (phone) -> send 409
    if (err && err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Phone number already used by another customer" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
