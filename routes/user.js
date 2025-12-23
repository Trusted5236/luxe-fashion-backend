import express from 'express'
import User from '../models/userSchema.js'
const router = express.Router()
import Joi from 'joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import authMiddleWare from '../middleware/auth.js'
import sendEmail from '../config/amazonses.js'

const createJoiSchema = Joi.object({
    name: Joi.string().required().min(3),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
})

router.post("/", async (req, res)=>{
    const {name, email, password} = req.body
    const JoiValidation = createJoiSchema.validate(req.body)
    const hashedPassword = await bcrypt.hash(password, 10)

    if (JoiValidation.error){
        return res.status(400).json({error : JoiValidation.error.details[0].message}) 
    }

    const user = await User.findOne({email : email})
    if(user){
        return res.status(400).json("User already exist")
    }

    const newUser = new User({
        name : name,
        email : email,
        password : hashedPassword
    })

    await newUser.save()
    const token = await getAccessToken({id: newUser._id, role: newUser.role, email : newUser.email, name: newUser.name})
    res.status(201).json(token)
})

router.post("/login", async (req, res)=>{
    const {email, password} = req.body
    const user = await User.findOne({email: email})
    
    if(!user){
        res.status(400).json({message : "Invalid credentials!"})
    }

    const comparedPassword = await bcrypt.compare(password, user.password)

    if(!comparedPassword){
        res.status(400).json({message : "Invalid credentials!"})
    }

    const token = getAccessToken({id: user._id, role: user.role, email : user.email, name: user.name})
    res.status(201).json(token)
})

router.get("/profile", authMiddleWare, async (req, res)=>{
    const id = req.user.id
    const users = await User.findById(id).select("-password -__v")
    return res.status(200).json(users)
})

router.post("/request-password-reset", async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email: email})

    if(!user){
        return res.status(400).json({message : "This email is not registered!"})
    }

    let resetToken = jwt.sign({id: user._id}, process.env.JWT_KEY, {expiresIn : '1h'})
    user.resetToken = resetToken
    user.resetTokenExpiry = Date.now() + 3600000 
    await user.save()

    const subject = "Password Reset Request"
    const text = `Click the link to reset your password: ${process.env.Frontend_URL}/reset-password?resetToken=${resetToken}`

    await sendEmail(user.email, subject, text)

    res.status(200).json({message : "Reset token generated successfully!", resetToken})
})

router.post("/reset-password", async (req, res)=>{
    const {resetToken, newPassword} = req.body

    const decodedUser = jwt.verify(resetToken, process.env.JWT_KEY)
    let user = await User.findById(decodedUser.id)

    if(!user || user.resetToken !== resetToken || user.resetTokenExpiry <= Date.now()){
        return res.status(400).json({success: false, message : "Invalid reset token!"})
    }

    const samePassword = await bcrypt.compare(newPassword, user.password)
    if(samePassword){
        return res.status(400).json({message : "New password must be different from the old password!"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedPassword
    user.resetToken =  null
    user.resetTokenExpiry = null
    await user.save()
    res.status(200).json({message : "Password reset successfully!"})
})

const getAccessToken = (data)=>{
    const token = jwt.sign(data, process.env.JWT_KEY, {expiresIn : '2h'})
    return token
}

export default router