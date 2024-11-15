const express = require("express");
const Item = require("../models/Item");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create Item

// POST /api/items - Add a new item
router.post("/", authMiddleware, async (req, res) => {
  const { name, quantity, price, category, description } = req.body;

  if (!name || !quantity || !price || !category) {
    return res
      .status(400)
      .json({ message: "Name, quantity, price and category are required." });
  }

  try {
    const newItem = new Item({
      name,
      quantity,
      price,
      category,
      description,
      userId: req.user.id,
    });

    await newItem.save();
    res
      .status(201)
      .json({ message: "Item created successfully", item: newItem });
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get All Items (with pagination, search, and filtering)

// Fetch user-specific items
router.get("/", authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;

  // Build query to fetch only items for the logged-in user
  const query = { userId: req.user.id };

  // Additional filters
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }
  if (category) {
    query.category = category;
  }

  try {
    const items = await Item.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalItems = await Item.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

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
  const { name, quantity, price, category, description } = req.body;

  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    item.name = name || item.name;
    item.quantity = quantity || item.quantity;
    item.price = price || item.price;
    item.category = category || item.category;
    item.description = description || item.description;

    // Log update action
    item.addHistory(
      "updated",
      `Item ${item.name} updated to ${name || item.name}`
    );

    await item.save();
    res.status(200).json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Item
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ensure the authenticated user is the owner of the item
    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Log delete action (assuming `addHistory` is a method you’ve set up in your Item model)
    await item.addHistory("deleted", `Item ${item.name} deleted`);

    // Delete the item using `findByIdAndDelete`
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
