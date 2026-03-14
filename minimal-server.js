require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const session = require("express-session");
const MongoDbStore = require("connect-mongo");

const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "resources/css")));
app.use("/resources-js", express.static(path.join(__dirname, "resources/js")));

// Session Store
let mongoStore = MongoDbStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "sessions",
});

// Session middleware
const appSession = session({
  name: 'symbiEatSession',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  },
});

app.use(appSession);

// View engine
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.log("❌ Failed to connect to DB", err));

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated || false;
  next();
});

// Basic route
app.get("/", (req, res) => {
  console.log("🟢 GET / hit");
  res.render("home");
});

// Start server
const PORT = process.env.NODE_ENV === 'development' ? process.env.DEV_PORT || 3101 : process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});
