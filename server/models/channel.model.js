import mongoose from "mongoose";

const channelSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
    },
    members : [{
        type : mongoose.Schema.ObjectId,
        ref : "Users",
        required : true,
    }],
    admin : [{
        type : mongoose.Schema.ObjectId,
        ref : "Users",
        required : true,
    }],
    messages : [{
        type : mongoose.Schema.ObjectId,
        ref : "Messages",
    }],
} , {timeStamps : true})

const Channel = mongoose.model("Channel" , channelSchema);
export default Channel;

