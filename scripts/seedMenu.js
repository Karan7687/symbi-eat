require("dotenv").config();
const mongoose = require("mongoose");
const Menu = require("../app/models/menu");

async function seedMenu() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Clear existing menu items
    await Menu.deleteMany({});
    console.log("Cleared existing menu items");

    // Sample menu items - Updated with 4 existing + 8 new dishes = 12 total
    const menuItems = [
      // Snacks - Existing
      {
        name: "Spring Roll",
        image: "springroll.jpg",
        price: 90,
        size: "Regular",
        category: "snacks",
        description: "Crispy vegetable spring rolls with sweet chili sauce",
        preparationTime: 7,
        isAvailable: true,
        isPopular: false,
        ingredients: ["Vegetables", "Spring Roll Wrapper", "Sweet Chili Sauce", "Spices"],
        nutritionInfo: { calories: 220, protein: 6, carbs: 28, fat: 10 }
      },
      {
        name: "Samosa",
        image: "samosa.jpg",
        price: 25,
        size: "Regular",
        category: "snacks",
        description: "Crispy triangular pastry with spiced potato filling",
        preparationTime: 5,
        isAvailable: true,
        isPopular: true,
        ingredients: ["Potatoes", "Peas", "Flour", "Spices"],
        nutritionInfo: { calories: 150, protein: 3, carbs: 20, fat: 7 }
      },

      // Snacks - New
      {
        name: "Veg Pizza",
        image: "pizza.jpg",
        price: 120,
        size: "Medium",
        category: "snacks",
        description: "Thin crust pizza with vegetables and cheese",
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        ingredients: ["Pizza Base", "Vegetables", "Cheese", "Tomato Sauce"],
        nutritionInfo: { calories: 280, protein: 12, carbs: 35, fat: 10 }
      },
      {
        name: "Pasta",
        image: "pasta.jpg",
        price: 85,
        size: "Regular",
        category: "snacks",
        description: "Creamy pasta with mixed vegetables",
        preparationTime: 12,
        isAvailable: true,
        isPopular: false,
        ingredients: ["Pasta", "Cream", "Vegetables", "Cheese", "Herbs"],
        nutritionInfo: { calories: 320, protein: 8, carbs: 42, fat: 12 }
      },
      {
        name: "Burger",
        image: "burger.jpg",
        price: 75,
        size: "Regular",
        category: "snacks",
        description: "Vegetable patty with lettuce and sauce",
        preparationTime: 10,
        isAvailable: true,
        isPopular: true,
        ingredients: ["Bun", "Vegetable Patty", "Lettuce", "Tomato", "Sauce"],
        nutritionInfo: { calories: 350, protein: 15, carbs: 40, fat: 18 }
      },
      {
        name: "Noodles",
        image: "noodles.jpg",
        price: 65,
        size: "Regular",
        category: "snacks",
        description: "Stir-fried noodles with vegetables",
        preparationTime: 8,
        isAvailable: true,
        isPopular: false,
        ingredients: ["Noodles", "Vegetables", "Soy Sauce", "Spices"],
        nutritionInfo: { calories: 290, protein: 6, carbs: 45, fat: 8 }
      },

      // Desserts - Existing
      {
        name: "Ice Cream",
        image: "icecream.jpg",
        price: 50,
        size: "Regular",
        category: "desserts",
        description: "Vanilla ice cream with chocolate syrup",
        preparationTime: 2,
        isAvailable: true,
        isPopular: false,
        ingredients: ["Vanilla Ice Cream", "Chocolate Syrup", "Cream", "Sugar"],
        nutritionInfo: { calories: 180, protein: 3, carbs: 24, fat: 8 }
      },
      {
        name: "Brownie",
        image: "brownie.jpg",
        price: 60,
        size: "Regular",
        category: "desserts",
        description: "Chocolate brownie with nuts",
        preparationTime: 3,
        isAvailable: true,
        isPopular: true,
        ingredients: ["Chocolate", "Flour", "Nuts", "Butter", "Sugar"],
        nutritionInfo: { calories: 280, protein: 4, carbs: 35, fat: 15 }
      },

      // Desserts - New
      {
        name: "Cake Slice",
        image: "cake.jpg",
        price: 45,
        size: "Slice",
        category: "desserts",
        description: "Chocolate cake slice with cream",
        preparationTime: 2,
        isAvailable: true,
        isPopular: true,
        ingredients: ["Chocolate Cake", "Cream", "Sugar", "Flour"],
        nutritionInfo: { calories: 240, protein: 3, carbs: 30, fat: 12 }
      },
      {
        name: "Donut",
        image: "donut.jpg",
        price: 35,
        size: "Regular",
        category: "desserts",
        description: "Glazed donut with sprinkles",
        preparationTime: 3,
        isAvailable: true,
        isPopular: false,
        ingredients: ["Flour", "Sugar", "Glaze", "Sprinkles", "Yeast"],
        nutritionInfo: { calories: 200, protein: 3, carbs: 25, fat: 10 }
      },
      {
        name: "Cookie",
        image: "cookie.jpg",
        price: 25,
        size: "2 pieces",
        category: "desserts",
        description: "Chocolate chip cookies",
        preparationTime: 4,
        isAvailable: true,
        isPopular: true,
        ingredients: ["Flour", "Chocolate Chips", "Butter", "Sugar"],
        nutritionInfo: { calories: 160, protein: 2, carbs: 18, fat: 8 }
      },
      {
        name: "Milkshake",
        image: "milkshake.jpg",
        price: 55,
        size: "Glass",
        category: "desserts",
        description: "Thick chocolate milkshake",
        preparationTime: 5,
        isAvailable: true,
        isPopular: false,
        ingredients: ["Milk", "Ice Cream", "Chocolate Syrup", "Cream"],
        nutritionInfo: { calories: 320, protein: 8, carbs: 40, fat: 14 }
      }
    ];

    // Insert menu items
    await Menu.insertMany(menuItems);
    console.log(`✅ ${menuItems.length} menu items seeded successfully`);

    // Log categories
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log("📂 Categories added:", categories.join(", "));

  } catch (error) {
    console.error("Error seeding menu:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedMenu();
