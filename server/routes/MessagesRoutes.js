import {Router} from "express";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({dest : "./upload/files"});

messagesRoutes.post("/getMessages" , verifyToken , getMessages);
messagesRoutes.post("/uploadFile" ,
     verifyToken ,
     upload.single("file") ,
     uploadFile,
 )


export default messagesRoutes;


