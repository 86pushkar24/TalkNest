import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { useContext , useEffect , useState , createContext, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = new createContext(null);

export const useSocket = ()=>{
    return useContext(SocketContext)
}

export const SocketProvider = ({children}) =>{
    const socket = useRef();
    const {userInfo} = useAppStore();
   

    useEffect(()=>{
        if(userInfo){
            socket.current = io(HOST,{
                withCredentials : true,
                query : {
                    userId : userInfo._id,
                }
            })
            socket.current.on("connect" , ()=>{
                console.log("connected to Socket Server")
            });

            const handleRecieveMessage = (message)=>{
                const {selectedChatType , selectedChatData , addMessage , addContactsInDMContacts } = useAppStore.getState();
                if(selectedChatType !== undefined && 
                    (selectedChatData._id === message.sender._id ||
                    selectedChatData._id === message.receiver._id) 
                ){
                    addMessage(message);
                }
                addContactsInDMContacts(message);
            }

            const handleRecieveChannelMessage = (message)=>{
                const {selectedChatData , selectedChatType , addMessage , addChannelInChannelList } = useAppStore.getState();
                if(selectedChatType !== undefined && 
                    (selectedChatData._id === message.channelId)
                ){
                    addMessage(message);
                }
                addChannelInChannelList(message);
                
            }

            socket.current.on("recieveMessage" , handleRecieveMessage);
            socket.current.on("recieveChannelMessage" , handleRecieveChannelMessage)
            
            return ()=>{
                socket.current.disconnect();  
            }
        } 
    },[userInfo]);
    
    return (
        <SocketContext.Provider value = {socket.current}>
            {children}
        </SocketContext.Provider>
    )

} 