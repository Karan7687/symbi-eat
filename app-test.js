require("dotenv").config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");

const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/css", express.static(path.join(__dirname, "resources/css")));
app.use("/resources-js", express.static(path.join(__dirname, "resources/js")));

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
      }
    ]
  });
});

app.get("/cart", (req, res) => {
  res.render("cart");
});

app.post("/orders", (req, res) => {
  console.log("📦 Order placed!");
  res.render("customers/orders", {
    success: true,
    orderId: 'order123',
    orderNumber: 'ORD123456',
    orders: [{
      _id: 'order123',
      orderNumber: 'ORD123456',
      status: 'pending',
      total: 120,
      createdAt: new Date()
    }]
  });
});

// Start server
const PORT = 3100;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('✅ Server started successfully - place order to see timer!');
});
