import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react"
import {GrAttachment} from "react-icons/gr"
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { useAppStore } from "@/store"; 
import { useSocket } from "../../context/SocketContext.jsx"
import { apiClient } from "@/lib/api-client.js";
import { UPLOAD_FILE_ROUTE } from "@/utils/constants.js";
import { toast } from "sonner";


function MessageBar() {
    const {userInfo , selectedChatData , selectedChatType} = useAppStore();
    const socket = useSocket();
    const emojiRef = useRef();
    const fileInputRef = useRef();
    const [message , setMessage] = useState("");
    const [emojiPickerOpen , setEmojiPickerOpen] = useState(false);

    useEffect(()=>{

        function handleClickOutside(event){
            if(emojiRef.current && !emojiRef.current.contains(event.target)){
                setEmojiPickerOpen(false);
            }
        }

        document.addEventListener("mousedown" , handleClickOutside);

        return ()=>{
            document.removeEventListener("mousedown" , handleClickOutside)
        }
    },[emojiRef])

    useEffect(()=>{

        const handleKeyDown = (event) =>{
            if(event.key === "Enter"){
                handleSendMessage();
            }
        }
        window.addEventListener("keydown" , handleKeyDown);

        return ()=>{
            window.removeEventListener("keydown" , handleKeyDown);
        }
    })

    const handleAddEmoji = (emoji)=>{
        setMessage((msg)=> msg+ emoji.emoji)
    };

    const handleSendMessage = ()=>{

        if(!message.trim()) return 

        if(selectedChatType === "contact"){
            socket.emit("sendMessage" , {
                sender : userInfo._id,
                receiver : selectedChatData._id,
                content : message,
                messageType : "text",
                fileUrl : undefined
            })
        }else if(selectedChatType === "channel"){
            socket.emit("sendMessageOnChannel" , {
                sender : userInfo._id,
                channel: selectedChatData._id,
                content : message,     
                messageType : "text",
                fileUrl : undefined
            })
        }

        setMessage("");
        
    };

    const handleAttachmentClick = () =>{
        if(fileInputRef.current){
            fileInputRef.current.click();
        }
    }

    const handleAttachmentChange = async (event) =>{
        try{
            const file = event.target.files[0];
            if(file){
                const formData = new FormData();
                formData.append("file" , file);
                
                const response = await apiClient.post(UPLOAD_FILE_ROUTE , formData , {withCredentials : true})
                if(response.status === 200 && response.data){
                    if(selectedChatType === "contact"){
                        socket.emit("sendMessage" , {
                            sender : userInfo._id,
                            receiver : selectedChatData._id,
                            content : undefined,
                            messageType : "file",
                            fileUrl : response.data.filePath
                        })
                    }else if(selectedChatType === "channel"){
                        socket.emit("sendMessageOnChannel" , {
                            sender : userInfo._id,
                            channel : selectedChatData._id,
                            content : undefined,
                            messageType : "file",
                            fileUrl : response.data.filePath
                        })
                    }                  
                }
            }
        }catch(error){
            toast.error("File Upload failed.Try Again.")
        }
    }


  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center 
        items-center px-8 mb-6 gap-6 z-100">
        <div className="flex flex-1 bg-[#2a2b33] rounded-md items-center gap-5 pr-5 ">
            <input type = "text" 
            className="flex-1 p-5 bg-transparent rounded-md 
            focus:border-none focus:outline-none " 
            placeholder="Enter Message"
            value = {message} 
            onChange={(e)=>{ setMessage(e.target.value)}}
            />
            <button className="text-neutral-500 focus:border-none focus:outline-none
                 focus:text-white duration-300 transition-all " onClick={handleAttachmentClick}>
                <GrAttachment className="text-2xl"/>
            </button>
            <input type = "file" className="hidden" ref = {fileInputRef} onChange = {handleAttachmentChange}></input>
            <div className="relative">
            <button className="text-neutral-500 focus:border-none focus:outline-none
                 focus:text-white duration-300 transition-all" 
                 onClick = {()=> setEmojiPickerOpen(true)}>
                <RiEmojiStickerLine className="text-2xl"/>
            </button>
            <div className="absolute bottom-16 right-0 " ref = {emojiRef}>
                <EmojiPicker 
                    theme = "dark"
                    open = {emojiPickerOpen}
                    onEmojiClick={handleAddEmoji}
                    autoFocusSearch = {false}
                />
            </div>
            </div>
        </div>
        <button className="bg-[#8417ff] rounded-md flex justify-center items-center 
                focus:border-none focus:outline-none focus:text-white duration-300 
                transition-all p-5 hover:bg-[#741bda] focus:bg-[#741bda]"
                onClick={handleSendMessage}
        >
                <IoSend className="text-2xl"/>
        </button>
    </div>
  )
}
export default MessageBar