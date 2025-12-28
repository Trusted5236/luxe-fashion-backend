import express, { json } from 'express';
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
    res.status(200).json({message : "Product added to cart successfully", cart: cart})
})

router.get("/", authMiddleWare, async (req, res)=>{
    const userId = req.user.id

    const cart = await Cart.findOne({user : userId})

    if(!cart){
        res.status(404).json({message: "Cart not found"})
    }

    res.status(200).json(cart)
})

router.patch("/increase/:productId", authMiddleWare, async (req, res)=>{
    const {productId} = req.params
    const {quantity} = req.body
    const {userId} = req.user.id

    const product = await Product.findById(productId)

    if(!product){
        return res.status(404).json({message: "Product not found"});
    }

    const cart = await Cart.findOne({user : userId})

    if(!cart){
        res.status(404).json({message: "Cart not found"})
    }

    const productIndex = cart.products.findIndex(item => item.product.toString()  === productId.toString())

    if(productIndex === -1){
        res.status(404).json({message: "Product not found in cart"})
    }

    if(cart.products[productIndex].quantity === product.stock){
        return res.status(404).json({message: 'Insufficient stock'})
    }
    
    cart.products[productIndex].quantity += quantity
    cart.totalCartProducts = cart.products.reduce((sum, item)=> sum + item.quantity, 0)
    cart.totalPrice = cart.products.reduce((sum, item)=> sum + (item.quantity * item.price), 0)

    await cart.save()
    res.status(200).json({message : "Product updated successfully", cart: cart})
})



router.patch("/decrease/:productId", authMiddleWare, async (req, res)=>{
    const {productId} = req.params
    const {quantity} = req.body
    const {userId} = req.user.id

    const product = await Product.findById(productId)

    if(!product){
        return res.status(404).json({message: "Product not found"});
    }

    const cart = await Cart.findOne({user : userId})

    if(!cart){
        res.status(404).json({message: "Cart not found"})
    }

    const productIndex = cart.products.findIndex((item)=> item.product.toString() === productId.toString())

    
    if(productIndex === -1){
        res.status(404).json({message: "Product not found in cart"})
    }

    if(cart.products[productIndex].quantity === product.stock){
        return res.status(404).json({message: 'Insufficient stock'})
    }

    if(cart.products[productIndex].quantity > 1){
        cart.products[productIndex].quantity -= quantity
    }else{
        cart.products.splice(productIndex, 1)
    }

    cart.totalPrice -= 1
    cart.totalCartProducts -= 1


    await cart.save()
    res.status(200).json({message : "Product updated successfully", cart: cart})
})


router.patch("/delete/:productId", authMiddleWare, async (req, res)=>{
    const {productId} = req.params
    const {userId} = req.user.id

    const product = await Product.findById(productId)

    if(!product){
        return res.status(404).json({message: "Product not found"});
    }

    const cart = await Cart.findOne({user : userId})

    if(!cart){
        res.status(404).json({message: "Cart not found"})
    }

    const productIndex = cart.products.findIndex((item)=> item.product.toString() === productId.toString())

    
    if(productIndex === -1){
        res.status(404).json({message: "Product not found in cart"})
    }

    if(cart.products.length === 0  && cart.products[productIndex].product.toString() === productId.toString()){
        await Cart.deleteOne({user : userId})
        res.status(200).json({message : "Product deleted successfully", cart: cart})
    }

    cart.products.splice(productIndex, 1)
    cart.totalCartProducts = cart.products.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cart.save()
    res.status(200).json({message : "Product deleted successfully", cart: cart})
})





export default router;