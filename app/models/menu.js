const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menuSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'],
    required: true 
  },
  description: { type: String, default: '' },
  preparationTime: { type: Number, default: 15 }, // in minutes
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  ingredients: [{ type: String }], // array of ingredients
  nutritionInfo: {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number }
  }
});

module.exports = mongoose.model("Menu", menuSchema);
