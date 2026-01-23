const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: Object,
      required: true,
    },
    paymentType: { type: String, default: "UPI" },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending' 
    },
    total: {
      type: Number,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    estimatedDeliveryTime: {
      type: Date
    },
    actualDeliveryTime: {
      type: Date
    },
    deliveryAddress: {
      type: String,
      default: 'Campus Delivery'
    },
    phone: {
      type: String,
      required: true
    },
    specialInstructions: {
      type: String,
      default: ''
    },
    // Tracking information
    tracking: {
      orderPlaced: { type: Date, default: Date.now },
      orderConfirmed: { type: Date },
      preparingStarted: { type: Date },
      readyForPickup: { type: Date },
      delivered: { type: Date }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
