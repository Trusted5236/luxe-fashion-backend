import jwt from 'jsonwebtoken'

const authMiddleWare = (req, res, next)=>{
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({message : "Authorization token required"})
    }

    const token = authHeader.split(" ")[1]

    try {
        const decodeUser = jwt.verify(token, process.env.JWT_KEY)
        req.user = decodeUser
        next()
    } catch (error) {
        return res.status(400).json({message: "Invalid Token!"})
    }

}

export default authMiddleWare