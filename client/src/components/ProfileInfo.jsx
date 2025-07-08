import { apiClient } from "@/lib/api-client";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store"
import { HOST, LOGOUT_ROUTE } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import {FiEdit2} from "react-icons/fi"
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router";
import { toast } from "sonner";

function ProfileInfo() {
  const {userInfo , setUserInfo , closeChat} = useAppStore();
  const navigate = useNavigate();

  const handleLogOut = async ()=>{
     try{
        const response = await apiClient.post(LOGOUT_ROUTE ,{}, {withCredentials : true});
        if(response.status === 200){
            setUserInfo(null);
            closeChat();
            navigate("/auth");
            toast.success("You have been logged out Successfully");
        }
     }catch(e){
        console.log(e);
     }
  }
  return (
    <div className="absolute bottom-0 flex justify-between 
    items-center w-full px-10 h-16 bg-[#2a2b33] ">
        <div className="flex justify-center items-center gap-3">
            <div className="h-12 w-12 relative rounded-full overflow-hidden ">
                <Avatar>
                    {userInfo.imageURL ? (<AvatarImage 
                            src={`${HOST}/${userInfo.imageURL}`} 
                            alt="profile picture" 
                            className = "object-cover w-full h-full bg-black "/>)
                        : (<div className={` ${getColor(userInfo.colorTheme)} 
                                uppercase h-12 w-12 text-2xl font-bold
                                border-[3px] flex items-center justify-center rounded-full`}> 
                            {userInfo.firstName ? userInfo.firstName.split("").shift() 
                                                : userInfo.email.split("").shift()}
                        </div>)}    
                </Avatar>
            </div>
            <div>
                {
                    userInfo.firstName && userInfo.lastName 
                    ? `${userInfo.firstName} ${userInfo.lastName}`
                    : `${userInfo.email}`
                }
            </div>
        </div>
        <div className="flex gap-5">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FiEdit2 className="text-xl font-medium text-purple-500"
                        onClick = {() => navigate('/profile')}/>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none text-white p-2 rounded-b-sm">
                        Edit Profile
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <IoPowerSharp className="text-xl font-medium text-red-500"
                        onClick = {handleLogOut}/>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none text-white p-2 rounded-b-sm">
                        LogOut
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>    
    </div>
  )
}
export default ProfileInfo