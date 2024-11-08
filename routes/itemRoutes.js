const express = require("express");
const Item = require("../models/Item");

const router = express.Router();

// Route to add a new item

router.post("/items", async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    const newItem = new Item({ name, quantity, price, category });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to add item" });
  }
});

module.exports = router;

// Route to get all items

router.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve items" });
  }
});

// Route to get a single item by ID
router.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve item" });
  }
});

// Route to update an item by ID
router.put("/items/:id", async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, quantity, price, category },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Route to delete an item by ID
router.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});
