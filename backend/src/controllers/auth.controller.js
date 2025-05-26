import validator from 'validator';
import User from '../models/user.models.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from '../lib/stream.lib.js';


export const signup = async(req, res) => {

  try{

    const {fullName, email, password} = req.body;

    if(!fullName || !email || !password){
      return res.status(400).json({message: "All fields are required"});
    }

    if(password.length < 8){
      return res.status(400).json({message: "Password must be at least 8 characters long"});
    }

    if(!email.includes("@")){
      return res.status(400).json({message: "Invalid email"});
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1 })) {
      return res.status(400).json({ error: 'Password is not strong enough' });
    }


  
    const user = await User.findOne({email});
  
    if(user){
      return res.status(400).json({message: "email already exists"});
    }

    const idx =Math.floor(Math.random()*100)+1;   // generate a no. btw 1-100

    const avatar=`https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser =await User.create({email, fullName,password, profilePic: avatar});

    // create the user in the STREAM also

   try{
    await upsertStreamUser({
      id:newUser._id.toString(),
      name:newUser.fullName,
      iamge:newUser.profilePic || ""

    });
    console.log(`stream user created for ${newUser.fullName}`);

   }catch(error){
    console.log("error creating stream user",error);

   }




    const token =jwt.sign({userId:newUser._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"});

    res.cookie("jwt",token,{maxAge:7*24*60*60*1000, httpOnly:true, sameSite:"strict", secure:process.env.Node_ENV==="production"});


    res.status(201).json({success:true,user:newUser});
  
    



  }catch(error){


    res.status(500).json({message: "Internal server error"});





  }




  
  















};

export const login = async(req, res) => {

  try{
    const {email, password} = req.body;

    if(!email || !password){

      throw new Error("all field are required");


    }

      

    

const user = await User.findOne({email})
if(!user){

  throw new Error("Invalid email or password");

}

const isMatch = await user.matchPassword(password);

if(!isMatch){

  throw new Error("Invalid email or password");

}

const token =jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"7d"});

res.cookie("jwt",token,{maxAge:7*24*60*60*1000, httpOnly:true, sameSite:"strict", secure:process.env.Node_ENV==="production"});


res.status(200).json({success:true,user});




  }catch(error){

    res.status(500).json({ message:"intenal server error"})

   

  }
  
  
};

export const logout =async (req, res) => {

  res.clearCookie("jwt");
  res.status(200).json({success:true});

 
};

export const onBoarding=async(req,res)=>{

  try{
    const loggedInUser=req.user;

    const {bio,nativeLanguage,learningLanguage,fullName}=req.body;

    if(!bio || !nativeLanguage || !learningLanguage || !fullName){

    return res.status(400).json({
      message:"all fileds are required..",
    });
  }

  
  const updatedUser=  await User.findByIdAndUpdate(loggedInUser._id,{
    ...req.body,
    isOnboarded:true,
    

  },{new:true});

  if(!updatedUser){
    throw new Error("user is not updated:error");
  }

  // TODO update userInfo to Stream

  try{

    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image:updatedUser.profilePic || ""
  
  
  
    });

    console.log("stream user updated after onBoarding");
  }catch(streamError){
    console.log(streamError.message);

  }


 









  res.status(200).json({success:true,
    user:updatedUser
  });





  
    

  }catch(error){

    res.status(500).send(error.message);

  }

 





  
}