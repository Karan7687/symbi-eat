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
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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
console.log("🔍 Serving static files from:", path.join(__dirname, "public"));
console.log("🔍 Serving JS from:", path.join(__dirname, "resources/js"));
console.log("🔍 Serving CSS from:", path.join(__dirname, "resources/css"));

app.use(expressLayout);

// Session Store
let mongoStore = MongoDbStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "sessions",
});

// Single session middleware for both user and admin
const appSession = session({
  name: 'symbiEatSession',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: mongoStore,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax'
  },
});

// Apply session middleware
app.use(appSession);

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
  
  // Add helper to check if user is authenticated in either session
  res.locals.isAuthenticated = req.isAuthenticated();
  
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  socket.on('join-room', (data) => {
    const { userId, role } = data;
    socket.join(`user-${userId}`);
    if (role === 'admin') {
      socket.join('admin-room');
    }
    console.log(`👤 User ${userId} (${role}) joined room`);
  });
  
  socket.on('update-order-status', (data) => {
    const { orderId, status } = data;
    console.log(`📦 Order ${orderId} status updated to: ${status}`);
    
    // Broadcast to all connected clients
    io.emit('order-status-updated', {
      orderId,
      status,
      orderNumber: orderId.slice(-6) // Last 6 chars for display
    });
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Import routes
const initRoutes = require("./routes/web");
initRoutes(app);
console.log("✅ Routes initialized");

// Default route
app.get("/", (req, res) => {
  console.log("🟢 GET / hit");
  res.render("home");
});

// Start server
const PORT = process.env.NODE_ENV === 'development' ? process.env.DEV_PORT || 3101 : process.env.PORT || 3100;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});
