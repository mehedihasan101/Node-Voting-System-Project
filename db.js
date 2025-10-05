const mongoose = require("mongoose");
require('dotenv').config(); 

// Define Local MongoDB server connection URL
//const mongoURL = "mongodb://localhost:27017/Voting"; // Create a Database That name : Voting

//mongoDb atlas server connection
//const mongoURL = "mongodb+srv://mehedi:mehedi67667@cluster0.0dhfpwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB local server connection from env file
const mongoURL = process.env.MONGODB_URL_LOCAL;



// Setup MongoDB connection
mongoose.connect(mongoURL);

// Get the default connection
const db = mongoose.connection;

// Event listener: successful connection
db.on("open", () => {
  console.log("✅ Connected to MongoDB server...");
});

// Event listener: connection error
db.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Event listener: disconnected
db.on("disconnected", () => {
  console.log("⚠️ MongoDB database disconnected");
});

module.exports = db;
