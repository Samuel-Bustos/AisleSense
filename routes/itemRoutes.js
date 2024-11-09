const express = require("express");
const Item = require("../models/Item");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create Item

router.post("/", authMiddleware, async (req, res) => {
  const { name, quantity, price, category } = req.body;

  const newItem = new Item({
    name,
    quantity,
    price,
    category,
    createdBy: req.user._id,
  });

  // Log creation action
  newItem.addHistory(
    "created",
    `Item ${name} created with quantity ${quantity}`
  );

  await newItem.save();
  res.status(201).json(newItem);
});

// Get All Items (with pagination, search, and filtering)

router.get("/", async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    minQuantity,
    maxQuantity,
  } = req.query;

  const query = {};

  if (search) {
    // Search filter for name or category
    query.$or = [
      { name: { $regex: search, $options: `i` } },
      { category: { $regex: search, $options: `i` } },
    ];
  }

  if (category) {
    // Filter by category
    query.category = category;
  }

  if (minQuantity) {
    // Filter by minimum quantity
    query.quantity = { $gte: parseInt(minQuantity) };
  }

  if (maxQuantity) {
    // Filter by maximum quantity
    query.quantity = { ...query.quantity, $lte: parseInt(maxQuantity) };
  }

  try {
    const items = await Item.find(query)
      .skip((page - 1) * limit) // Pagination: skip items based on page number
      .limit(limit); // Limit the number of items per page

    const totalItems = await Item.countDocuments(query); // Get the total count of items for pagination
    const totalPages = Math.ceil(totalItems / limit); // Calculate total pages

    res.status(200).json({
      items,
      totalItems,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get Item by ID

router.get("/:id", async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.status(200).json(item);
});

// Update Item
router.put("/:id", authMiddleware, async (req, res) => {
  const { name, quantity, price, category } = req.body;

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (item.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  item.name = name || item.name;
  item.quantity = quantity || item.quantity;
  item.price = price || item.price;
  item.category = category || item.category;

  // Log update action
  updatedItem.addHistory(
    "updated",
    `Item ${item.name} updated to ${name || item.name}`
  );

  await item.save();
  res.status(200).json(item);
});

// Delete Item
router.delete("/:id", authMiddleware, async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (item.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Log delete action
  item.addHistory("deleted", `Item ${item.name} deleted`);

  await item.remove();
  res.status(200).json({ message: "Item deleted" });
});

module.exports = router;
