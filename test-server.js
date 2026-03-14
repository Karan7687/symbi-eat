require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

console.log("Starting server test...");

// Test MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ DB Connected");
    
    const app = express();
    const PORT = 3102;
    
    app.get("/", (req, res) => {
      res.send("Server is working!");
    });
    
    app.listen(PORT, () => {
      console.log(`🚀 Test server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ Failed to connect to DB", err);
  });
