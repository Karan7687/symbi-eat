require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("express-flash");

const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "resources/css")));
app.use("/resources-js", express.static(path.join(__dirname, "resources/js")));

// Session middleware (without MongoDB store for now)
app.use(session({
  name: 'symbiEatSession',
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
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
  // Mock authenticated user for testing
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

// Basic routes
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

// Home page with integrated timer
app.get("/home-timer", (req, res) => {
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

// Test route for global timer
app.get("/test-timer", (req, res) => {
  res.sendFile(path.join(__dirname, 'test-timer.html'));
});

// Direct HTML test route
app.get("/timer-test", (req, res) => {
  res.sendFile(path.join(__dirname, 'test-timer.html'));
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

app.get("/admin/dashboard", (req, res) => {
  res.render("admin/dashboard", {
    orders: [
      {
        _id: 'order1',
        orderNumber: 'ORD123456',
        status: 'pending',
        total: 200,
        queuePosition: 1,
        totalPrepTime: 8,
        remainingTime: 8,
        items: [
          { name: 'Classic Burger', quantity: 1 },
          { name: 'Tea', quantity: 2 }
        ],
        customerId: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        createdAt: new Date()
      },
      {
        _id: 'order2',
        orderNumber: 'ORD123457', 
        status: 'preparing',
        total: 150,
        queuePosition: 2,
        totalPrepTime: 6,
        remainingTime: 6,
        items: [
          { name: 'Veggie Sandwich', quantity: 2 }
        ],
        customerId: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        },
        createdAt: new Date()
      }
    ],
    stats: {
      totalOrders: 25,
      pendingOrders: 3,
      confirmedOrders: 2,
      preparedOrders: 1,
      completedOrders: 19,
      avgOrderValue: 145.50
    }
  });
});

// Mock API endpoints for testing
app.get("/api/orders", (req, res) => {
  res.json({
    success: true,
    orders: [
      {
        _id: 'order1',
        orderNumber: 'ORD123456',
        status: 'pending',
        queuePosition: 1,
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

// Start server
const PORT = process.env.DEV_PORT || 3102;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ Server started successfully (without MongoDB)');
  console.log('📝 Note: MongoDB is not connected, using mock data');
});
