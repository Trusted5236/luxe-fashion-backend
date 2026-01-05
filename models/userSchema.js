import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type: String, required: true, minlength: 3},
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true, minlength: 6},
    role: {type : String, enum: ["user", "seller", "admin"], default: "user"},
    resetToken: {type: String},
    resetTokenExpiry: {type: Date},
    createdAt : {type : Date, default: Date.now}
})

const User = mongoose.model("User", userSchema)

export default User