import express from "express";
const router = express.Router();
import Category from "../models/categorySchema.js";
import Joi from "joi";
import authMiddleWare from "../middleware/auth.js";
import checkRole from "../middleware/checkRole.js";
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/categories/')
    },
    filename:(req, file, cb)=>{
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        cb(null, `${timestamp}-${originalName}`);
    }
})

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


router.post("/", authMiddleWare, uploads.single("image"), async (req, res)=>{
    const {name} = req.body
    const image = req.file ? req.file.path : null

    if(!image || !name){
        return  res.status(400).json({message : "Name and image are required!"})
    }

    const existingCategory = await Category.findOne({name: name})

    if(existingCategory){
        return res.status(400).json({message : "Category already exists!"})
    }

    const newCategory = new Category({
        name: name,
        image: image
    })
    await newCategory.save()
    res.status(201).json({message : "Category created successfully!", category : newCategory})
})

export default router