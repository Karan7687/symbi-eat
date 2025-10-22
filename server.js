require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connection = mongoose.connection;
const path = require("path");
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");
const client = require("prom-client"); // ✅ Prometheus client

const app = express();

// ==================== Prometheus Metrics ====================
// Create a counter metric for HTTP requests
const requestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP Requests",
  labelNames: ["method", "route", "status"],
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on("finish", () => {
    requestCounter.labels(req.method, req.path, res.statusCode).inc();
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});
// ============================================================

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "resources/css")));
app.use("/resources-js", express.static(path.join(__dirname, "resources/js")));

app.use(expressLayout);

// Session Store
let mongoStore = MongoDbStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "sessions",
});

// Session middleware (⚠️ this should come before passport initialization)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport config (⚠️ passport comes after session middleware)
const passportInit = require("./app/config/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());
// Flash messages
app.use(flash());

// Set views & template engine
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("Failed to connect to DB", err));

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

// Import routes
const initRoutes = require("./routes/web");
initRoutes(app);

// Default route
app.get("/", (req, res) => {
  res.render("home");
});

// Start server
const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
