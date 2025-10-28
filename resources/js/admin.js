import axios from "axios";
import moment from "moment";

export default function initAdmin() {
  const orderTableBody = document.querySelector("#orderTableBody");

  async function fetchOrders() {
    console.log("📡 Fetching orders from /admin/orders ...");
    try {
      const response = await axios.get("/admin/orders", {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      const orders = response.data;
      orderTableBody.innerHTML = "";

      orders.forEach((order) => {
        const row = `
          <tr>
            <td>${order._id}</td>
            <td>${order.customerId?.name || "Unknown"}</td>
            <td>
              <select class="status-dropdown" data-id="${order._id}">
                <option value="placed" ${
                  order.status === "placed" ? "selected" : ""
                }>🟡 Placed</option>
                <option value="confirmed" ${
                  order.status === "confirmed" ? "selected" : ""
                }>🟠 Confirmed</option>
                <option value="prepared" ${
                  order.status === "prepared" ? "selected" : ""
                }>🔵 Prepared</option>
                <option value="completed" ${
                  order.status === "completed" ? "selected" : ""
                }>🟢 Completed</option>
              </select>
            </td>
            <td>${moment(order.createdAt).format("hh:mm A")}</td>
          </tr>`;
        orderTableBody.insertAdjacentHTML("beforeend", row);
      });

      attachDropdownListeners();
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }

  // 🔽 Handle dropdown changes
  function attachDropdownListeners() {
    document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
      dropdown.addEventListener("change", async (e) => {
        const orderId = e.target.dataset.id;
        const newStatus = e.target.value;
        console.log(`⚙️ Updating order ${orderId} to ${newStatus}...`);

        try {
          await axios.post("/admin/order/status", {
            orderId,
            status: newStatus,
          });
          console.log("✅ Status updated successfully!");
        } catch (err) {
          console.error("❌ Failed to update status:", err);
        }
      });
    });
  }

  console.log("⚙️ Initializing admin panel...");
  fetchOrders();
}
