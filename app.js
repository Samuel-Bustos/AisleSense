const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const itemRoutes = require("./routes/itemRoutes");
require("./models/Item");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

app.use(express.json());

//Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Server Test

app.get("/", (req, res) => {
  res.send("Inventory Management App is running");
});

// Database connection

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// api
app.use("/api", itemRoutes);