import User from "../models/user.models.js";
import FriendRequest from "../models/FriendRequest.js";

export const getRecommendedUsers=async(req,res)=>{

  try{
    const currentUserId=req.user.id;
    const currUser=req.user;

    const recommendedUsers= await User.find({

      $and:[
        {_id:{$ne:currentUserId}},


        {_id:{$nin:currentUser.friends}},

        {isOnboarded:true}


      
      
      
      ]
    }
    
    );

    res.status(200).json(recommendedUsers);
    




  }catch(error){

    res.status(500).send(error.message);



  }



}

export const getMyFriends=async(req,res)=>{

  try{

    const currentUserId=req.user.id;

    const user=await User.findById(currentUserId)
    .select("friends")
    .populate("friends","fullName profilePic nativeLanguage learningLanguage");


    res.status(200).json(user.friends);


  }catch(error){

    res.status(500).send(error.message);



  }

}

export  async function sendFriendRequest(req,res){

  try{

    const myId=req.user.id;
    const friendId=req.params.id;

    if(myId===friendId){

      throw new Error("cannot send request to yourself")

    }

    const friend= await User.findById(friendId);


    if(!friend){
      throw new Error("user does not exist");

    }

    if(friend.friends.includes(myId)){
      throw new Error("You are already friend to this user");

    }

    const existingRequest=await FriendRequest.findOne({

      $or:[
        {sender:myId,receiver:friendId},
        {sender:friendId,receiver:myId}
      ],

    });

    if(existingRequest){
      throw new Error("friend request already exxist between you and this user");

    }


    const friendRequest=await FriendRequest.create({

      sender:myId,
      receiver:friendId,

    });

    res.status(201).json({friendRequest});


      


    





  }catch(error){

    res.status(500).send(error.message);



  }

}

export async function acceptRequest(req,res){


  try {

    const {id:requestid}=req.params;

    const friendRequest= await FriendRequest.findById(requestId);

    if(!friendRequest){
      throw new Error("friend request not found");

    }

    // verify that current user is recipient
    if(friendRequest.recipient.toString()!==req.user.id){
      throw new Error("you are not authorized to accept this request");

    }

    friendRequest.status="accepted";
    await friendRequest.save();


 
      // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });



    


    
  } catch (error) {

    res.status(500).send(error.message);
    
  }


}

export async function getFriendRequests(req,res){
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });


    
  } catch (error) {

    res.status(500).send(error.message);
   
    
  }



}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
