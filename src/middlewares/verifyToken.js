const jwt = require("jsonwebtoken")

module.exports.verifyToken = (req, res , next)=> {
    const authToken = req.headers.authorization
    if(authToken){
        const token = authToken.split(" ")[1]
        try {
            const payload = jwt.verify(token , process.env.JWT_SECRET)
            req.user = payload
            next()
        } catch (error) {
            return res.status(403).json({message: "Invalid token , access denide"})
        }
    }else{
        return res.status(401).json({message: "No token provided , access denide"})
    }
}

// verify Token and only admin
module.exports.verifyTokenAndOnlyAdmin = (req,res,next)=> {
    this.verifyToken(req,res , ()=>{
        if(req.user.isAdmin){
            next()
        }else{
            return res.status(403).json({message:"Not allowed , only admin"})
        }
    })
}