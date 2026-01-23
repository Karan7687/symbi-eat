class OrderTracker {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.currentOrder = null;
    this.init();
  }

  init() {
    // Initialize Socket.IO connection
    this.socket = io();
    
    // Get current user info from page
    this.currentUser = this.getCurrentUser();
    
    if (this.currentUser) {
      // Join appropriate room
      this.socket.emit('join-room', {
        userId: this.currentUser.id,
        role: this.currentUser.role
      });
      
      // Set up event listeners
      this.setupEventListeners();
    }
  }

  getCurrentUser() {
    // Try to get user info from window or meta tags
    const userElement = document.getElementById('current-user');
    if (userElement) {
      return JSON.parse(userElement.textContent);
    }
    
    // Fallback for logged-in users
    if (typeof window !== 'undefined' && window.user) {
      return window.user;
    }
    
    return null;
  }

  setupEventListeners() {
    // Listen for order status updates
    this.socket.on('order-status-updated', (data) => {
      this.handleOrderStatusUpdate(data);
    });
    
    // Listen for new orders (admin only)
    this.socket.on('new-order-received', (data) => {
      this.handleNewOrder(data);
    });
    
    // Connection status
    this.socket.on('connect', () => {
      console.log('🔌 Connected to real-time server');
      this.showNotification('Connected to real-time updates', 'success');
    });
    
    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from real-time server');
      this.showNotification('Connection lost', 'warning');
    });
  }

  handleOrderStatusUpdate(data) {
    const { orderId, status, orderNumber } = data;
    
    // Update order status in UI
    this.updateOrderStatusUI(orderId, status);
    
    // Show notification
    const statusMessages = {
      'pending': 'Order placed - Waiting for confirmation',
      'confirmed': 'Order confirmed - Starting preparation',
      'preparing': 'Order is being prepared',
      'ready': 'Order is ready for pickup/delivery',
      'completed': 'Order completed successfully',
      'cancelled': 'Order has been cancelled'
    };
    
    const message = statusMessages[status] || `Order status updated to: ${status}`;
    this.showNotification(`Order #${orderNumber}: ${message}`, 'info');
    
    // Update tracking timeline
    this.updateTrackingTimeline(orderId, status);
  }

  handleNewOrder(data) {
    // For admin users - show new order notification
    this.showNotification(`New order received: #${data.orderNumber}`, 'success');
    
    // Play sound notification (optional)
    this.playNotificationSound();
    
    // Refresh admin dashboard if on admin page
    if (window.location.pathname.includes('/admin')) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  updateOrderStatusUI(orderId, status) {
    // Update status badge
    const statusBadge = document.querySelector(`[data-order-id="${orderId}"] .order-status`);
    if (statusBadge) {
      statusBadge.textContent = this.formatStatus(status);
      statusBadge.className = `order-status ${this.getStatusClass(status)}`;
    }
    
    // Update progress bar
    this.updateProgressBar(orderId, status);
  }

  updateTrackingTimeline(orderId, status) {
    const timeline = document.querySelector(`[data-order-id="${orderId}"] .tracking-timeline`);
    if (!timeline) return;
    
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const currentStepIndex = steps.indexOf(status);
    
    steps.forEach((step, index) => {
      const stepElement = timeline.querySelector(`[data-step="${step}"]`);
      if (stepElement) {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        
        stepElement.classList.toggle('completed', isCompleted);
        stepElement.classList.toggle('current', isCurrent);
        
        // Update timestamp
        if (isCurrent || isCompleted) {
          const timestamp = stepElement.querySelector('.step-time');
          if (timestamp) {
            timestamp.textContent = new Date().toLocaleTimeString();
          }
        }
      }
    });
  }

  updateProgressBar(orderId, status) {
    const progressBar = document.querySelector(`[data-order-id="${orderId}"] .progress-bar`);
    if (!progressBar) return;
    
    const progressMap = {
      'pending': 20,
      'confirmed': 40,
      'preparing': 60,
      'ready': 80,
      'completed': 100,
      'cancelled': 0
    };
    
    const progress = progressMap[status] || 0;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
  }

  formatStatus(status) {
    const statusMap = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || status;
  }

  getStatusClass(status) {
    const classMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    const typeClasses = {
      'success': 'bg-green-500',
      'error': 'bg-red-500',
      'warning': 'bg-yellow-500',
      'info': 'bg-blue-500'
    };
    
    notification.className = `fixed top-4 right-4 ${typeClasses[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 max-w-sm`;
    notification.innerHTML = `
      <div class="flex items-center">
        <div class="flex-1">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.parentElement.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  // Method to manually update order status (for admin)
  updateOrderStatus(orderId, status) {
    this.socket.emit('update-order-status', { orderId, status });
  }
}

// Initialize order tracker
const orderTracker = new OrderTracker();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrderTracker;
}
