import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRouter from './routes/user.js'
import cors from 'cors'



const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())
const PORT = process.env.PORT
const dataBase = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongodb connected sucessfully")
    } catch (error) {
        console.log("Mongodb connection failed", error.message)
    }
}

dataBase()
app.use("/api/auth", authRouter)



app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
