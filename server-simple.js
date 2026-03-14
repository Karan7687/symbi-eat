require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("express-flash");
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

// Basic middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "resources/css")));
app.use("/resources-js", express.static(path.join(__dirname, "resources/js")));

// Session middleware
app.use(session({
  name: 'symbiEatSession',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  },
}));

app.use(flash());

// View engine
app.set("views", path.join(__dirname, "/resources/views"));
app.set("view engine", "ejs");

// Mock user for testing
app.use((req, res, next) => {
  req.user = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: false
  };
  req.isAuthenticated = () => true;
  
  res.locals.session = req.session;
  res.locals.user = req.user;
  res.locals.isAuthenticated = true;
  
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
  
  socket.on('order_created', (data) => {
    console.log('📦 New order created:', data);
    io.emit('order_created', data);
  });
  
  socket.on('order_status_changed', (data) => {
    console.log('📦 Order status changed:', data);
    io.emit('order_status_changed', data);
  });
  
  socket.on('queue_updated', (data) => {
    console.log('📊 Queue updated:', data);
    io.emit('queue_updated', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Mock API routes
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

// Mock order creation
app.post("/api/orders", (req, res) => {
  const newOrder = {
    _id: 'order' + Date.now(),
    orderNumber: 'ORD' + Date.now().toString().slice(-6),
    status: 'pending',
    queuePosition: 3,
    totalPrepTime: 10,
    remainingTime: 10,
    estimatedFinishTime: new Date(Date.now() + 10 * 60000),
    items: req.body.items || [{ name: 'Test Item', quantity: 1 }],
    createdAt: new Date()
  };
  
  // Emit real-time notification
  io.emit('order_created', {
    orderId: newOrder._id,
    orderNumber: newOrder.orderNumber,
    queuePosition: newOrder.queuePosition,
    estimatedWaitTime: newOrder.remainingTime,
    estimatedFinishTime: newOrder.estimatedFinishTime,
    totalOrdersInQueue: newOrder.queuePosition
  });
  
  res.json({
    success: true,
    order: newOrder
  });
});

// Routes
app.get("/", (req, res) => {
  console.log("🟢 GET / hit");
  res.render("home", {
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
      }
    ]
  });
});

app.get("/menu", (req, res) => {
  res.render("home", {
    foodItems: [
      {
        _id: '1',
        name: 'Classic Burger',
        price: 120,
        image: 'burger.jpg',
        preparationTime: 5,
        category: 'lunch'
      }
    ]
  });
});

app.get("/cart", (req, res) => {
  res.render("cart");
});

app.post("/orders", (req, res) => {
  // Simulate order placement
  const newOrder = {
    _id: 'order' + Date.now(),
    orderNumber: 'ORD' + Date.now().toString().slice(-6),
    status: 'pending',
    queuePosition: 1,
    totalPrepTime: 8,
    remainingTime: 8,
    estimatedFinishTime: new Date(Date.now() + 8 * 60000),
    items: [{ name: 'Classic Burger', quantity: 1 }],
    createdAt: new Date()
  };
  
  // Emit real-time notification
  io.emit('order_created', {
    orderId: newOrder._id,
    orderNumber: newOrder.orderNumber,
    queuePosition: newOrder.queuePosition,
    estimatedWaitTime: newOrder.remainingTime,
    estimatedFinishTime: newOrder.estimatedFinishTime,
    totalOrdersInQueue: newOrder.queuePosition
  });
  
  res.render("customers/orders", {
    success: true,
    orderId: newOrder._id,
    orderNumber: newOrder.orderNumber,
    orders: [newOrder]
  });
});

// Start server
const PORT = process.env.PORT || 3100;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server started successfully');
  console.log('📝 Place an order to see the timer in action!');
});
