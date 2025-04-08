const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
   .sass('resources/scss/app.scss', 'public/css'); // Use `.sass()` instead of `.postCss()`


// (which file to execute , where to show it)

// resources/js/app.js  ---> public/js/app.js
// resources/scss/app.css  ---> public/css/app.css
