import jwt from "jsonwebtoken"

export const verifyToken = async (req , res , next)=>{
    
    const token = req.cookies.jwt;
    
    if(!token){
        return res.status(401).json({
            msg : "Token is required"
        })
    }
    jwt.verify(token , process.env.JWT_KEY , (err , payload)=>{
        if(err) return res.status(401).json({
            msg : "Invalid Token"
        })
        req.userID = payload.id;
        next();
    });  
}

