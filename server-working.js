require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const passport = require("passport");
const client = require("prom-client");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Basic middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "resources/css")));
app.use("/resources-js", express.static(path.join(__dirname, "resources/js")));

// Session Store (with fallback)
let mongoStore;
try {
  mongoStore = MongoDbStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions",
  });
} catch (error) {
  console.log("MongoDB store not available, using memory store");
}

// Session middleware
const appSession = session({
  name: 'symbiEatSession',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
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
app.use(flash());

// View engine
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// MongoDB connection (non-blocking)
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => console.log("❌ Failed to connect to DB, running without DB", err.message));

// Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated || false;
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join room functionality
  socket.on('join-room', (data) => {
    const room = `${data.role}-${data.userId}`;
    socket.join(room);
    console.log(`📱 User ${data.userId} joined room: ${room}`);
  });

  // Queue updates
  socket.on('join-queue-updates', () => {
    socket.join('queue-updates');
    console.log('📊 Client joined queue updates');
  });

  // Order tracking
  socket.on('order-tracking', (data) => {
    const orderRoom = `order-${data.orderId}`;
    socket.join(orderRoom);
    console.log(`📦 Tracking order: ${data.orderId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Mock API routes for testing
app.get("/api/orders", (req, res) => {
  res.json({
    success: true,
    orders: [
      {
        _id: 'order1',
        orderNumber: 'ORD123456',
        status: 'preparing',
        queuePosition: 2,
        totalPrepTime: 8,
        remainingTime: 8,
        estimatedFinishTime: new Date(Date.now() + 8 * 60000),
        items: [
          { name: 'Classic Burger', quantity: 1, preparationTime: 5 },
          { name: 'Tea', quantity: 2, preparationTime: 2 }
        ],
        createdAt: new Date()
      }
    ]
  });
});

app.get("/api/queue/status", (req, res) => {
  res.json({
    success: true,
    queueStatus: {
      totalOrdersInQueue: 2,
      pendingOrders: 1,
      preparingOrders: 1,
      averageWaitTime: 7,
      kitchenCapacity: 3,
      nextAvailableTime: new Date(Date.now() + 4 * 60000)
    }
  });
});

// Default route
app.get("/", (req, res) => {
  console.log("🟢 GET / hit");
  res.render("home");
});

// Home page with integrated timer
app.get("/home-timer", (req, res) => {
  console.log("🟢 GET /home-timer hit");
  res.render("home-with-timer", {
    foodItems: [
      {
        _id: '1',
        name: 'Classic Burger',
        price: 120,
        image: 'burger.jpg',
        preparationTime: 5,
        category: 'lunch'
      },
      {
        _id: '2', 
        name: 'Veggie Sandwich',
        price: 80,
        image: 'sandwich.jpg',
        preparationTime: 4,
        category: 'breakfast'
      },
      {
        _id: '3',
        name: 'Maggie Noodles',
        price: 60,
        image: 'maggie.jpg',
        preparationTime: 6,
        category: 'snacks'
      },
      {
        _id: '4',
        name: 'French Fries',
        price: 70,
        image: 'fries.jpg',
        preparationTime: 8,
        category: 'snacks'
      },
      {
        _id: '5',
        name: 'Pizza Slice',
        price: 150,
        image: 'pizza.jpg',
        preparationTime: 10,
        category: 'lunch'
      },
      {
        _id: '6',
        name: 'Coffee',
        price: 40,
        image: 'coffee.jpg',
        preparationTime: 3,
        category: 'beverages'
      }
    ]
  });
});

// Test route
app.get("/test", (req, res) => {
  res.send("Server is working! 🚀");
});

// Start server
const PORT = process.env.PORT || 3100;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server started successfully');
});
