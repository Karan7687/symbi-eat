// Create a notification system for cart additions
document.addEventListener("DOMContentLoaded", () => {
  // Create notification container if it doesn't exist
  if (!document.getElementById("notification-container")) {
    const notificationContainer = document.createElement("div");
    notificationContainer.id = "notification-container";
    document.body.appendChild(notificationContainer);
  }

  // Get all add to cart buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  const cartCounter = document.querySelector(".cartCounter");

  // Function to show notification
  function showNotification(item, isError = false) {
    const container = document.getElementById("notification-container");

    // Create notification element
    const notification = document.createElement("div");
    notification.className = isError
      ? "cart-notification error"
      : "cart-notification";

    // Create emoji based on status
    const emoji = isError ? "❌" : getRandomFoodEmoji();

    // Create notification content
    notification.innerHTML = `
        <div class="notification-icon ${isError ? "error" : ""}">
          <span class="notification-emoji">${emoji}</span>
        </div>
        <div class="notification-content">
          <h4>${isError ? "Error" : item.name}</h4>
          <p>${
            isError
              ? "Something went wrong. Please try again."
              : "Added to your cart!"
          }</p>
        </div>
        <div class="notification-progress"></div>
      `;

    // Add to container
    container.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Remove after animation completes
    setTimeout(() => {
      notification.classList.add("hide");
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);

    // Only add floating emoji for success
    if (!isError) {
      addFloatingEmoji(item.name);
    }
  }

  // Function to show error notification
  function showErrorNotification() {
    showNotification(null, true);
  }

  // Function to get random food emoji
  function getRandomFoodEmoji() {
    const foodEmojis = [
      "😀",
      "😃",
      "😄",
      "😁",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "☺️",
      "😚",
      "😙",
      "😋",
      "🤪",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "😶",
      "😒",
      "🙄",
      "😬",
      "😮‍💨",
      "🤥",
      "😌",
      "🤤",
      "🤧",
      "🥵",
      "🤯",
      "🤠",
      "🥳",
      "😎",
      "🤓",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😤",
      "💀",
      "☠️",
      "👹",
      "👺",
      "👻",
      "😻",
      "😼",
      "😽",
      "🙀",
      "🙈",
      "🙉",
      "🙊",
      "🐣",
      "🐥",
      "💐",
      "🌷",
      "🌹",
      "🥀",
      "🌺",
      "🌸",
      "🌼",
      "🌻",
      "🌞",
      "🌝",
      "🌚",
      "✨",
      "⚡",
      "☄️",
      "💥",
      "🔥",
      "🌪️",
      "🍺",
      "🍻",
      "🥂",
      "🍾",
      "🚀",
      "💸",
    ];
    return foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
  }

  // Function to add floating food emoji animation
  function addFloatingEmoji(itemName) {
    const emoji = document.createElement("div");
    emoji.className = "floating-emoji";
    emoji.textContent = getRandomFoodEmoji();

    // Random position on screen
    const xPos = Math.random() * window.innerWidth;
    emoji.style.left = `${xPos}px`;

    // Apply random animation
    const animations = ["float-up", "float-up-left", "float-up-right"];
    const randomAnimation =
      animations[Math.floor(Math.random() * animations.length)];
    emoji.style.animationName = randomAnimation;

    document.body.appendChild(emoji);

    // Remove after animation completes
    setTimeout(() => {
      emoji.remove();
    }, 3000);
  }

  // Function to update cart with animation
  function updateCartWithAnimation(foodItem) {
    // First show the notification
    try {
      // Then update the cart count with the original axios call
      axios
        .post("./update-cart", foodItem)
        .then((res) => {
          console.log(res);

          // Show success notification
          showNotification(foodItem);

          // Animate the counter
          cartCounter.classList.add("cart-counter-bump");
          setTimeout(() => {
            cartCounter.classList.remove("cart-counter-bump");
          }, 300);

          // Update the counter value
          cartCounter.innerText = res.data.totalQty;
        })
        .catch((error) => {
          console.error("Error adding item to cart:", error);
          showErrorNotification();
        });
    } catch (error) {
      console.error("Exception occurred:", error);
      showErrorNotification();
    }
  }

  // Add click event to all add to cart buttons
  addToCartButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      try {
        // Get food item data
        const foodItem = JSON.parse(btn.dataset.foodItem);

        // Add button click animation
        btn.classList.add("btn-clicked");
        setTimeout(() => {
          btn.classList.remove("btn-clicked");
        }, 300);

        // Update cart with animation
        updateCartWithAnimation(foodItem);
      } catch (error) {
        console.error("Error processing click:", error);
        showErrorNotification();
      }
    });
  });
});
