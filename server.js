// server.js
const express = require("express");
const app = express();
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");

// Set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// Import mongoose
const mongoose = require("mongoose");

// DB connection
const url = "mongodb://localhost/SymbiEat-Application";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection; // Corrected here

// Listening for connection open
connection.once("open", () => {
  console.log("DB Connected");
});

// Listening for connection error
connection.on("error", (err) => {
  console.log("Failed to connect to DB", err);
});

// Server static files
app.use(express.static("public"));

// Import routes
const initRoutes = require("./routes/web");
initRoutes(app); // Call the function with the app as an argument

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
