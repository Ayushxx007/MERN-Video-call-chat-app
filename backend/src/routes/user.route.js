import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";


const userRouter=express.Router();
import { getRecommendedUsers,getMyFriends,sendFriendRequest,acceptRequest, getFriendRequests,getOutgoingFriendReqs } from "../controllers/user.controller.js";


userRouter.get("/",protectRoute, getRecommendedUsers);
userRouter.get("/friends",protectRoute, getMyFriends);
userRouter.post("/friend-request/:id",protectRoute,sendFriendRequest);
userRouter.put("/friend-request/:id/accept",protectRoute,acceptRequest);
userRouter.get("/friend-requests",protectRoute, getFriendRequests);
userRouter.get("/outgoing-friend-requests",protectRoute,getOutgoingFriendReqs);



export default userRouter;