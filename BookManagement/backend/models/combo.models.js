import mongoose from "mongoose";

const comboSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Combo name is required"],
      trim: true,
      minlength: [1, "Combo name cannot be empty"]
    },
    description: { 
      type: String,
      trim: true
    },
    books: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Book',
      required: true
    }], // Reference to Book model
    price: { 
      type: Number, 
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    stock: { 
      type: Number, 
      min: [0, "Stock cannot be negative"],
      default: 0 
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

// Custom validation to ensure at least one book is selected
comboSchema.pre('validate', function(next) {
  if (!this.books || this.books.length === 0) {
    next(new Error('At least one book must be selected for the combo'));
  } else {
    next();
  }
});

export default mongoose.model("Combo", comboSchema);
