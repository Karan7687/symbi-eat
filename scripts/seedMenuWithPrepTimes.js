const mongoose = require('mongoose');
const Menu = require('../app/models/Menu');
require('dotenv').config();

// Menu items with preparation times
const menuItems = [
  // Breakfast
  {
    name: 'Classic Burger',
    image: 'burger.jpg',
    price: 120,
    size: 'Regular',
    category: 'breakfast',
    description: 'Juicy beef patty with fresh vegetables and special sauce',
    preparationTime: 5,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Cheese', 'Bun'],
    nutritionInfo: { calories: 450, protein: 25, carbs: 35, fat: 20 }
  },
  {
    name: 'Veggie Sandwich',
    image: 'sandwich.jpg',
    price: 80,
    size: 'Regular',
    category: 'breakfast',
    description: 'Fresh vegetables with hummus on whole wheat bread',
    preparationTime: 4,
    isAvailable: true,
    isPopular: false,
    ingredients: ['Bread', 'Lettuce', 'Tomato', 'Cucumber', 'Hummus'],
    nutritionInfo: { calories: 280, protein: 12, carbs: 40, fat: 8 }
  },
  {
    name: 'Maggie Noodles',
    image: 'maggie.jpg',
    price: 60,
    size: 'Regular',
    category: 'breakfast',
    description: 'Classic instant noodles with vegetables',
    preparationTime: 6,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Noodles', 'Vegetables', 'Spices'],
    nutritionInfo: { calories: 320, protein: 8, carbs: 45, fat: 12 }
  },
  {
    name: 'Masala Tea',
    image: 'tea.jpg',
    price: 20,
    size: 'Regular',
    category: 'beverages',
    description: 'Spiced Indian tea with milk and sugar',
    preparationTime: 2,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Tea Leaves', 'Milk', 'Sugar', 'Spices'],
    nutritionInfo: { calories: 60, protein: 2, carbs: 12, fat: 3 }
  },
  {
    name: 'Coffee',
    image: 'coffee.jpg',
    price: 40,
    size: 'Regular',
    category: 'beverages',
    description: 'Freshly brewed coffee',
    preparationTime: 3,
    isAvailable: true,
    isPopular: false,
    ingredients: ['Coffee Beans', 'Water', 'Milk'],
    nutritionInfo: { calories: 80, protein: 3, carbs: 10, fat: 4 }
  },
  {
    name: 'French Fries',
    image: 'fries.jpg',
    price: 70,
    size: 'Regular',
    category: 'snacks',
    description: 'Crispy golden french fries with seasoning',
    preparationTime: 8,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Potatoes', 'Oil', 'Salt', 'Spices'],
    nutritionInfo: { calories: 350, protein: 4, carbs: 45, fat: 18 }
  },
  {
    name: 'Pizza Slice',
    image: 'pizza.jpg',
    price: 150,
    size: 'Regular',
    category: 'lunch',
    description: 'Classic margherita pizza slice',
    preparationTime: 10,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Dough', 'Tomato Sauce', 'Cheese', 'Basil'],
    nutritionInfo: { calories: 280, protein: 12, carbs: 35, fat: 10 }
  },
  {
    name: 'Pasta',
    image: 'pasta.jpg',
    price: 130,
    size: 'Regular',
    category: 'lunch',
    description: 'Italian pasta with tomato sauce and herbs',
    preparationTime: 12,
    isAvailable: true,
    isPopular: false,
    ingredients: ['Pasta', 'Tomato Sauce', 'Herbs', 'Cheese'],
    nutritionInfo: { calories: 380, protein: 14, carbs: 55, fat: 12 }
  },
  {
    name: 'Spring Roll',
    image: 'springroll.jpg',
    price: 90,
    size: 'Regular',
    category: 'snacks',
    description: 'Crispy vegetable spring rolls with sweet chili sauce',
    preparationTime: 7,
    isAvailable: true,
    isPopular: false,
    ingredients: ['Vegetables', 'Spring Roll Wrapper', 'Sauce'],
    nutritionInfo: { calories: 220, protein: 6, carbs: 30, fat: 8 }
  },
  {
    name: 'Samosa',
    image: 'samosa.jpg',
    price: 25,
    size: 'Regular',
    category: 'snacks',
    description: 'Crispy triangular pastry with spiced potato filling',
    preparationTime: 5,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Potato', 'Peas', 'Spices', 'Flour'],
    nutritionInfo: { calories: 150, protein: 3, carbs: 20, fat: 7 }
  },
  {
    name: 'Ice Cream',
    image: 'icecream.jpg',
    price: 50,
    size: 'Regular',
    category: 'desserts',
    description: 'Vanilla ice cream with chocolate syrup',
    preparationTime: 2,
    isAvailable: true,
    isPopular: false,
    ingredients: ['Milk', 'Cream', 'Sugar', 'Vanilla'],
    nutritionInfo: { calories: 200, protein: 4, carbs: 25, fat: 10 }
  },
  {
    name: 'Brownie',
    image: 'brownie.jpg',
    price: 60,
    size: 'Regular',
    category: 'desserts',
    description: 'Chocolate brownie with nuts',
    preparationTime: 3,
    isAvailable: true,
    isPopular: true,
    ingredients: ['Chocolate', 'Flour', 'Eggs', 'Nuts'],
    nutritionInfo: { calories: 280, protein: 4, carbs: 35, fat: 15 }
  }
];

async function seedMenu() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Clear existing menu items
    await Menu.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert new menu items
    const insertedItems = await Menu.insertMany(menuItems);
    console.log(`Inserted ${insertedItems.length} menu items`);

    // Display inserted items
    insertedItems.forEach(item => {
      console.log(`- ${item.name} (${item.category}) - ${item.preparationTime} min - ₹${item.price}`);
    });

    console.log('Menu seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding menu:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedMenu();
