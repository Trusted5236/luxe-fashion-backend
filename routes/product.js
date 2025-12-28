import express from 'express';
const router = express.Router();
import authMiddleWare from "../middleware/auth.js";
import { storage, cloudinary } from "../config/cloudinary.js";
import checkRole from '../middleware/checkRole.js';
import multer from "multer";
import Product from '../models/productSchema.js';
import Category from '../models/categorySchema.js';

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
    const {sellerName, title, description, category, price, stock, bonus } = req.body;
    const imagePaths = req.files ? req.files.map(file => file.path) : [];
    const userId = req.user.id;

    if(!sellerName || !title || !description || !category || !price || !stock){
        return res.status(400).json({ message: "All fields are required!" });
    }

    const newProduct = new Product({
        sellerName,
        title,
        description,
        seller: userId,
        category,
        price,
        stock,
        bonus,
        images: imagePaths
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully!", product: newProduct });
})


router.get('/',  async (req, res)=>{
    const perPage = parseInt(req.query.perPage) || 8;
    const page = parseInt(req.query.page) || 1;
    const queryCategory = req.query.category;
    const querySearch = req.query.search;

    let query = {};

    if(queryCategory){
        const categories = await Category.findOne({name: queryCategory});

        if(!categories){
            return res.status(400).json({message: "Category not found"});
        }

        query.category = categories._id;
    }

    if(querySearch){
        query.title = { $regex: querySearch, $options: 'i' };
    }

    const products = await Product.find(query).select("-description -seller -category -__v").skip((page - 1) * perPage).limit(perPage).lean();

    const updatedProducts = products.map(product => {
        const numberOfReviews = product.reviews.length;
        const sumOfRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = sumOfRatings / (numberOfReviews || 1);

        return {
            ...product,
            displayImage: product.images[0],
            reviews: {
                numberOfReviews,
                averageRating
            }
        }
    })

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / perPage);
    const totalProductInDB = await Product.countDocuments();

    res.status(200).json({products: updatedProducts, page, perPage, totalPages, totalProducts, totalProductInDB});  
})

router.get('/:id', async (req, res)=>{
    const productId = req.params.id;

    const product = await Product.findById(productId).populate('seller', 'name').populate('category', 'name').lean();

    if(!product){
        return res.status(404).json({message: "Product not found"});
    }

    const numberOfReviews = product.reviews.length;
    const sumOfRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = sumOfRatings / (numberOfReviews || 1);

    const updatedProduct = {
        ...product,
        reviews: {
            numberOfReviews,
            averageRating
        }
    };

    res.status(200).json({ product: updatedProduct });
});

export default router;