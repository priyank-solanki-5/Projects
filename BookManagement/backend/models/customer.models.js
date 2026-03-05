import mongoose from "mongoose";

const { Schema, model } = mongoose;

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default model("Customer", customerSchema);
