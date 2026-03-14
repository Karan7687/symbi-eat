const Order = require("../../../models/order");
const Menu = require("../../../models/menu");
const moment = require("moment");

function orderController() {
  return {
    // store: place the order, save total, clear session, render orders page with success overlay
    async store(req, res) {
      try {
        const cart = req.session.cart;

        if (!cart || !cart.items || Object.keys(cart.items).length === 0) {
          req.flash("error", "Your cart is empty!");
          return res.redirect("/cart");
        }

        // compute total (fallback if cart.total or cart.totalPrice is missing)
        let total =
          typeof cart.total === "number"
            ? cart.total
            : typeof cart.totalPrice === "number"
            ? cart.totalPrice
            : 0;

        if (total === 0) {
          for (const id in cart.items) {
            const it = cart.items[id];
            total += (it.item.price || 0) * (it.qty || 0);
          }
        }

        // Calculate total preparation time based on cart items
        let totalPreparationTime = 0;
        
        // Fallback preparation times for items (in minutes) - using names for reliability
        const fallbackPrepTimes = {
          'Spring Roll': 7,
          'Samosa': 5,
          'Ice Cream': 2,
          'Brownie': 3,
          'Veg Pizza': 15,
          'Pasta': 12,
          'Burger': 10,
          'Noodles': 8,
          'Cake Slice': 2,
          'Donut': 3,
          'Cookie': 4,
          'Milkshake': 5
        };
        
        console.log('Cart items for preparation time calculation:', cart.items);
        
        for (const itemId in cart.items) {
          const cartItem = cart.items[itemId];
          const quantity = cartItem.qty || 1;
          console.log('Processing cart item:', itemId, 'Quantity:', quantity);
          
          let itemPrepTime = 15; // Default fallback
          
          // Try to get from database first
          try {
            const menuItem = await Menu.findById(itemId);
            if (menuItem && menuItem.preparationTime) {
              itemPrepTime = menuItem.preparationTime;
              console.log('Found menu item prep time from DB:', menuItem.name, '-', itemPrepTime);
            } else if (menuItem && menuItem.name && fallbackPrepTimes[menuItem.name]) {
              // Use fallback by name if DB has item but no prep time
              itemPrepTime = fallbackPrepTimes[menuItem.name];
              console.log('Using fallback prep time by name:', menuItem.name, '-', itemPrepTime);
            }
          } catch (error) {
            console.log('DB query failed, using default');
          }
          
          console.log('Final item prep time:', itemPrepTime, 'Quantity:', quantity);
          
          // Simple addition: total time = sum of all item times
          const itemTotalTime = itemPrepTime * quantity;
          totalPreparationTime += itemTotalTime;
          console.log('Item total time (prep time x quantity):', itemTotalTime, 'Running total:', totalPreparationTime);
        }

        // No buffer time - show pure preparation time
        totalPreparationTime = Math.ceil(totalPreparationTime);
        
        // Cap at maximum 60 minutes
        totalPreparationTime = Math.min(totalPreparationTime, 60);

        console.log('Final preparation time calculated:', totalPreparationTime, 'minutes');

        // Generate unique order number
        const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
        
        // Calculate estimated delivery time based on actual preparation time
        const estimatedDeliveryTime = new Date(Date.now() + totalPreparationTime * 60 * 1000);

        const order = new Order({
          customerId: req.user._id,
          items: cart.items,
          total: total,
          orderNumber: orderNumber,
          estimatedDeliveryTime: estimatedDeliveryTime,
          preparationTime: totalPreparationTime, // Store calculated preparation time
          phone: req.body.phone || req.user.phone || '0000000000',
          deliveryAddress: req.body.deliveryAddress || 'Campus Delivery',
          specialInstructions: req.body.specialInstructions || '',
          tracking: {
            orderPlaced: new Date()
          }
        });

        const saved = await order.save();

        // Emit real-time notification to admin room
        const io = req.app.get('io');
        if (io) {
          io.to('admin-room').emit('new-order-received', {
            orderId: saved._id,
            orderNumber: saved.orderNumber,
            customerName: req.user.name,
            total: saved.total,
            items: Object.keys(saved.items).length
          });
        }

        // clear cart
        req.session.cart = null;

        // fetch updated orders to show on orders page
        const orders = await Order.find({ customerId: req.user._id }).sort({
          createdAt: -1,
        });

        // render orders page with success overlay payload
        console.log('Passing preparationTime to template:', totalPreparationTime);
        return res.render("customers/orders", {
          orders,
          moment,
          success: true,
          orderId: saved._id,
          orderNumber: saved.orderNumber,
          total: total,
          preparationTime: totalPreparationTime, // Pass calculated preparation time
          user: req.user,
          session: req.session,
        });
      } catch (err) {
        console.error("Order save error:", err);
        req.flash("error", "Something went wrong!");
        return res.redirect("/cart");
      }
    },

    // index: show orders page (regular view)
    async index(req, res) {
      try {
        const orders = await Order.find({ customerId: req.user._id }).sort({
          createdAt: -1,
        });
        res.header(
          "Cache-Control",
          "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
        );
        return res.render("customers/orders", {
          orders,
          moment,
          user: req.user,
          session: req.session,
        });
      } catch (err) {
        console.error("Fetch orders error:", err);
        return res.status(500).send("Internal Server Error");
      }
    },

    // track: show order tracking page
    async track(req, res) {
      try {
        const orders = await Order.find({ 
          customerId: req.user._id,
          status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
        }).sort({
          createdAt: -1,
        });

        return res.render("customers/orderTracking", {
          orders,
          moment,
          user: req.user,
          session: req.session,
        });
      } catch (err) {
        console.error("Fetch tracking orders error:", err);
        return res.status(500).send("Internal Server Error");
      }
    },
  };
}

module.exports = orderController;
