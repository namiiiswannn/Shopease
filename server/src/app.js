require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({
 origin: "http://localhost:5173"
}));
app.use(express.json());
const productRoutes = require("./routes/products");
app.get("/api/health", (req, res) => {
 res.json({ message: "API is running" });
});
app.use("/api/products", productRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});
