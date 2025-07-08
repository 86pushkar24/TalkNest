import { Message } from "../models/messages.model.js";
import {mkdirSync, renameSync} from "fs";
import moment from "moment";

export const getMessages = async (req , res , next)=>{
    try{
        const user1 = req.userID;
        const user2 = req.body.id;

        if(!user1 || !user2){
            return res.status(404).json({
                msg : "Both the Users are Required"
            })
        }

        const messages = await Message.find({
            $or: [
                {sender : user1 , receiver : user2},
                {sender : user2 , receiver : user1},
            ]
        }).sort({timeStamp : 1});

        return res.status(200).json({
            messages
        })
        
    }catch(error){
        return res.status(500).json({
            msg : "Internal Server Error"
        })
    }
}

export const uploadFile = async (req , res , next) =>{
    console.log("hello");
    try{
        if(!req.file){
            return res.status(400).json({
                msg : "File is Required"
            })
        }

        const date = moment().format('YYYY-MM-DD-HH-mm-ss');
        const fileDir = `upload/files/${date}`;
        const filePath = `${fileDir}/${req.file.originalname}`

        mkdirSync(fileDir , {recursive : true});

        renameSync(req.file.path , filePath);

        return res.status(200).json({
            filePath
        })


    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR",
        })
    }
}