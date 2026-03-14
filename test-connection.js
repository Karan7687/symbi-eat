require("dotenv").config();
console.log('Testing server components...');

// Test MongoDB connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    
    // Test basic Express setup
    const express = require("express");
    const app = express();
    
    app.get("/", (req, res) => {
      res.send("Server is working!");
    });
    
    const PORT = 3103;
    app.listen(PORT, () => {
      console.log(`🚀 Test server running at http://localhost:${PORT}`);
      console.log('✅ All components working correctly');
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Failed:", err.message);
  });
