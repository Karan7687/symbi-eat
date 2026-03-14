const mongoose = require('mongoose');
const Order = require('../app/models/Order');
const Menu = require('../app/models/Menu');
const queueEstimationService = require('../app/services/queueEstimationService');
require('dotenv').config();

async function testQueueSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Get menu items
    const menuItems = await Menu.find();
    if (menuItems.length === 0) {
      console.log('No menu items found. Please run seedMenuWithPrepTimes.js first.');
      return;
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('Cleared existing orders');

    // Create test orders
    const testOrders = [
      {
        customerId: new mongoose.Types.ObjectId(), // Mock user ID
        items: [
          { menuId: menuItems[0]._id, name: menuItems[0].name, price: menuItems[0].price, quantity: 1, preparationTime: menuItems[0].preparationTime },
          { menuId: menuItems[3]._id, name: menuItems[3].name, price: menuItems[3].price, quantity: 2, preparationTime: menuItems[3].preparationTime }
        ],
        total: 160,
        orderNumber: 'ORD001',
        phone: '9876543210',
        deliveryAddress: 'Hostel A',
        specialInstructions: 'Extra spicy',
        status: 'pending'
      },
      {
        customerId: new mongoose.Types.ObjectId(),
        items: [
          { menuId: menuItems[1]._id, name: menuItems[1].name, price: menuItems[1].price, quantity: 2, preparationTime: menuItems[1].preparationTime }
        ],
        total: 160,
        orderNumber: 'ORD002',
        phone: '9876543211',
        deliveryAddress: 'Hostel B',
        status: 'preparing'
      },
      {
        customerId: new mongoose.Types.ObjectId(),
        items: [
          { menuId: menuItems[2]._id, name: menuItems[2].name, price: menuItems[2].price, quantity: 1, preparationTime: menuItems[2].preparationTime },
          { menuId: menuItems[4]._id, name: menuItems[4].name, price: menuItems[4].price, quantity: 1, preparationTime: menuItems[4].preparationTime }
        ],
        total: 100,
        orderNumber: 'ORD003',
        phone: '9876543212',
        deliveryAddress: 'Library',
        status: 'pending'
      }
    ];

    // Insert test orders
    const insertedOrders = await Order.insertMany(testOrders);
    console.log(`Created ${insertedOrders.length} test orders`);

    // Test queue estimation
    console.log('\n=== Testing Queue Estimation ===');
    
    for (const order of insertedOrders) {
      // Calculate preparation time
      const prepTime = await queueEstimationService.calculateOrderPrepTime(order.items);
      console.log(`Order ${order.orderNumber}: ${prepTime} minutes prep time`);
      
      // Update order with prep time
      order.totalPrepTime = prepTime;
      await order.save();
    }

    // Update queue positions
    await queueEstimationService.updateQueuePositions();
    console.log('Updated queue positions for all orders');

    // Test queue status
    const queueStatus = await queueEstimationService.getQueueStatus();
    console.log('\n=== Queue Status ===');
    console.log(`Total orders in queue: ${queueStatus.totalOrdersInQueue}`);
    console.log(`Pending orders: ${queueStatus.pendingOrders}`);
    console.log(`Preparing orders: ${queueStatus.preparingOrders}`);
    console.log(`Average wait time: ${queueStatus.averageWaitTime} minutes`);
    console.log(`Kitchen capacity: ${queueStatus.kitchenCapacity}`);

    // Display orders with queue info
    console.log('\n=== Orders with Queue Information ===');
    const ordersInQueue = await queueEstimationService.getOrdersInQueue();
    
    for (const order of ordersInQueue) {
      console.log(`\nOrder #${order.orderNumber}:`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Queue Position: ${order.queuePosition}`);
      console.log(`  Total Prep Time: ${order.totalPrepTime} minutes`);
      console.log(`  Estimated Wait Time: ${order.estimatedWaitTime} minutes`);
      console.log(`  Remaining Time: ${order.remainingTime} minutes`);
      console.log(`  Items: ${order.items.map(item => `${item.name}(${item.quantity})`).join(', ')}`);
      
      if (order.estimatedFinishTime) {
        const finishTime = new Date(order.estimatedFinishTime);
        console.log(`  Estimated Finish: ${finishTime.toLocaleTimeString()}`);
      }
    }

    // Test kitchen capacity allocation
    console.log('\n=== Kitchen Station Allocation ===');
    const stations = queueEstimationService.allocateOrdersToStations(ordersInQueue);
    
    stations.forEach((station, index) => {
      console.log(`\nStation ${index + 1}:`);
      station.forEach(order => {
        console.log(`  - Order #${order.orderNumber} (${order.totalPrepTime} min)`);
      });
      const stationTotal = station.reduce((sum, order) => sum + (order.totalPrepTime || 0), 0);
      console.log(`  Total: ${stationTotal} minutes`);
    });

    console.log('\n=== Queue System Test Completed ===');
    console.log('You can now test the system by:');
    console.log('1. Starting the server: npm run dev');
    console.log('2. Visiting admin dashboard: http://localhost:3101/admin/dashboard');
    console.log('3. Creating new orders via API');
    console.log('4. Checking real-time updates');

  } catch (error) {
    console.error('Error testing queue system:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testQueueSystem();
