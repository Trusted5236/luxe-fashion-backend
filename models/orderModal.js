import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user : {type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

    products : [{
            product : {type : mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity : {type : Number, required: true, min: 1},
            price : {type : Number, required: true, min: 0},
            title : {type : String, required: true},
            image : {type : String, required: true}
    }],

    totalProduct : {type : Number, default : 0},
    totalPrice : {type : Number, default : 0},
    paymentId : {type : String},

    shippingAddress : {
        firstName : {type : String, required: true, maxlength: 50},
        lastName : {type : String, required: true, maxlength: 50},
        email : {type : String, required: true},
        phone : {type : String, required : true},
        address: { type: String, required: true },
        city : {type : String, required : true},
        state : {type : String, required : true},
        country : {type : String, required : true},
        zip : {type : String, required : true}
    },
    orderStatus : {type : String, enum : ["Pending", "Paid", "Shipped", "Delivered"], default : "Pending"},
    deliveredAt : {type : Date}
}, {timestamps : true})

const Order = mongoose.model("Order", orderSchema)
export default Order