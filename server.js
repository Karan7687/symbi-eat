require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("express-flash");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use(expressLayout);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "thisisasecretkey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Set views & template engine
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("Failed to connect to DB", err));

// Import routes
const initRoutes = require("./routes/web");
initRoutes(app);

// Default route (optional test)
app.get("/", (req, res) => {
  res.render("home");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
