import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    user : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    products : [{
        product : {type : mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
        quantity : {type : Number, required: true, min: 1},
        price : {type : Number, required: true, min: 0},
        title : {type : String, required: true},
        image : {type : String, required: true}
    }],
    totalPrice : {type : Number, required: true, min: 0, default: 0},
    totalCartProducts: {type : Number, required: true, min: 0, default: 0}
})

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;