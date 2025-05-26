import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export const protectRoute=async(req,res,next)=>{

  try{
    const token =req.cookies.jwt;

    if(!token){
      return res.status(400).send("unauthorised user");
    }

    const decoded =jwt.verify(token,process.env.JWT_SECRET_KEY);

    if(!decoded){
      throw new Error("unauthorised user");
    }

    const user =await User.findById(decoded.userId).select("-password");

    if(!user){
      throw new Error("unauthorised user");
    }

    
    req.user=user;
    next();












  }catch(Error){

    return res.status(500).json(Error.message);

    




  }











};