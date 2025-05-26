import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();
import { signup, login, logout,onBoarding } from "../controllers/auth.controller.js";

authRouter.post("/signup", signup);

authRouter.post("/login", login);

authRouter.post("/logout", logout);


authRouter.post("/onboarding",protectRoute, onBoarding);


authRouter.get("/me",protectRoute,(req,res)=>{
  res.status(200).json({success:true,user:req.user});

})


export default authRouter;