const Order = require("../../../models/order");
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

        // Generate unique order number
        const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
        
        // Calculate estimated delivery time (30 minutes from now)
        const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

        const order = new Order({
          customerId: req.user._id,
          items: cart.items,
          total: total,
          orderNumber: orderNumber,
          estimatedDeliveryTime: estimatedDeliveryTime,
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
        return res.render("customers/orders", {
          orders,
          moment,
          success: true,
          orderId: saved._id,
          orderNumber: saved.orderNumber,
          total: total,
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
