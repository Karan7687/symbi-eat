const Order = require("../../../models/order");
const moment = require("moment");

function orderController() {
  return {
    // Admin Dashboard - Main page when admin logs in
    async dashboard(req, res) {
      try {
        console.log("🟢 Controller reached: adminOrderController.dashboard");
        
        // Get all orders for statistics and display
        const allOrders = await Order.find()
          .populate("customerId", "-password")
          .populate("items.foodId")
          .sort({ createdAt: -1 });
        
        console.log("📦 Orders fetched from DB:", allOrders.length);

        // Calculate revenue analytics
        const revenueAnalytics = {
          totalRevenue: allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          todayRevenue: allOrders
            .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          weeklyRevenue: allOrders
            .filter(o => {
              const orderDate = new Date(o.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return orderDate >= weekAgo;
            })
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          monthlyRevenue: allOrders
            .filter(o => {
              const orderDate = new Date(o.createdAt);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return orderDate >= monthAgo;
            })
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
        };

        // Daily revenue for the last 7 days
        const dailyRevenue = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));
          
          const dayRevenue = allOrders
            .filter(o => {
              const orderDate = new Date(o.createdAt);
              return orderDate >= dayStart && orderDate <= dayEnd;
            })
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            
          dailyRevenue.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            revenue: dayRevenue,
            orders: allOrders.filter(o => {
              const orderDate = new Date(o.createdAt);
              return orderDate >= dayStart && orderDate <= dayEnd;
            }).length
          });
        }

        // Calculate statistics
        const stats = {
          totalOrders: allOrders.length,
          pendingOrders: allOrders.filter(o => o.status === 'placed').length,
          confirmedOrders: allOrders.filter(o => o.status === 'confirmed').length,
          preparedOrders: allOrders.filter(o => o.status === 'prepared').length,
          completedOrders: allOrders.filter(o => o.status === 'completed').length,
          avgOrderValue: allOrders.length > 0 
            ? allOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) / allOrders.length 
            : 0,
          ...revenueAnalytics
        };

        if (req.xhr) {
          console.log("📤 Sending JSON response to AJAX request");
          return res.json({ orders: allOrders, stats, dailyRevenue });
        } else {
          console.log("📄 Rendering EJS view: admin/dashboard");
          return res.render("admin/dashboard", { orders: allOrders, stats, dailyRevenue, moment });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).send("Server Error");
      }
    },

    // Orders list page (separate from dashboard)
    async index(req, res) {
      try {
        console.log("🟢 Controller reached: adminOrderController.index");
        const orders = await Order.find(
          { status: { $ne: "completed" } },
          null,
          { sort: { createdAt: -1 } }
        ).populate("customerId", "-password");
        console.log("📦 Orders fetched from DB:", orders.length);

        if (req.xhr) {
          console.log("📤 Sending JSON response to AJAX request");
          return res.json(orders);
        } else {
          console.log("📄 Rendering EJS view: admin/orders");
          return res.render("admin/orders", { orders, moment });
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send("Server Error");
      }
    },

    async updateStatus(req, res) {
      try {
        const { orderId, status } = req.body;
        console.log(`⚙️ Updating order ${orderId} to status: ${status}`);

        // Update order in database
        const order = await Order.findByIdAndUpdate(
          orderId,
          { status: status },
          { new: true }
        ).populate("customerId", "-password");

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        console.log(`✅ Order ${orderId} updated in database to: ${status}`);

        // Get Socket.IO instance from app
        const io = req.app.get('io');
        
        // Emit real-time update to all connected clients
        io.emit('order-status-updated', {
          orderId: order._id,
          status: order.status,
          orderNumber: order._id.slice(-6),
          customerId: order.customerId?._id
        });

        console.log(`📡 Real-time update sent for order ${orderId}`);

        res.json({ 
          success: true, 
          message: "Order status updated successfully",
          order: order
        });

      } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ error: "Failed to update order status" });
      }
    },
  };
}

module.exports = orderController;
