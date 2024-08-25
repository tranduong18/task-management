const express = require("express");
require('dotenv').config();

const database = require("./config/database");
database.connect();

const routesApi = require("./routes/client/index.route");

const app = express();
const port = process.env.PORT;

routesApi(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});