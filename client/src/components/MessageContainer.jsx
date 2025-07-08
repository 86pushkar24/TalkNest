import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import { apiClient } from "@/lib/api-client";
import { GET_CHANNEL_MESSAGES, GET_MESSAGES_ROUTE, HOST } from "@/utils/constants";
import {MdFolderZip} from "react-icons/md"
import {IoMdArrowRoundDown} from "react-icons/io"
import { IoCloseSharp } from "react-icons/io5";
import { getColor, getFontColor } from "@/lib/utils";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

function MessageContainer() {

    const {selectedChatMessages ,
        selectedChatData ,
        selectedChatType ,
        userInfo ,
        setSelectedChatMessages
     } = useAppStore();

     const [imageURL, setImageURL] = useState(null);
     const [showImage, setShowImage] = useState(false)

     const checkIfImage = (filePath) =>{
        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
        return imageRegex.test(filePath);
     }

     useEffect(()=>{

        const getAllMessages = async () =>{
            try{
                const response = await apiClient.post(GET_MESSAGES_ROUTE ,
                     {id : selectedChatData._id} ,
                     {withCredentials : true}
                );
                if(response.data.messages){ 
                    setSelectedChatMessages(response.data.messages);
                }
            }catch(error){
                console.log({error});
            }
            
        }

        const getAllChannelMessages = async () =>{
            try{
                const response = await apiClient.get(`${GET_CHANNEL_MESSAGES}/${selectedChatData._id}` , {withCredentials : true});
                if(response.data.messages){
                    setSelectedChatMessages(response.data.messages);
                }
            }catch(error){
                console.log({error});
            }
        }
        if(selectedChatData._id){
            if(selectedChatType === "contact"){
                getAllMessages();
            }else if(selectedChatType === "channel"){
                getAllChannelMessages();
            }
        }
     },[selectedChatData, selectedChatType])

    const containerRef = useRef();
    useEffect(()=>{
        const container = containerRef.current;
        if(container){
            container.scrollTop = container.scrollHeight;
        }
    },[selectedChatMessages])
    
    
    const downloadFile = async (url)=>{
        const response = await apiClient.get(`${HOST}/${url}` , {
            responseType : "blob",
        });
        
        const blob = new Blob([response.data]);
        const blobURL = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobURL;
        link.download = url.split("/").pop();
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobURL);

    }
    
  
    const renderMessages = ()=>{
        let lastDate = null;

        return selectedChatMessages.map((message , index)=>{
            const messageDate = moment(message.timeStamp).format("YYYY-MM-DD");
            const showDate = messageDate !== lastDate; 
            lastDate = messageDate;
            return (
                <div key = {index}>
                    {   showDate && (
                            <div className="text-center text-gray-500 my-2">
                                {moment(message.timeStamp).format("LL")}
                            </div>
                        )
                    }{
                        selectedChatType === "contact" && renderDMMessages(message)
                    }
                    {
                        selectedChatType === 'channel' && renderChannelMessages(message)
                    }
                </div>
            )
        });

    }

    const renderSenderImage = (message) => {
            return (
                <div className="h-8 w-8 relative rounded-full overflow-hidden ">
                    <Avatar>
                        {message.sender.imageURL ? (<AvatarImage 
                                src={`${HOST}/${message.sender.imageURL}`} 
                                alt={`profile picture of ${message.sender.firstName} ${message.sender.lastName}`} 
                                className = "object-cover w-full h-full bg-black "/>)
                            : (<div className={` ${getColor(message.sender.colorTheme)} 
                                    uppercase h-8 w-8 text-2xl font-bold
                                    border-[3px] flex items-center justify-center rounded-full`}> 
                                {message.sender.firstName 
                                    ? message.sender.firstName.split("").shift() 
                                    : message.sender.email.split("").shift()}
                            </div>)}    
                    </Avatar>
                </div>                    
            )
        }       

    
    const renderChannelMessages = (message) =>{
       
        return (
            <div className = {`flex gap-2 ${userInfo._id === message.sender._id ? "justify-end" : "justify-start"}`}>
                    {   userInfo._id !== message.sender._id && (
                            renderSenderImage(message)
                    )}
                    {message.messageType === "text" && (
                        <div className={`${message.sender._id === userInfo._id 
                            ? "bg-[#8417ff]/5 text-[#8417ff]/80 border-[#8417ff]"
                            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]"
                        } border inline-block px-4 py-2 max-w-[50%] rounded break-words my-1`}>
                            <div >
                            {   userInfo._id != message.sender._id && (
                                <div className={`${getFontColor(message.sender.colorTheme)}`}>
                                    {userInfo.firstName}
                                    {userInfo.lastName}
                                </div> 
                            )}    
                            {message.content}
                            </div>
                            <div className="text-xs text-gray-600 flex justify-end">
                                {moment(message.timeStamp).format("LT")}
                            </div>
                        </div>        
                    )}
                    {
                        message.messageType === "file" &&(
                            <div 
                                className={`${message.sender._id === userInfo._id 
                                    ? "bg-[#8417ff]/5 text-[#8417ff]/80 border-[#8417ff]"
                                    : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]"
                                } border inline-block px-4 py-2 max-w-[50%] rounded break-words my-1`}>
                                <div>
                                {   
                                    userInfo._id !== message.sender._id && (
                                        <div className={`${getFontColor(message.sender.colorTheme)} mb-2`}>
                                            {userInfo.firstName}
                                            {userInfo.lastName}
                                        </div>
                                    )
                                }
                                {checkIfImage(message.fileUrl)
                                    ? <div className="cursor-pointer"
                                        onClick={()=>{
                                            setShowImage(true);
                                            setImageURL(message.fileUrl)
                                        }}>
                                        <img 
                                            src = {`${HOST}/${message.fileUrl}`}
                                            height = {300}
                                            width = {300}
                                        ></img>
                                    </div>
                                    : <div className = "flex justify-center items-center gap-4">
                                        <span className = "text-white/8- text-3xl bg-black/20 rounded-full p-3">
                                            <MdFolderZip/>
                                        </span>
                                        <span>{message.fileUrl.split("/").pop()}</span>
                                        <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50
                                        cursor-pointer transition-all duration-300"
                                        onClick = {() => downloadFile(message.fileUrl)}>
                                            <IoMdArrowRoundDown/>
                                        </span>
                                    </div>
                                }
                            </div>
                            <div className="text-xs text-gray-600 flex justify-end mt-1">
                            {moment(message.timeStamp).format("LT")}
                            </div>
                        </div>        
                        )}
            </div>      
        ) 
    }

    

    const renderDMMessages = (message)=> {      
        return (
            <div className = {`${selectedChatData._id === message.sender ? "text-left" : "text-right"}`}>
                {message.messageType === "text" && (
                    <div 
                    className={`${message.sender !== selectedChatData._id 
                        ? "bg-[#8417ff]/5 text-[#8417ff]/80 border-[#8417ff]"
                        : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]"
                    } border inline-block p-4 max-w-[50%] rounded break-words my-1`}>
                    {message.content}
                    </div>        
                )}
                {
                    message.messageType === "file" &&(
                        <div 
                    className={`${message.sender !== selectedChatData._id 
                        ? "bg-[#8417ff]/5 text-[#8417ff]/80 border-[#8417ff]"
                        : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]"
                    } border inline-block p-4 max-w-[50%] rounded break-words my-1`}>
                        {checkIfImage(message.fileUrl)
                         ? <div className="cursor-pointer"
                            onClick={()=>{
                                setShowImage(true);
                                setImageURL(message.fileUrl)
                            }}>
                            <img 
                                src = {`${HOST}/${message.fileUrl}`}
                                height = {300}
                                width = {300}
                            ></img>
                         </div>
                         : <div className = "flex justify-center items-center gap-4">
                            <span className = "text-white/8- text-3xl bg-black/20 rounded-full p-3">
                                <MdFolderZip/>
                            </span>
                            <span>{message.fileUrl.split("/").pop()}</span>
                            <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50
                             cursor-pointer transition-all duration-300"
                             onClick = {() => downloadFile(message.fileUrl)}>
                                <IoMdArrowRoundDown/>
                            </span>
                         </div>
                        }
                    </div>
                    )
                }
                <div className="text-xs text-gray-600">
                    {moment(message.timeStamp).format("LT")}
                </div>          
            </div>
        )
    }

    
    
   


  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 
            px-8 md:w-[65w] lg:w-[70w] xl:w-[80vw] w-full" ref = {containerRef}>
           {renderMessages()}
           {
                showImage && <div className="top-0 left-0 h-[100vh] w-[100vw] z-[100] fixed flex 
                    items-center justify-center backdrop-blur-lg flex-col">
                    <div>
                        <img src = {`${HOST}/${imageURL}`}
                         className="h-[80vh] w-full bg-cover"/>
                    </div>
                    <div className="flex gap-5 fixed top-0 mt-5">
                        <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 
                        cursor-pointer transition-all duration-300" onClick={()=>downloadFile(imageURL)}>
                            <IoMdArrowRoundDown/>
                        </button>
                        <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 
                        cursor-pointer transition-all duration-300" 
                            onClick={()=>{
                                setImageURL(null);
                                setShowImage(false);
                        }}>
                            <IoCloseSharp/>
                        </button>
                    </div>
                 </div>
           }
    </div>
  )
}
export default MessageContainer