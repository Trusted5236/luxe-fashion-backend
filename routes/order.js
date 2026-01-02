import express, { application } from "express";
import authMiddleWare from "../middleware/auth.js";
import Cart from "../models/cartSchema.js";
import Order from "../models/orderModal.js";
import axios from "axios";
import { paypal, getAccessToken } from "../config/paypal.js";
import dotenv from 'dotenv'
const router = express.Router()
dotenv.config()


router.post("/create", authMiddleWare, async (req, res)=>{
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

router.post("/paypal/create-order", authMiddleWare, async (req, res)=>{
    const userId = req.user.id
    const {orderId} = req.body
    const order = await Order.findById(orderId)

     if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

    if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

    if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }


    const response = await axios.post(`${paypal.baseUrl}/v2/checkout/orders`, {
        intent : "CAPTURE",
        purchase_units: [{
            description : "Order Description",
            amount : {
                currency_code : "USD",
                value : order.totalPrice.toFixed(2)
            }
        }]   
    }, {
        headers : {
            "Content-Type" : "application/json",
            Authorization : `Bearer ${await getAccessToken()}`
        }
    }
)

const paypalOrder =  response.data

res.json({
    success : true,
    paypalOrderId : paypalOrder.id,
    orderId : order._id
})
})


router.post("/paypal/capture-order", authMiddleWare, async (req, res)=>{
    const {paypalOrderId, orderId} = req.body
    const userId = req.user.id

    if (!paypalOrderId || !orderId) {
        return res.status(400).json({ 
            message: "PayPal Order ID and Order ID are required" 
        });
    }

    const order =  await Order.findById(orderId)

    if (!order) {
            return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
    }

    const response = await axios.post(`${paypal.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {}, {
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${await getAccessToken()}`
        }
    })

    const captureData = response.data;

    if (captureData.status === "COMPLETED") {
            
            order.orderStatus = "Paid";
            order.paymentId = captureData.id;
            await order.save();

            
            await Cart.findOneAndDelete({ user: userId });

            res.json({
                success: true,
                message: "Payment successful",
                order: {
                    orderId: order._id,
                    orderStatus: order.orderStatus,
                    paymentId: order.paymentId,
                    totalPrice: order.totalPrice
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment failed",
                status: captureData.status
            });
        }
})
export default router