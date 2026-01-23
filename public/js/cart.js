class Cart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.loadFromStorage();
  }

  // Load cart from localStorage
  loadFromStorage() {
    const savedCart = localStorage.getItem('symbieat-cart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      this.items = cartData.items || [];
      this.total = cartData.total || 0;
    }
  }

  // Save cart to localStorage
  saveToStorage() {
    localStorage.setItem('symbieat-cart', JSON.stringify({
      items: this.items,
      total: this.total
    }));
  }

  // Add item to cart
  addItem(foodItem, quantity = 1) {
    const existingItem = this.items.find(item => item._id === foodItem._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...foodItem,
        quantity: quantity
      });
    }
    
    this.calculateTotal();
    this.saveToStorage();
    this.updateUI();
    this.showNotification(`${foodItem.name} added to cart!`);
  }

  // Remove item from cart
  removeItem(itemId) {
    this.items = this.items.filter(item => item._id !== itemId);
    this.calculateTotal();
    this.saveToStorage();
    this.updateUI();
  }

  // Update item quantity
  updateQuantity(itemId, quantity) {
    const item = this.items.find(item => item._id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.calculateTotal();
      this.saveToStorage();
      this.updateUI();
    }
  }

  // Calculate total
  calculateTotal() {
    this.total = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // Get cart count
  getCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  // Clear cart
  clear() {
    this.items = [];
    this.total = 0;
    this.saveToStorage();
    this.updateUI();
  }

  // Update UI elements
  updateUI() {
    // Update cart count in header
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = this.getCount();
      cartCountElement.style.display = this.getCount() > 0 ? 'inline-block' : 'none';
    }

    // Update cart total
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
      cartTotalElement.textContent = `₹${this.total.toFixed(2)}`;
    }

    // Update cart items display
    this.updateCartDisplay();
  }

  // Update cart display in modal/page
  updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (this.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="text-center py-8">
          <div class="text-6xl mb-4">🛒</div>
          <p class="text-gray-500">Your cart is empty</p>
          <button onclick="closeCartModal()" class="mt-4 bg-[#E8C547] text-[#1D3557] px-6 py-2 rounded-lg hover:bg-[#D4B33F] transition">
            Continue Shopping
          </button>
        </div>
      `;
      return;
    }

    const itemsHTML = this.items.map(item => `
      <div class="cart-item flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
        <div class="flex items-center space-x-4">
          <img src="/img/${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
          <div>
            <h4 class="font-semibold text-[#1D3557]">${item.name}</h4>
            <p class="text-sm text-gray-600">₹${item.price} × ${item.quantity}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button onclick="cart.updateQuantity('${item._id}', ${item.quantity - 1})" 
                  class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center">
            <span class="text-sm">−</span>
          </button>
          <span class="w-8 text-center font-semibold">${item.quantity}</span>
          <button onclick="cart.updateQuantity('${item._id}', ${item.quantity + 1})" 
                  class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition flex items-center justify-center">
            <span class="text-sm">+</span>
          </button>
          <button onclick="cart.removeItem('${item._id}')" 
                  class="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition flex items-center justify-center text-red-600">
            <span class="text-sm">×</span>
          </button>
        </div>
      </div>
    `).join('');

    cartItemsContainer.innerHTML = itemsHTML + `
      <div class="p-4 bg-gray-50">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">Total:</span>
          <span class="text-xl font-bold text-[#1D3557]">₹${this.total.toFixed(2)}</span>
        </div>
        <button onclick="proceedToCheckout()" 
                class="w-full bg-[#E8C547] text-[#1D3557] font-bold py-3 rounded-lg hover:bg-[#D4B33F] transition">
          Proceed to Checkout
        </button>
      </div>
    `;
  }

  // Show notification
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-[#1D3557] text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-y-0 transition-all duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateY(100px)';
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Get cart data for checkout
  getCheckoutData() {
    return {
      items: this.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      })),
      total: this.total,
      itemCount: this.getCount()
    };
  }
}

// Initialize cart globally
const cart = new Cart();

// Cart modal functions
function openCartModal() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.style.display = 'flex';
    cart.updateCartDisplay();
  }
}

function closeCartModal() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function proceedToCheckout() {
  if (cart.items.length === 0) {
    cart.showNotification('Your cart is empty!');
    return;
  }
  
  // Redirect to checkout page
  window.location.href = '/checkout';
}

// Add to cart function for menu items
function addToCart(foodItem) {
  cart.addItem(foodItem);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
  cart.updateUI();
  
  // Add click handlers for add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const foodItem = JSON.parse(this.dataset.foodItem);
      addToCart(foodItem);
    });
  });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cart;
}
