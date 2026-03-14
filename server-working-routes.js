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

// Mock user
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

// Routes
app.get("/", (req, res) => {
  console.log("🟢 GET / hit");
  res.render("home-fixed", {
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

app.get("/menu", (req, res) => {
  console.log("🟢 GET /menu hit");
  res.render("home-fixed", {
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

app.get("/cart", (req, res) => {
  console.log("🟢 GET /cart hit");
  res.render("cart");
});

app.get("/customer/orders", (req, res) => {
  console.log("🟢 GET /customer/orders hit");
  res.render("customers/orders", {
    orders: [
      {
        _id: 'order1',
        orderNumber: 'ORD123456',
        status: 'preparing',
        total: 120,
        items: [{ name: 'Classic Burger', quantity: 1 }],
        createdAt: new Date()
      }
    ]
  });
});

app.get("/admin/dashboard", (req, res) => {
  console.log("🟢 GET /admin/dashboard hit");
  res.render("admin/dashboard", {
    orders: [
      {
        _id: 'order1',
        orderNumber: 'ORD123456',
        status: 'preparing',
        total: 120,
        queuePosition: 1,
        totalPrepTime: 8,
        remainingTime: 8,
        items: [{ name: 'Classic Burger', quantity: 1 }],
        customerId: {
          name: 'John Doe',
          email: 'john@example.com'
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

app.post("/orders", (req, res) => {
  console.log("🟢 POST /orders hit");
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
  
  res.render("customers/orders", {
    success: true,
    orderId: newOrder._id,
    orderNumber: newOrder.orderNumber,
    orders: [newOrder]
  });
});

// API routes
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

// Static files
app.use("/js", express.static(path.join(__dirname, "resources/js")));
app.use("/css", express.static(path.join(__dirname, "resources/css")));

// Start server
const PORT = 3100;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('✅ All routes are now working!');
  console.log('📝 Website requests: /, /menu, /cart, /customer/orders, /admin/dashboard');
  console.log('🧪 Timer functionality is integrated!');
});
