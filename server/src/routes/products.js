const express = require("express");
const router = express.Router();
const db = require("../config/db");
// GET: Load all products
router.get("/", async (req, res) => {
 try {
 const [products] = await db.query(
 "SELECT * FROM products ORDER BY id DESC"
 );
 res.json(products);
 } catch (error) {
 console.error("Error loading products:", error);
 res.status(500).json({
 message: "Failed to load products"
 });
 }
});

// POST: Save a new product
router.post("/", async (req, res) => {
 try {
 const { name, description, price, stock } = req.body;
 if (
 typeof name !== "string" ||
 !name.trim() ||
 !Number.isFinite(Number(price)) ||
 Number(price) < 0 ||
 !Number.isInteger(Number(stock)) ||
 Number(stock) < 0
 ) {
 return res.status(400).json({
 message: "Please enter valid product details."
 });
 }
 const [result] = await db.query(
 `INSERT INTO products (name, description, price, stock)
 VALUES (?, ?, ?, ?)`,
 [
 name.trim(),
 description || "",
 Number(price),
 Number(stock)
 ]
 );
 res.status(201).json({
 message: "Product saved successfully",
 id: result.insertId
 });
 } catch (error) {
 console.error("Error saving product:", error);
 res.status(500).json({
 message: "Failed to save product"
 });
 }
});

// PUT: Update an existing product
router.put("/:id", async (req, res) => {
 try {
 const { id } = req.params;
 const { name, description, price, stock } = req.body;
 if (
 !Number.isInteger(Number(id)) ||
 Number(id) < 1 ||
 typeof name !== "string" ||
 !name.trim() ||
 !Number.isFinite(Number(price)) ||
 Number(price) < 0 ||
 !Number.isInteger(Number(stock)) ||
 Number(stock) < 0
 ) {
 return res.status(400).json({
 message: "Please enter valid product details."
 });
 }
 const [result] = await db.query(
 `UPDATE products
 SET name = ?, description = ?, price = ?, stock = ?
 WHERE id = ?`,
 [
 name.trim(),
 description || "",
 Number(price),
 Number(stock),
 Number(id)
 ]
 );
 if (result.affectedRows === 0) {
 return res.status(404).json({
 message: "Product not found."
 });
 }
 res.json({
 message: "Product updated successfully"
 });
 } catch (error) {
 console.error("Error updating product:", error);
 res.status(500).json({
 message: "Failed to update product"
 });
 }
});

// DELETE: Remove a product
router.delete("/:id", async (req, res) => {
 try {
 const { id } = req.params;
 if (!Number.isInteger(Number(id)) || Number(id) < 1) {
 return res.status(400).json({
 message: "Invalid product ID."
 });
 }
 const [result] = await db.query(
 "DELETE FROM products WHERE id = ?",
 [Number(id)]
 );
 if (result.affectedRows === 0) {
 return res.status(404).json({
 message: "Product not found."
 });
 }
 res.json({
 message: "Product deleted successfully"
 });
 } catch (error) {
 console.error("Error deleting product:", error);
 res.status(500).json({
 message: "Failed to delete product"
 });
 }
});
module.exports = router;
