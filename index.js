const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

connectToMongo();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(process.env.PORT || 5000, () => {
  console.log("server running");
});
