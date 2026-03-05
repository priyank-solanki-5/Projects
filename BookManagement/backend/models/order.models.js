import mongoose from "mongoose";

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    items: [
      {
        // bookId is optional now because items can be combos (no book reference)
        bookId: { type: Schema.Types.ObjectId, ref: "Book" },
        title: String,
        price: Number,
        quantity: { type: Number, default: 1 },
        isCombo: { type: Boolean, default: false },
      },
    ],
    totalAmount: { type: Number, required: true },
    customer: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    // flags for returns/exchanges
    isReturn: { type: Boolean, default: false },
    isExchange: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    comboId: { type: Schema.Types.ObjectId, ref: "Combo" },
    // payment fields
    paymentType: { type: String, enum: ["cash", "online"], default: "cash" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId: { type: String },
    paymentOrderId: { type: String },
    paymentSignature: { type: String },
  },
  { timestamps: true }
);

export default model("Order", orderSchema);
