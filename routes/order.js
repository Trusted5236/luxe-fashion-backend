import express from "express";
import authMiddleWare from "../middleware/auth.js";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderModal.js";
const router = express.Router()


router.post("/", authMiddleWare, async (req, res)=>{
    const {firstName, lastName, email, phone, address, city, state, country, zip} = req.body
    const userId = req.user.id

    const cart = await Cart.findOne({ user: userId });

    if(!firstName || !lastName || !email || !phone || !address || !city || !state || !country || !zip){
        return res.status(400).json({message : "Fill all required fields"})
    }

    if(!cart){
        return res.status(404).json({message : "Cart not found"})
    }

    const newOrder = new Order({
        user : userId,
        products : cart.products,
        shippingAddress : {
            firstName : firstName,
            lastName : lastName,
            email : email,
            phone : phone,
            address : address,
            city : city,
            state : state,
            country : country,
            zip : zip
        },
        totalProduct : cart.totalCartProducts,
        totalPrice : cart.totalPrice,
        orderStatus : "Pending"
    })

    await newOrder.save()
    res.status(201).json({message: "Order created, awaiting payment", orderId: newOrder._id, order : newOrder});
})

export default router