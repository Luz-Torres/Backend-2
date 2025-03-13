import express from "express";
import { getAllProducts, createProduct, updateProduct, deleteProduct, getProductForEdit } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/api/products", getAllProducts);

router.post("/api/sessions/realtimeproducts", createProduct);

router.put("/api/products/:pid", updateProduct);

router.delete("/api/sessions/realtimeproducts", deleteProduct);

export default router;