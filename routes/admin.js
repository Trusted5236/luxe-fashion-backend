import authMiddleWare from "../middleware/auth.js";
import checkRole from "../middleware/checkRole.js";
import express, { Router } from "express"
const router = express.Router()
import User from "../models/userSchema.js"
import Product from "../models/productSchema.js"
import Order from "../models/orderModal.js"

router.use(authMiddleWare, checkRole("admin"))

router.get('/stats', async (req, res)=>{
    const totalUsers = await User.countDocuments({role : "user"})
    const totalSellers = await User.countDocuments({role : "seller"})
    const totalAdmins = await User.countDocuments({role : "admin"})

    const totalProducts = await Product.countDocuments()

    const revenue = await Order.aggregate([
        {$match : {status : "completed"}},
        {$group : {_id: null, total : {$sum : $totalPrice}}}
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
                newThisMonth: newUsersThisMonth
            },
            sellers: {
                total: totalSellers,
                newThisMonth: newSellersThisMonth
            },
            admins: totalAdmins,
            products: totalProducts,
            revenue: revenue[0]?.total || 0
        });
})

export default router