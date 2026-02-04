const expressAsyncHandler = require("express-async-handler")
// const {User , validationRegisterUser , validationLoginUser} = require("../model/User")
const argon2 = require("argon2")
const { User, validationRegisterUser, validationLoginUser } = require("../models/User")
/**
 * @route /api/auth/register
 * @desc register user
 * @access public
 */
module.exports.registerUserCtrl = expressAsyncHandler(async(req,res)=> {
    const {error} = validationRegisterUser(req.body)
    if(error){
        return res.status(400).json({message : error.details[0].message})
    }
    let user = await User.findOne({email : req.body.email})
    if(user){
        return res.status(404).json({message: "user already exist"})
    }
     user = await User.create({
        userName : req.body.userName,
        email : req.body.email,
        password : req.body.password
    })
    return res.status(201).json({message:"The register has been created successfully. Please log in."})
})


/**
 * @route /api/auth/login
 * @desc login user
 * @access public
 */
module.exports.loginUserCtrl = expressAsyncHandler(async(req,res)=>{
     const {error} = validationLoginUser(req.body)
    if(error){
        return res.status(400).json({message : error.details[0].message})
    }
    const user = await User.findOne({email : req.body.email})
    if(!user){
        return res.status(404).json({message: "user not found"})
    }
    const validPassword = await argon2.verify(user.password, req.body.password)
    if (!validPassword) {
        return res.status(400).json({ state : "error" , message: 'Invalid email or password' })
    }
    const token = user.generateAuthToken()
    return res.status(200).json({
        id: user._id,
        isAdmin : user.isAdmin,
        wallet: user.wallet,
        userName: user.userName,
        email: user.email,
        token
    })
})