import { useAppStore } from "@/store"
import { useEffect, useState , useRef} from "react";
import { useNavigate } from "react-router";
import { IoArrowBack } from "react-icons/io5";
import {FaPlus , FaTrash} from "react-icons/fa";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { colors, getColor } from "@/lib/utils";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { UPDATE_PROFILE_ROUTE , UPDATE_PROFILE_IMAGE_ROUTE, DELETE_PROFILE_IMAGE_ROUTE} from "@/utils/constants";
import { HOST } from "@/utils/constants";

function Profile() {
    const navigate = useNavigate(); 
    const {userInfo , setUserInfo} = useAppStore()
    const [firstName , setFirstName] = useState("");
    const [lastName , setLastName] = useState("");
    const [image , setImage] = useState(null);
    const [color , setColor] = useState(0);
    const [hovered, setHovered] = useState(false);
    const fileInputRef = useRef(null);


    useEffect(()=>{
        if(userInfo.profileSetup){
            setColor(userInfo.colorTheme);
            setFirstName(userInfo.firstName);
            setLastName(userInfo.lastName);
        }

        if(userInfo.imageURL){
            setImage(`${HOST}/${userInfo.imageURL}`);
        }
    },[userInfo])

    const validateProfile = ()=>{
        if(!firstName){
            toast.error("FirstName is Required")
            return false;
        }
        if(!lastName){
            toast.error("LastName is Required")
            return false
        }
        return true;
    }
    const saveChanges = async ()=>{
        if(validateProfile()){
            try{
                const response = await apiClient.post(UPDATE_PROFILE_ROUTE , 
                    {firstName , lastName , color},
                    {withCredentials:true}
                );
                if(response.status === 200 && response.data){
                    setUserInfo({...response.data.user});
                    toast.success("Profile Updated successfully");
                    navigate("/chat");
                }
            }catch(error){
                console.log(error);
            }
        }
    }
    
    const handleNavigation = ()=>{
        if(userInfo.profileSetup){
            navigate("/chat");
        }else{
            toast.error("Please Complete your Profile Setup first")
        }
    }

    const handleFileInputClick = ()=>{
        fileInputRef.current.click();
    }

    const handleImageUpload = async (event)=>{
        const file = event.target.files[0]; // event.target refers to the DOM element triggering the event
        if(file){ 

            const formData = new FormData(); // A Js Object for Storing Key-Value Pairs in Forms
            formData.append("profile-image" , file);
            const response = await apiClient.post(UPDATE_PROFILE_IMAGE_ROUTE,formData,{withCredentials:true});

            if(response.status === 201 && response.data.imageURL){
                toast.success("Profile Image Updated")
                setUserInfo({...userInfo , imageURL : response.data.imageURL});
            }else{
                toast.error("Please Try again");
            }
        }
    }

    const handleImageDelete = async ()=>{

        const response = await apiClient.delete(DELETE_PROFILE_IMAGE_ROUTE, {withCredentials:true });

        if(response.status === 201){
            toast.success("Profile Image Removed");
            setUserInfo({...userInfo , imageURL : ""});
            setImage(null);
        }else{
            toast.error("Image could not be deleted right now");
        }
    }
    
  return (
    <div className = "flex flex-col gap-10 justify-center items-center h-[100vh]  bg-[#1b1c24] ">
        <div className="flex flex-col gap-10 w-[80vw] md:w-max">
            <div className = "flex justify-start items-center w-full h-[5vh]">
                <IoArrowBack className = "text-white/90 cursor-pointer text-4xl" onClick = {handleNavigation} />
            </div>
            <div className = "grid grid-cols-2 ">
                <div className = "relative h-full w-32 md:w-48 md:h-48 flex items-center justify-center"
                      onMouseEnter={()=> setHovered(true)}
                      onMouseLeave={()=> setHovered(false)}>
                        <Avatar className = "h-32 md:h-48 w-full rounded-full overflow-hidden">
                            {image ? (<AvatarImage 
                                    src={image} 
                                    alt="profile picture" 
                                    className = "object-cover w-full h-full bg-black "/>)
                                : (<div className={` ${getColor(color)} 
                                                        uppercase h-32 w-32 md:h-48 md:w-48 text-5xl 
                                                        border-[4px] flex items-center justify-center rounded-full`}> 
                                    {firstName ? firstName.split("").shift() 
                                            : userInfo.email.split("").shift()}
                                    </div>)}    
                        </Avatar>
                     {hovered && (
                        <div className=" absolute inset-0 flex items-center justify-center
                         bg-black/50 rounded-full cursor-pointer h-32 md:h-48 " onClick = {image ? handleImageDelete : handleFileInputClick}>
                        {
                            image 
                                ? <FaTrash className="text-white text-3xl"/> 
                                : <FaPlus className="text-white text-3xl"/>
                        }
                        </div>
                     )}
                      <input type = "file" className="hidden" ref={fileInputRef} onChange = {handleImageUpload} name = "profile-image" accept = ".png , .jpeg , .jpg , .svg , .webp" /> 
                </div>
                <div className = "flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center">
                    <div className="w-full">
                        <Input 
                            type = "email" 
                            disabled 
                            placeholder = "Email" 
                            value = {userInfo.email} 
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none ">
                        </Input>
                    </div>
                    <div className="w-full">
                        <Input 
                            type = "text" 
                            placeholder = "First Name" 
                            value = {firstName} 
                            onChange = {(e)=> setFirstName(e.target.value)}
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none ">
                        </Input>
                    </div>
                    <div className="w-full">
                        <Input 
                            type = "text" 
                            placeholder = "Last Name" 
                            value = {lastName} 
                            onChange = {((e) => setLastName(e.target.value))}
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none ">
                        </Input>
                    </div>
                    <div className="w-full flex gap-5">
                        {
                            colors.map((clr , index) => (
                                <div className={`${clr} h-8 w-8 rounded-full 
                                     cursor-pointer transition-all duration-100
                                    ${color === index 
                                        ? "outlilne outline-white outline-3 "
                                        : ""}`}
                                     key = {index}
                                     onClick = {()=> setColor(index)}
                                 ></div>
                            ))
                        }
                    </div>    
                </div>
            </div>
            <div className=" w-full">
                <Button className= "w-full h-16 bg-purple-700 hover:bg-purple-900 transition-all duration-100"
                onClick = {saveChanges}>Save Changes</Button>
            </div>
        </div>
    </div>
   
  )
}
export default Profile