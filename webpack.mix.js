const mix = require("laravel-mix");
const tailwindcss = require("tailwindcss");

mix.sass("resources/scss/app.scss", "public/css").options({
  postCss: [tailwindcss("./tailwind.config.js")],
  processCssUrls: false,
});

// (which file to execute , where to show it)

// resources/js/app.js  ---> public/js/app.js
// resources/scss/app.css  ---> public/css/app.css
