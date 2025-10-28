import axios from "axios";
import moment from "moment";

export default function initAdmin() {
  console.log("⚙️ Admin panel initialized...");

  const orderTableBody = document.querySelector("#orderTableBody");

  if (!orderTableBody) {
    console.error("❌ orderTableBody element not found in DOM!");
    return;
  }

  async function fetchOrders() {
    console.log("📡 Fetching orders from /admin/orders ...");
    try {
      const response = await axios.get("/admin/orders", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      const orders = response.data;
      console.log(`✅ Orders fetched successfully: ${orders.length}`);

      orderTableBody.innerHTML = "";

      if (!orders.length) {
        orderTableBody.innerHTML = `<tr><td colspan="4">No pending orders</td></tr>`;
        return;
      }

      orders.forEach((order) => {
        const row = `
          <tr>
            <td>${order._id}</td>
            <td>${order.customerId?.name || "Unknown"}</td>
            <td>${order.status}</td>
            <td>${moment(order.createdAt).format("hh:mm A")}</td>
          </tr>`;
        orderTableBody.insertAdjacentHTML("beforeend", row);
      });
    } catch (err) {
      console.error("🚨 Error fetching orders:", err);
      orderTableBody.innerHTML =
        "<tr><td colspan='4' style='color:red;'>Failed to load orders</td></tr>";
    }
  }

  // Initial fetch
  fetchOrders();

  // Optional: refresh every 30 seconds
  setInterval(fetchOrders, 30000);
}
