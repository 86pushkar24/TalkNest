import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {renameSync, unlinkSync} from "fs";


const maxAge = 7 * 24 * 60 * 60 * 1000;

const createToken = (email , id) =>{
    return jwt.sign({email , id}, process.env.JWT_KEY , {expiresIn : maxAge});
}

export const signup = async (req , res , next) =>{
    try{
        
        const {email , password} = req.body;

        if(!email){
            return res.status(400).json({
                msg : "Email is required"
            });
        }

        if(!password){
            return res.status(400).json({
                msg : "Password is required"
            });
        }

        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(404).json({
                msg : "User with this email already exits"
            });
        }

        const user = await User.create({email , password});

        if(!user){
            return res.status(500).json({
                msg : "There was an internal error while creating the User"
            });
        }
    
        res.cookie("jwt" , createToken(email , user._id) , {
            maxAge,
            secure : true,
            sameSite : "None",
        });

        return res.status(201).json({
            user : {
                email : user.email,
                _id : user._id,
                profileSetup : user.profileSetup,
            }
        })


    }catch(err){
        console.log({err});
        return res.status(500).json({
            msg : "Internal Server Error Due to Some Unforseen Reasons"
        });
    }
}

export const login = async(req , res , next) => {
    try{
        const {email , password} = req.body

        if(!email){
            return res.status(400).json({
                msg : "Email is required"
            });
        }

        if(!password){
            return res.status(400).json({
                msg : "Password is required"
            });
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                msg : "No such user with this email exists"
            })
        }

        const checkPassword = await bcrypt.compare(password , user.password);
        if(!checkPassword){
            return res.status(401).json({
                msg : "Invalid Password",
            })
        }
        res.cookie("jwt" , createToken(email , user.id) , {
            maxAge,
            secure : true,
            sameSite : "None",
        });

        return res.status(200).json({
            user : {
                email : user.email,
                _id : user._id,
                profileSetup : user.profileSetup,
                firstName : user.firstName,
                lastName : user.lastName,
                imageURL : user.imageURL,
                colorTheme : user.colorTheme,          
            }
        })

    }catch(e){
        res.status(500).json({
            msg : "There was an internal error"
        })
    }
    
}

export const getUserInfo = async (req , res , next) =>{
    try{
        const userData = await User.findById(req.userID);

        if(!userData){
            return res.status(401).json({
                msg : "User with the given ID not found"
            })
        }

        return res.status(200).json({
            user : userData,
        })

    }catch(error){
        return res.status(500).json({
            msg : "There was an internal error"
        })
    }
}

export const updateProfile = async (req , res , next) => {
     try{
         
         const {userID} = req;
         const {firstName , lastName , color} = req.body;

         if(!firstName || !lastName ){
            return res.status(401).json({
                msg : "FirstName and LastName are required fields"
            })
         }

         const userData = await User.findByIdAndUpdate(userID , {
            firstName , lastName , colorTheme : color , profileSetup : true
         },{new : true , runValidators : true});

         return res.status(200).json({
            user : userData,
        })

     }catch(error){
        return res.status(500).json({
            msg : "There was an internal error"
        })
     }
}

export const updateProfileImage = async (req ,res , next) => {
    try{
        if(!req.file){
            return res.status(400).json({
                msg : "File is Required"
            })
        }
    
        const date = Date.now();
        let fileName = "upload/profiles/" + date + req.file.originalname;
        
        renameSync(req.file.path , fileName);
    
        const updatedUser = await User.findByIdAndUpdate( 
            req.userID ,
            { imageURL : fileName} ,
            { new : true} , 
            { runValidators : true});
    
        return res.status(201).json({
            imageURL : updatedUser.imageURL,
        })
    }catch(err){
        console.log({err});
        return res.status(500).json({msg : "Internal Servor Error"});
    }   
};

export const deleteProfileImage = async(req , res , next) => {
    try{
        const userID = req.userID;
        const user = await User.findById(userID);
        if(!user){
            res.status(400).json({
                msg : "No such User exits"
            })
        }

        if(user.imageURL) unlinkSync(user.imageURL);

        user.imageURL = "";
        await user.save();

        return res.status(201).json({
            msg : "Profile Image Removed Successfully"
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            msg : "There was an INTERNAL SERVER ERROR",
        })
    }
    
}

export const Logout = async (req , res , next) =>{
    try{
        res.cookie("jwt" , "" , {maxAge:1 , sameSite: "None" , secure : true});
        res.status(200).json({
            msg : "Logout Successfull."
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            msg: "There was an Internal SERVER ERROR"
        })
    }
}