import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"]
    },
    author: { 
      type: String, 
      required: false,
      trim: true
    },
    price: { 
      type: Number, 
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    stock: { 
      type: Number, 
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    category: {
      type: String,
      enum: {
        values: ["GSEB", "CBSE", "Other"],
        message: "Category must be one of: GSEB, CBSE, Other"
      },
      default: "GSEB",
    },
    medium: {
      type: String,
      enum: {
        values: ["Gujarati", "English"],
        message: "Medium must be one of: Gujarati, English"
      },
      default: "Gujarati",
    },
    imageUrl: { 
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Image URL must be a valid HTTP/HTTPS URL"
      }
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
