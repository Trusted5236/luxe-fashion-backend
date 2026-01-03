import express from "express";
const router = express.Router();
import Category from "../models/categorySchema.js";
import authMiddleWare from "../middleware/auth.js";
import checkRole from "../middleware/checkRole.js";
import multer from "multer";
import { storage, cloudinary } from "../config/cloudinary.js";
import fs from "fs"

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


router.post("/", authMiddleWare, checkRole("admin"), uploads.single("image"), async (req, res)=>{
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

router.get("/", async (req, res)=>{
    const categories =  await Category.find()
    res.status(200).json(categories)
})

router.delete("/:id", authMiddleWare, checkRole("admin"), async (req, res)=>{
    const {id} = req.params
    const category = await Category.findById(id)
    if(!category){
        return res.status(404).json({message : "Category not found!"})
    }  

    if(category.image){
        const publicId = category.image.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(`categories/${publicId}`)
    }
    
    await Category.findByIdAndDelete(id)
    res.status(200).json({message : "Category deleted successfully!"})
})

router.patch("/:id", authMiddleWare, checkRole("admin"), uploads.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }


        const updateData = {};
        if (name) updateData.name = name;


        if (req.file) {

            if (category.image) {
                const publicId = category.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`categories/${publicId}`);
            }


            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categories",
                transformation: [
                    { width: 800, height: 800, crop: "limit" },
                    { quality: "auto" }
                ]
            });

            updateData.image = result.secure_url;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Category updated successfully!",
            category: updatedCategory
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            message: "Error updating category", 
            error: error.message 
        });
    }
});

export default router