import moongoose from "mongoose";

const messageSchema = new moongoose.Schema({
    sender : {
        type : moongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true,
    },

    receiver : {
        type : moongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : false,
    },

    messageType : {
        type : String,
        enum : ["text" , "file"],
        required : true,
    },

    content :{
        type : String,
        required : function () {
            return this.messageType === "text";
        }
    },

    fileUrl : {
        type : String,
        required : function (){
            return this.messageType === "file";
        }
    },

    timeStamp : {
        type : Date,
        default : Date.now,
    }   
});

export const Message = moongoose.model("Messages" , messageSchema);