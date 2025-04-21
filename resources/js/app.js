let addToCart = document.querySelectorAll(".add-to-cart"); //gives array of btns

function updateCart(foodItem) {
  axios.post("./update-cart", foodItem).then((res) => {
    console.log(res);
  });
}
addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    //callback function
    let foodItem = JSON.parse(btn.dataset.foodItem);
    updateCart(foodItem);

    // console.log(foodItem);
  });
});
