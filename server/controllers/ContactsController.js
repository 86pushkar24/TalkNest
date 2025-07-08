import mongoose from "mongoose";
import {User} from "../models/user.model.js"
import {Message} from "../models/messages.model.js"

export const searchedContacts = async (req , res , next) =>{
    try{
        const {searchTerm} = req.body

        if(searchTerm === undefined || searchTerm === null){
            return res.status(400).json({
                msg:"Search Term is Required"
            })
        }

        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${([\])}|\\]/g,"\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm , "i");

        const contacts = await User.find({
            $and:[
                {_id : {$ne : req.userID} },
                {$or : [
                    {firstName : regex},
                    {lastName : regex},
                    {email : regex}
                ]},
            ],
        });

        return res.status(200).json({contacts});

    }catch(err){
        console.log({err});
        return res.status(500).json({
            msg : "Internal Server Error"
        })
    }
}

export const getContactsForDMList = async (req , res , next)=>{
    try{    
        let {userID} = req;
        userID = new mongoose.Types.ObjectId(userID);


        const contacts = await Message.aggregate([
            {
                $match : {
                    $or : [{sender : userID} , {receiver : userID}]
                }
            },
            {
                $sort : {timeStamp : -1}
            },
            {
                $group : {
                    _id : {
                        $cond : {
                            if:{ $eq : ["$sender" , userID]},
                            then : "$receiver",
                            else : "$sender",
                        }
                    },
                    lastMessageTime : {$first : "$timeStamp"},
                },
            },
            {
                $lookup : {
                    from : "users",
                    localField : "_id",
                    foreignField : "_id",
                    as : "contactInfo",
                },
            },
            {
                $unwind : "$contactInfo",
            },
            {
                $project: {
                    _id : 1,
                    lastMessageTime : 1,
                    email : "$contactInfo.email",
                    firstName : "$contactInfo.firstName",
                    lastName : "$contactInfo.lastName",
                    imageURL : "$contactInfo.imageURL",
                    colorTheme : "$contactInfo.colorTheme",
                }
            },
            {
                $sort : {lastMessageTime : -1},
            },  
        ]);

        return res.status(200).json({
            contacts
        })
    }catch(error){
        console.log({error});
        return res.status(404).json({
            msg : "INTERNAL SERVER ERROR"
        })
    }
}

export const getAllContacts = async (req , res , next) =>{
    try{
        const users = await User.find({_id : {$ne : req.userID} } , 
            "firstName , lastName , _id , email"
        );

        const contacts = users.map((user)=> ({
            label : user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value : user._id,
        }))

        return res.status(200).json({
            contacts
        })
        
    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR"
        })
    }
}