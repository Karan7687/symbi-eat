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
    // phone:{type:String, required:true},
    // address:{type:String, required:true},
    paymentType: { type: String, default: "UPI" },
    status: { type: String, default: "order_Placed" },
    total: {
      type: Number,
      required: true,
    },

    //linking myUSerCollection with myOrderCollection
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
