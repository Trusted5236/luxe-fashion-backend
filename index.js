import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import authRouter from './routes/user.js'
import cors from 'cors'
import categoryRouter from './routes/category.js'
import productRouter from './routes/product.js'
import cartRouter from './routes/cart.js'
import orderRouter from "./routes/order.js"
import adminRouter from "./routes/admin.js"
import authenticationRouter from "./routes/authentication.js"
import './config/passport.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './config/swagger.js'

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config(); // Uses .env by default
}

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))
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
app.use("/api/categories", categoryRouter)
app.use("/api/products", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/admin", adminRouter)
app.use("/api/authentication", authenticationRouter)


// Add this before app.listen()
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`)
})
