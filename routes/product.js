import express from 'express';
const router = express.Router();
import authMiddleWare from "../middleware/auth.js";
import { storage, cloudinary } from "../config/cloudinary.js";
import checkRole from '../middleware/checkRole.js';
import multer from "multer";
import Product from '../models/productSchema.js';

const fileFilter = (req, file, cb)=>{
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/avif"];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."), false);
    }
}

const uploads = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 1024 * 1024 * 5} // 5MB limit
})


router.post('/', authMiddleWare, checkRole("seller"), uploads.array("images", 8), async (req, res)=>{
    const { title, description, category, price, stock } = req.body;
    const imagePaths = req.files ? req.files.map(file => file.path) : [];
    const userId = req.user.id;

    if(!title || !description || !category || !price || !stock){
        return res.status(400).json({ message: "All fields are required!" });
    }

    const newProduct = new Product({
        title,
        description,
        seller: userId,
        category,
        price,
        stock,
        images: imagePaths
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully!", product: newProduct });
})

export default router;