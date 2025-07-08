import { useAppStore } from "@/store"
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import ContactsContainer from "./ContactsContainer.jsx";
import EmptyChatContainer from "./EmptyChatContainer.jsx";
import ChatContainer from "./ChatContainer.jsx";

function Chat() {
  const {userInfo , selectedChatType} = useAppStore();
  const navigate = useNavigate();

  useEffect(()=>{
    if(!userInfo.profileSetup){
        toast("Please setup your Profile Page");
        navigate("/profile");
    }
  },[navigate , userInfo]);

  return (
    <div className="flex h-[100vh] overflow-hidden text-white ">
        <ContactsContainer/>
        {
            selectedChatType === undefined 
                ? <EmptyChatContainer/> 
                : <ChatContainer/>
        } 
    </div>
  )
}
export default Chat