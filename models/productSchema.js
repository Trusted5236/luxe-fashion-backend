import mongoose from "mongoose";

const productSchema =  new mongoose.Schema({
    title : {type : String, required: true, maxlength: 100},
    description : {type : String, required: true, minlength: 50},
    seller : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    category : {type : mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    price : {type : Number, required: true, min: 0},
    bonus: {type : Number, required: false, min: 0},
    stock : {type : Number, required: true, min: 0},
    images : [{type : String}],
    reviews : [{
        user : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        rating : {type : Number, required: true, min: 1, max: 5},
        comment : {type : String, required: false},
        createdAt : {type : Date, default: Date.now}
    }]
});

const Product = mongoose.model("Product", productSchema)
export default Product;