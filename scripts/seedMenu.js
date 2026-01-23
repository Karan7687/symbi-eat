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

    // Sample menu items
    const menuItems = [
      // Breakfast Items
      {
        name: "Masala Dosa",
        image: "dosa.jpg",
        price: 60,
        size: "Regular",
        category: "breakfast",
        description: "Crispy rice crepe with potato filling, served with sambar and chutney",
        preparationTime: 15,
        isPopular: true,
        ingredients: ["Rice", "Potatoes", "Spices", "Sambar", "Chutney"],
        nutritionInfo: { calories: 250, protein: 8, carbs: 45, fat: 6 }
      },
      {
        name: "Idli Sambar",
        image: "idli.jpg",
        price: 40,
        size: "4 pieces",
        category: "breakfast",
        description: "Steamed rice cakes served with sambar and chutney",
        preparationTime: 10,
        isAvailable: true,
        ingredients: ["Rice", "Lentils", "Sambar", "Chutney"],
        nutritionInfo: { calories: 180, protein: 6, carbs: 35, fat: 2 }
      },
      {
        name: "Poha",
        image: "poha.jpg",
        price: 35,
        size: "Regular",
        category: "breakfast",
        description: "Flattened rice cooked with onions, potatoes, and spices",
        preparationTime: 12,
        isAvailable: true,
        ingredients: ["Flattened Rice", "Onions", "Potatoes", "Spices"],
        nutritionInfo: { calories: 200, protein: 4, carbs: 38, fat: 4 }
      },

      // Lunch Items
      {
        name: "Veg Thali",
        image: "thali.jpg",
        price: 120,
        size: "Full plate",
        category: "lunch",
        description: "Complete meal with rice, dal, vegetables, roti, and dessert",
        preparationTime: 20,
        isPopular: true,
        ingredients: ["Rice", "Dal", "Vegetables", "Roti", "Salad", "Dessert"],
        nutritionInfo: { calories: 650, protein: 18, carbs: 85, fat: 20 }
      },
      {
        name: "Paneer Butter Masala",
        image: "paneer.jpg",
        price: 140,
        size: "Regular",
        category: "lunch",
        description: "Soft cottage cheese cubes in creamy tomato-based gravy",
        preparationTime: 25,
        isAvailable: true,
        ingredients: ["Paneer", "Tomatoes", "Cream", "Butter", "Spices"],
        nutritionInfo: { calories: 380, protein: 22, carbs: 12, fat: 28 }
      },
      {
        name: "Veg Biryani",
        image: "biryani.jpg",
        price: 110,
        size: "Regular",
        category: "lunch",
        description: "Fragrant rice cooked with mixed vegetables and aromatic spices",
        preparationTime: 30,
        isPopular: true,
        ingredients: ["Basmati Rice", "Mixed Vegetables", "Spices", "Herbs"],
        nutritionInfo: { calories: 420, protein: 8, carbs: 75, fat: 12 }
      },

      // Dinner Items
      {
        name: "Dal Makhani",
        image: "dal.jpg",
        price: 90,
        size: "Regular",
        category: "dinner",
        description: "Creamy black lentils cooked with butter and cream",
        preparationTime: 35,
        isAvailable: true,
        ingredients: ["Black Lentils", "Butter", "Cream", "Tomatoes", "Spices"],
        nutritionInfo: { calories: 320, protein: 12, carbs: 28, fat: 18 }
      },
      {
        name: "Mix Veg Curry",
        image: "mixveg.jpg",
        price: 80,
        size: "Regular",
        category: "dinner",
        description: "Seasonal vegetables cooked in aromatic gravy",
        preparationTime: 20,
        isAvailable: true,
        ingredients: ["Mixed Vegetables", "Onions", "Tomatoes", "Spices"],
        nutritionInfo: { calories: 180, protein: 6, carbs: 22, fat: 8 }
      },

      // Snacks
      {
        name: "Samosa",
        image: "samosa.jpg",
        price: 20,
        size: "2 pieces",
        category: "snacks",
        description: "Crispy triangular pastry with spicy potato filling",
        preparationTime: 10,
        isPopular: true,
        ingredients: ["Potatoes", "Peas", "Flour", "Spices"],
        nutritionInfo: { calories: 150, protein: 3, carbs: 20, fat: 7 }
      },
      {
        name: "Veg Sandwich",
        image: "sandwich.jpg",
        price: 45,
        size: "Regular",
        category: "snacks",
        description: "Grilled sandwich with fresh vegetables and cheese",
        preparationTime: 8,
        isAvailable: true,
        ingredients: ["Bread", "Vegetables", "Cheese", "Butter"],
        nutritionInfo: { calories: 280, protein: 10, carbs: 32, fat: 12 }
      },
      {
        name: "French Fries",
        image: "fries.jpg",
        price: 50,
        size: "Regular",
        category: "snacks",
        description: "Crispy golden potato fries with seasoning",
        preparationTime: 12,
        isAvailable: true,
        ingredients: ["Potatoes", "Salt", "Spices", "Oil"],
        nutritionInfo: { calories: 320, protein: 4, carbs: 42, fat: 16 }
      },

      // Beverages
      {
        name: "Fresh Lime Soda",
        image: "lime.jpg",
        price: 30,
        size: "Glass",
        category: "beverages",
        description: "Refreshing drink with fresh lime and soda",
        preparationTime: 5,
        isAvailable: true,
        ingredients: ["Fresh Lime", "Soda", "Sugar", "Salt"],
        nutritionInfo: { calories: 80, protein: 0, carbs: 20, fat: 0 }
      },
      {
        name: "Mango Lassi",
        image: "lassi.jpg",
        price: 40,
        size: "Glass",
        category: "beverages",
        description: "Sweet yogurt drink with mango pulp",
        preparationTime: 5,
        isPopular: true,
        ingredients: ["Yogurt", "Mango", "Sugar", "Cardamom"],
        nutritionInfo: { calories: 180, protein: 6, carbs: 32, fat: 4 }
      },
      {
        name: "Cold Coffee",
        image: "coffee.jpg",
        price: 60,
        size: "Glass",
        category: "beverages",
        description: "Chilled coffee with ice cream and chocolate syrup",
        preparationTime: 8,
        isAvailable: true,
        ingredients: ["Coffee", "Milk", "Ice Cream", "Chocolate Syrup"],
        nutritionInfo: { calories: 250, protein: 8, carbs: 28, fat: 12 }
      },

      // Desserts
      {
        name: "Gulab Jamun",
        image: "gulab.jpg",
        price: 35,
        size: "2 pieces",
        category: "desserts",
        description: "Soft milk dumplings soaked in sugar syrup",
        preparationTime: 15,
        isPopular: true,
        ingredients: ["Milk", "Sugar", "Cardamom", "Rose Water"],
        nutritionInfo: { calories: 220, protein: 4, carbs: 38, fat: 6 }
      },
      {
        name: "Ice Cream Scoop",
        image: "icecream.jpg",
        price: 40,
        size: "Scoop",
        category: "desserts",
        description: "Creamy ice cream in various flavors",
        preparationTime: 2,
        isAvailable: true,
        ingredients: ["Milk", "Sugar", "Cream", "Flavorings"],
        nutritionInfo: { calories: 180, protein: 3, carbs: 24, fat: 8 }
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
