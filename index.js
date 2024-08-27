const express = require("express");
const bodyParser = require('body-parser');
require('dotenv').config();

const database = require("./config/database");
database.connect();

const routesApi = require("./routes/client/index.route");

const app = express();
const port = process.env.PORT;

// parse application/json
app.use(bodyParser.json());

routesApi(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});