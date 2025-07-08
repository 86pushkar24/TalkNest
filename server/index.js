import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js"
import contactsRoutes from "./routes/ContactsRoutes.js";
import setUpSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 5555;
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL)
.then(()=>{
    console.log("Database is Connected Successfully");
}).catch(()=>{
    console.log("There was an error connecting to the database")
})

app.use(cors({
    origin : process.env.ORIGIN,
    methods : ["GET" , "POST" , "PATCH" , "DELETE" , "PUT"],
    credentials : true,
}))

app.use("/upload/profiles" , express.static("upload/profiles"));  
app.use("/upload/files" , express.static("upload/files"))
app.use(express.json());
app.use(cookieParser())

app.use("/api/auth" , authRoutes);
app.use("/api/contacts" , contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel" , channelRoutes);


app.get("/" , (req , res)=> {
   res.json({msg : "This is a backend Application"})
})

const server = app.listen(port,()=>{
    console.log(`Server is running on PORT ${port}`);
})

setUpSocket(server);

