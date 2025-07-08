import mongoose  from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required : [true , "Email is required"],
        unique : true,
    },
    password:{
        type : String,
        required : [true , "Password is required"],
    },
    firstName :{
        type : String,
        required : false,
    },
    lastName :{
        type : String,
        required : false,
    },
    imageURL:{
        type : String,
        required : false,
    },
    colorTheme:{
        type : Number,
        required : false,
    },
    profileSetup:{
        type:Boolean,
        default:false,
    },

})

userSchema.pre("save" , async function(next){
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password , salt)
    next()
})

export const User = mongoose.model('Users' , userSchema);