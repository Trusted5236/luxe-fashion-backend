import express from 'express';
import authMiddleWare from '../middleware/auth.js';
import Product from '../models/productSchema.js';
const router = express.Router();
import Cart from '../models/cartSchema.js';


router.post('/:productId', authMiddleWare, async (req, res) => {
    const {productId} = req.params
    const {quantity} = req.body
    const userId = req.user.id

    if(!productId || !quantity){
       return res.status(404).json({message: "Missing required field"});
    }

    const product = await Product.findById(productId)

    if(!product){
        return res.status(404).json({message: "Product not found"});
    }

    if(product.stock < quantity){
        return res.status(404).json({message: 'Insufficient stock'})
    }

    let cart = await Cart.findOne({user : userId})

    if(!cart){
        cart = new Cart({
            user : userId,
            products: [],
            totalPrice : 0,
            totalCartProducts : 0,
        })
    }

    const existingItemIndex = cart.products.findIndex(item => item.product.toString() === productId.toString())

    if (existingItemIndex > -1){
        cart.products[existingItemIndex].quantity += quantity;

        if (cart.products[existingItemIndex].quantity > product.stock){
        return res.status(404).json({message: 'Insufficient stock'})
    }
    }else{
        cart.products.push({
            product: product._id,
            quantity: quantity,
            title: product.title,
            price: product.price,
            image: product.images[0]
        })
    }

    cart.totalCartProducts = cart.products.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cart.save()
    res.status(200).json({messgae : "Product added to cart successfully", cart: cart})
})











export default router;