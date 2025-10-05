const express = require("express");
const mongoose = require("mongoose");
const db = require("./db.js"); // Connect to MongoDB
require("dotenv").config();

// Initialize Express
const app = express();
app.use(express.json());



// Import user Routes
const userRoutes = require("./routes/userRoutes");
app.use("/user", userRoutes);

// Import candidate Rutes
const candidateRoutes = require("./routes/candidateRoutes");
app.use("/candidate",candidateRoutes);

// Use port from .env, fallback to 3000 if not set
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is listening on port ${PORT}`);
});
