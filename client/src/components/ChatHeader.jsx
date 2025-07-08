import { getColor } from "@/lib/utils"
import { useAppStore } from "@/store"
import { HOST } from "@/utils/constants"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import {RiCloseFill} from "react-icons/ri"

function ChatHeader() {
    const {closeChat , selectedChatType , selectedChatData} = useAppStore()
  return (
    <div className="flex justify-between items-center border-b-2 border-[#2f303b] h-[10vh] px-5">
        <div className="flex gap-5 items-center justify-between w-full">
            <div className="flex gap-3 items-center justify-center">
                <div className="h-12 w-12 relative rounded-full overflow-hidden ">
                    { selectedChatType === "contact" ? (
                        <Avatar>
                        {selectedChatData.imageURL ? (<AvatarImage 
                                src={`${HOST}/${selectedChatData.imageURL}`} 
                                alt="profile picture"  
                                className = "object-cover w-full h-full bg-black "/>)
                            : (<div className={` ${getColor(selectedChatData.colorTheme)} 
                                    uppercase h-12 w-12 text-2xl font-bold
                                    border-[3px] flex items-center justify-center rounded-full`}> 
                                {selectedChatData.firstName ? selectedChatData.firstName.split("").shift() 
                                                    : selectedChatData.email.split("").shift()}
                            </div>)}    
                    </Avatar>
                    ) : (
                        <div className = "h-10 w-10 flex items-center justify-center bg-[#ffffff22] rounded-full" >
                            #
                        </div>
                    )}        
                </div>
                <div>
                    {selectedChatType === "channel" && selectedChatData.name} 
                    {
                        selectedChatType === "contact" && selectedChatData.firstName
                        ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                        : selectedChatData.email
                    }
                </div>
            </div>
            <div className="flex gap-5 items-center justify-center ">
                <button className="text-neutral-500 focus:border-none focus:outline-none
                 focus:text-white duration-300 transition-all "
                 onClick = {closeChat}>
                    <RiCloseFill className = "text-3xl" />
                </button>
            </div>
        </div>
    </div>
  )
}
export default ChatHeader