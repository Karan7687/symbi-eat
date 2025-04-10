const express = require("express");
const app = express();
//returns express obj and stored in app . app contains al the exxpress functinalities
const ejs = require("ejs");
const expressLayout = require("express-ejs-layouts");
const path = require("path");

//set template

app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));

//which template to use
app.set("view engine", "ejs");

//Assets
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.render("home");
});

//cart
app.get("/cart", (req, res) => {
  res.render("customers/cart");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
