const Order = require('../models/Order');
const Menu = require('../models/Menu');

class QueueEstimationService {
  constructor() {
    // Kitchen capacity - number of parallel cooking stations
    this.kitchenCapacity = 3;
  }

  /**
   * Calculate total preparation time for order items
   * @param {Array} items - Order items with menuId and quantity
   * @returns {Promise<number>} Total preparation time in minutes
   */
  async calculateOrderPrepTime(items) {
    let totalTime = 0;
    
    for (const item of items) {
      try {
        const menuItem = await Menu.findById(item.menuId);
        if (menuItem && menuItem.isAvailable) {
          // Each item takes its prep time, multiplied by quantity
          totalTime += menuItem.preparationTime * item.quantity;
        }
      } catch (error) {
        console.error('Error calculating prep time for item:', error);
      }
    }
    
    return totalTime;
  }

  /**
   * Get all orders that affect queue (pending + preparing)
   * @returns {Promise<Array>} Orders in queue
   */
  async getOrdersInQueue() {
    return await Order.find({
      status: { $in: ['pending', 'preparing'] }
    }).sort({ createdAt: 1 });
  }

  /**
   * Calculate estimated wait time for a new order
   * @param {number} newOrderPrepTime - Preparation time for new order
   * @returns {Promise<Object>} Queue estimation details
   */
  async calculateQueueEstimation(newOrderPrepTime) {
    const ordersInQueue = await this.getOrdersInQueue();
    const queuePosition = ordersInQueue.length + 1;
    
    // Calculate wait time considering parallel kitchen capacity
    let estimatedWaitTime = 0;
    
    if (ordersInQueue.length > 0) {
      // Group orders by kitchen stations (parallel processing)
      const kitchenStations = this.allocateOrdersToStations(ordersInQueue);
      
      // Find the station with minimum total time for new order
      let minStationTime = Infinity;
      for (const station of kitchenStations) {
        const stationTime = station.reduce((sum, order) => sum + order.totalPrepTime, 0);
        minStationTime = Math.min(minStationTime, stationTime);
      }
      
      estimatedWaitTime = minStationTime;
    }
    
    // Add current order prep time
    const totalTime = estimatedWaitTime + newOrderPrepTime;
    
    // Calculate time estimates
    const now = new Date();
    const estimatedStartTime = new Date(now.getTime() + estimatedWaitTime * 60000);
    const estimatedFinishTime = new Date(now.getTime() + totalTime * 60000);
    
    return {
      queuePosition,
      estimatedWaitTime,
      totalPrepTime: newOrderPrepTime,
      estimatedStartTime,
      estimatedFinishTime,
      ordersAhead: ordersInQueue.length
    };
  }

  /**
   * Allocate orders to kitchen stations for parallel processing
   * @param {Array} orders - Orders to allocate
   * @returns {Array<Array>} Orders grouped by stations
   */
  allocateOrdersToStations(orders) {
    const stations = Array.from({ length: this.kitchenCapacity }, () => []);
    const stationTimes = new Array(this.kitchenCapacity).fill(0);
    
    for (const order of orders) {
      // Find station with minimum current load
      const minStationIndex = stationTimes.indexOf(Math.min(...stationTimes));
      
      stations[minStationIndex].push(order);
      stationTimes[minStationIndex] += order.totalPrepTime || 5; // default 5 min if not set
    }
    
    return stations;
  }

  /**
   * Update queue positions for all orders
   * @returns {Promise<void>}
   */
  async updateQueuePositions() {
    const ordersInQueue = await this.getOrdersInQueue();
    
    for (let i = 0; i < ordersInQueue.length; i++) {
      const order = ordersInQueue[i];
      order.queuePosition = i + 1;
      
      // Recalculate estimated times
      const ordersAhead = ordersInQueue.slice(0, i);
      const waitTime = await this.calculateWaitTimeForOrder(order, ordersAhead);
      
      order.estimatedWaitTime = waitTime;
      order.remainingTime = Math.max(0, waitTime + (order.totalPrepTime || 0));
      
      const now = new Date();
      order.estimatedStartTime = new Date(now.getTime() + waitTime * 60000);
      order.estimatedFinishTime = new Date(now.getTime() + (waitTime + (order.totalPrepTime || 0)) * 60000);
      
      await order.save();
    }
  }

  /**
   * Calculate wait time for specific order considering orders ahead
   * @param {Object} order - Current order
   * @param {Array} ordersAhead - Orders ahead in queue
   * @returns {Promise<number>} Wait time in minutes
   */
  async calculateWaitTimeForOrder(order, ordersAhead) {
    if (ordersAhead.length === 0) return 0;
    
    // Allocate orders ahead to stations
    const stations = this.allocateOrdersToStations(ordersAhead);
    
    // Find station where current order would be placed
    const stationTimes = stations.map(station => 
      station.reduce((sum, aheadOrder) => sum + (aheadOrder.totalPrepTime || 5), 0)
    );
    
    return Math.min(...stationTimes);
  }

  /**
   * Update remaining time for an order based on current status
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Updated order data
   */
  async updateOrderRemainingTime(orderId) {
    const order = await Order.findById(orderId);
    if (!order) return null;
    
    const now = new Date();
    
    if (order.status === 'completed' || order.status === 'ready') {
      order.remainingTime = 0;
    } else if (order.estimatedFinishTime) {
      const timeDiff = (order.estimatedFinishTime - now) / 60000; // Convert to minutes
      order.remainingTime = Math.max(0, Math.round(timeDiff));
    }
    
    await order.save();
    return order;
  }

  /**
   * Get real-time queue status
   * @returns {Promise<Object>} Queue statistics
   */
  async getQueueStatus() {
    const ordersInQueue = await this.getOrdersInQueue();
    const pendingOrders = ordersInQueue.filter(order => order.status === 'pending');
    const preparingOrders = ordersInQueue.filter(order => order.status === 'preparing');
    
    // Calculate average wait time
    const avgWaitTime = ordersInQueue.length > 0 
      ? ordersInQueue.reduce((sum, order) => sum + (order.estimatedWaitTime || 0), 0) / ordersInQueue.length 
      : 0;
    
    return {
      totalOrdersInQueue: ordersInQueue.length,
      pendingOrders: pendingOrders.length,
      preparingOrders: preparingOrders.length,
      averageWaitTime: Math.round(avgWaitTime),
      kitchenCapacity: this.kitchenCapacity,
      nextAvailableTime: await this.calculateNextAvailableTime()
    };
  }

  /**
   * Calculate when next kitchen station will be available
   * @returns {Promise<Date>} Next available time
   */
  async calculateNextAvailableTime() {
    const ordersInQueue = await this.getOrdersInQueue();
    
    if (ordersInQueue.length === 0) {
      return new Date();
    }
    
    const stations = this.allocateOrdersToStations(ordersInQueue);
    const stationTimes = stations.map(station => 
      station.reduce((sum, order) => sum + (order.totalPrepTime || 5), 0)
    );
    
    const minTime = Math.min(...stationTimes);
    return new Date(Date.now() + minTime * 60000);
  }

  /**
   * Update kitchen capacity
   * @param {number} newCapacity - New kitchen capacity
   */
  updateKitchenCapacity(newCapacity) {
    this.kitchenCapacity = Math.max(1, newCapacity);
    console.log(`Kitchen capacity updated to: ${this.kitchenCapacity} stations`);
  }
}

module.exports = new QueueEstimationService();
