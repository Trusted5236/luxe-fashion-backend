import express from 'express'
import User from '../models/userSchema.js'
const router = express.Router()
import Joi from 'joi'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import authMiddleWare from '../middleware/auth.js'

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

    const token = await getAccessToken({id: user._id, role: user.role, email : user.email, name: user.name})
    res.status(201).json(token)
})

router.get("/profile", authMiddleWare, async (req, res)=>{
    const id = req.user.id
    const users = await User.findById(id).select("-password -__v")
    return res.status(200).json(users)
})

const getAccessToken = (data)=>{
    const token = jwt.sign(data, process.env.JWT_KEY, {expiresIn : '2h'})
    return token
}

export default router