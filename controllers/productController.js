import Product from "../models/Product.js";

// =================== CREATE PRODUCT ===================
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Handle uploaded images
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const product = await Product.create({
      title,
      description,
      price,
      category,
      images,
      seller: req.userId,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== GET ALL PRODUCTS ===================
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "username email")
      .sort({ createdAt: -1 }); // newest first
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== GET SINGLE PRODUCT ===================
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "username email"
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== UPDATE PRODUCT ===================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { title, description, price, category } = req.body;

    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;

    // If new images uploaded, replace old ones
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    await product.save();

    res.json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== DELETE PRODUCT ===================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.seller.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await product.remove();

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};