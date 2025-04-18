//add EventListeners on all buttons

let addToCart = document.querySelectorAll(".add-to-cart"); //gives array of btns

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    //callback function
    let foodItem = JSON.parse(btn.dataset.foodItem);

    console.log(foodItem);
  });
});
