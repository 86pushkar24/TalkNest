import {Server as socketIoServer} from "socket.io"
import {Message} from "./models/messages.model.js";
import Channel from "./models/channel.model.js"

const setupSocket = (server) => {

    const io = new socketIoServer(server , {
        cors:{
            origin: process.env.ORIGIN,
            methods : ["GET" , "POST"],
            credentials:true,
        },
    });

    const userSocketMap = new Map();

    const disconnect = (socket) => {
        for(const [userId , socketId] of userSocketMap){
            if(socketId == socket.id ){
                userSocketMap.delete(userId);
            }
        }
        console.log(`User got disconnected ${socket.id}`);
    }

    const sendMessage = async (message) =>{

        try{
            //getting the socket Id of sender and receiver from the message(object sent by the frontend);
            const senderSocketId = userSocketMap.get(message.sender);
            const receiverSocketId = userSocketMap.get(message.receiver);

            //creating Message Object in backend and saving it
            const createdMessage  = await Message.create(message);

            const messageData = await Message.findById(createdMessage._id)
            .populate("sender" , "firstName lastName colorTheme imageURL email")
            .populate("receiver",  "firstName  lastName  colorTheme imageURL email");

            //emitting message if receiver exists
            if(receiverSocketId){   
                io.to(receiverSocketId).emit("recieveMessage" , messageData)
            }

            //emitting message if sender exists
            if(senderSocketId){
                io.to(senderSocketId).emit("recieveMessage" , messageData);
            }
        }catch(error){
            console.log({error});
        }       
    }

    const sendMessageOnChannel = async (message) => {
        try{
            const createdMessage = await Message.create(message);

            const messageData = await Message.findById(createdMessage._id)
            .populate("sender" , "firstName lastName  colorTheme imageURL email _id")
            .exec();

            await Channel.findByIdAndUpdate(message.channel , {
                $push : {messages : createdMessage._id},
            });

            const channel = await Channel.findById(message.channel)
            .populate("members")
            .populate("admin");

            const finalData = {...messageData._doc , channelId : channel._id};
            

            if(channel && channel.members){
                channel.members.forEach( (member) => {
                    const memberSocketId = userSocketMap.get(member._id.toString());
                    if(memberSocketId){
                        io.to(memberSocketId).emit("recieveChannelMessage" , finalData);
                    }
                })
            }

            if(channel && channel.admin){
                channel.admin.forEach( (admin) =>{
                    const adminSocketId = userSocketMap.get(admin._id.toString());
                    if(adminSocketId){
                        io.to(adminSocketId).emit("recieveChannelMessage" , finalData);
                    }
                })
            }

        }catch(error){
            console.log({error});
        }
    }

    io.on("connection" , (socket)=>{

        const userId = socket.handshake.query.userId;

        if(userId){
            userSocketMap.set(userId , socket.id);
            console.log(`User with ID ${userId} got connected to Session ID ${socket.id}`);
        }else{
            console.log(`User ID not provided during connnection`)
        }
        
        socket.on("sendMessage" , sendMessage);
        socket.on("sendMessageOnChannel" , sendMessageOnChannel);
        socket.on("disconnect",() => disconnect(socket))
    })
}

export default setupSocket;