import mongoose from "mongoose";
import Channel from "../models/channel.model.js"
import {User} from "../models/user.model.js"

export const CreateChannel = async (req , res , next) =>{
    try{
        const {name , members} = req.body;
        const user = new mongoose.Types.ObjectId(req.userID);
        const admin = await User.findById(user);

        if(!admin){
            return res.status(400).json({
                msg : "Admin User Not Found",
            })
        }

        const validMembers =await User.find({ _id : {$in : members}})

        if(validMembers.length !== members.length){
            return res.status(400).json({
                msg : "Some Members are not Valid Users"
            })
        }

        const channel = await Channel.create({
            name,
            admin : [admin._id],
            members
        })

        return res.status(200).json({
            msg : "Channel Created Successfully",
            channel,
        })

        
    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR",
        })
    }
}

export const getUserChannels = async (req , res , next) =>{
    try{
        
        const userId = new mongoose.Types.ObjectId(req.userID);

        const channels = await Channel.find({
            $or : [
                {admin : userId},
                {members : userId},
            ]
        }).sort({updatedAt : -1});

        return res.status(200).json({
            channels,
        })
    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : 'INTERNAL SERVER ERROR',
        })
    }
}

export const getChannelMessages = async (req , res , next) => {
    try{
        const {channelId} = req.params;

        if(!channelId){
            return res.status(400).json({
                msg : "NO ChannelId was provided"
            })
        }

        const channel = await Channel.findById(channelId)
        .populate({
            path: 'messages',
            select: 'sender messageType content fileUrl timeStamp ',
            populate: {
            path: 'sender',
            select: 'colorTheme firstName lastName emailID'
            }
        });

        const messages = channel.messages;

        return res.status(200).json({
            messages,
        })

    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR",
        })
    }
}