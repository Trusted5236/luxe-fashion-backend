import authMiddleWare from "../middleware/auth.js";
import checkRole from "../middleware/checkRole.js";
import express, { Router } from "express"
const router = express.Router()
import User from "../models/userSchema.js"
import Product from "../models/productSchema.js"
import Order from "../models/orderModal.js"

router.use(authMiddleWare, checkRole("admin"))

router.get('/stats', async (req, res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({role : "user"})
    const totalSellers = await User.countDocuments({role : "seller"})
    const totalAdmins = await User.countDocuments({role : "admin"})
    const totalProducts = await Product.countDocuments()
    
    const users = await User.find({role : "user"}).select("-password -__v").sort({createdAt : -1}).skip(skip).limit(limit)
    
    // Get sellers with their product counts
    const sellersRaw = await User.find({role : "seller"}).select("-password -__v").sort({createdAt : -1}).skip(skip).limit(limit)
    
    const sellers = await Promise.all(
        sellersRaw.map(async (seller) => {
            const productCount = await Product.countDocuments({ 
                seller: seller._id 
            });
            return {
                ...seller.toObject(),
                productCount
            };
        })
    );
    
    const admins = await User.find({role : "admin"}).select("-password -__v").sort({createdAt : -1}).skip(skip).limit(limit)
    const products = await Product.find().populate('seller', 'name email').populate('category', 'name image').select("-password -__v").sort({createdAt : -1}).skip(skip).limit(limit);

    const revenue = await Order.aggregate([
        {$match : {orderStatus : "Paid"}},
        {$group : {_id: null, total : {$sum : `$totalPrice`}}}
    ])

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
        role: 'user',
        createdAt: { $gte: thisMonth }
    });
    
    const newSellersThisMonth = await User.countDocuments({
        role: 'seller',
        createdAt: { $gte: thisMonth }
    });
    
    res.json({
        users: {
            total: totalUsers,
            newThisMonth: newUsersThisMonth,
            list: users,
        },
        sellers: {
            total: totalSellers,
            newThisMonth: newSellersThisMonth,
            list: sellers,
            products
        },
        admins: {
            total: totalAdmins,
            list: admins
        },
        products: {
            total: totalProducts,
            list: products
        },
        revenue: revenue[0]?.total || 0,
        pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalUsers / limit)
        }
    });
})

export default router

