const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const mongoURI = process.env.mongoURI;

const connectToMongo = async () => {
  mongoose.connect(mongoURI, () => {
    console.log("coonected to mongo successfully");
  });
};

module.exports = connectToMongo;
