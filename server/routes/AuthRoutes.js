import {Router} from "express";
import { getUserInfo, login, signup , updateProfile , updateProfileImage , deleteProfileImage, Logout} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";


const authRoutes = Router();
const upload = multer({dest : "upload/profiles/"});


authRoutes.post("/signup" , signup);
authRoutes.post("/login" , login);
authRoutes.get("/userInfo" ,verifyToken, getUserInfo);
authRoutes.post("/updateProfile" , verifyToken , updateProfile)
authRoutes.post("/updateProfileImage" , verifyToken , upload.single('profile-image') , updateProfileImage)
authRoutes.delete("/deleteProfileImage" , verifyToken , deleteProfileImage )
authRoutes.post("/logout" , verifyToken , Logout)

export default authRoutes;
