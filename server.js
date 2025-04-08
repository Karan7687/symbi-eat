const express = require("express");
const app = express();
//returns express obj and stored in app . app contains al the exxpress functinalities

const PORT=process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
