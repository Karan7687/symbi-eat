let addToCart = document.querySelectorAll(".add-to-cart"); //gives array of btns
let cartCounter = document.querySelector(".cartCounter"); //get span wth id cartCounter

function updateCart(foodItem) {
  axios.post("./update-cart", foodItem).then((res) => {
    console.log(res);
    cartCounter.innerText = res.data.totalQty;
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
