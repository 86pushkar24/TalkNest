// =====================================
// SOCKET CONTEXT - REAL-TIME COMMUNICATION MANAGER
// =====================================
// This file manages the WebSocket connection for real-time messaging in Talkhere.
// It provides a React context that wraps the entire app, establishing a persistent
// socket connection when a user is authenticated and handling incoming messages.
//
// Key Responsibilities:
// 1. Establish socket.io connection to the backend server
// 2. Authenticate the connection using user credentials
// 3. Listen for incoming direct messages and channel messages
// 4. Update Redux store when messages arrive
// 5. Manage connection lifecycle (connect/disconnect)

import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { useContext , useEffect , createContext, useRef } from "react";
import { io } from "socket.io-client";

// Create React Context for socket instance
// This allows any component in the app to access the socket connection
const SocketContext = new createContext(null);

/**
 * Custom hook to access the socket instance from any component
 * @returns {Socket} The socket.io client instance
 * 
 * Usage: const socket = useSocket();
 * This provides components with direct access to emit events or listen for custom events
 */
export const useSocket = ()=>{
    return useContext(SocketContext)
}

/**
 * Socket Provider Component - Manages WebSocket Connection Lifecycle
 * 
 * This component establishes and manages the socket.io connection for real-time messaging.
 * It only creates a connection when a user is authenticated (userInfo exists).
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that need socket access
 * 
 * Design Decision: Why useRef for socket?
 * - Prevents re-creation of socket on every render
 * - Maintains persistent connection across component re-renders
 * - Avoids memory leaks from multiple socket instances
 */
export const SocketProvider = ({children}) =>{
    // useRef ensures socket instance persists across re-renders
    // This is crucial for maintaining a stable WebSocket connection
    const socket = useRef();
    
    // Get user authentication info from Redux store
    // userInfo contains user ID needed for socket authentication
    const {userInfo} = useAppStore();
   
    /**
     * Effect Hook - Socket Connection Management
     * 
     * This effect handles the complete socket lifecycle:
     * 1. Connection establishment when user logs in
     * 2. Event listener setup for incoming messages
     * 3. Cleanup when user logs out or component unmounts
     */
    useEffect(()=>{
        // Only establish socket connection if user is authenticated
        // This prevents unauthorized socket connections
        if(userInfo){
            // =====================================
            // SOCKET CONNECTION ESTABLISHMENT
            // =====================================
            
            // Create socket.io connection to backend server
            socket.current = io(HOST,{
                // Include cookies for session-based authentication
                // This allows server to verify user identity
                withCredentials : true,
                
                // Send user ID as query parameter for immediate identification
                // Server can use this to join user-specific rooms or channels
                query : {
                    userId : userInfo._id,
                }
            })
            
            // Connection success handler
            // Confirms socket is connected and ready to send/receive messages
            socket.current.on("connect" , ()=>{
                console.log("connected to Socket Server")
            });

            // =====================================
            // DIRECT MESSAGE HANDLER
            // =====================================
            
            /**
             * Handles incoming direct messages (1-on-1 chat)
             * 
             * Message Flow:
             * 1. Server emits "recieveMessage" event when user receives a DM
             * 2. Check if the message is for the currently active chat
             * 3. If yes, add to current chat messages for real-time display
             * 4. Update contacts list to show recent conversation
             * 
             * @param {Object} message - Message object from server
             * @param {Object} message.sender - User who sent the message
             * @param {Object} message.receiver - User who receives the message
             * @param {string} message.content - Message text content
             * @param {Date} message.timestamp - When message was sent
             */
            const handleRecieveMessage = (message)=>{
                // Get current chat state from Redux store
                // We use getState() instead of useSelector to avoid stale closure issues
                const {selectedChatType , selectedChatData , addMessage , addContactsInDMContacts } = useAppStore.getState();
                
                // Check if this message belongs to the currently open chat
                // This prevents messages from other chats appearing in wrong conversation
                if(selectedChatType !== undefined && 
                    (selectedChatData._id === message.sender._id ||
                    selectedChatData._id === message.receiver._id) 
                ){
                    // Add message to current chat for immediate display
                    // This provides real-time messaging experience
                    addMessage(message);
                }
                
                // Update contacts list to show this conversation as recent
                // This ensures the contact appears at top of DM list
                addContactsInDMContacts(message);
            }

            // =====================================
            // CHANNEL MESSAGE HANDLER
            // =====================================
            
            /**
             * Handles incoming channel/group messages
             * 
             * Channel Message Flow:
             * 1. Server emits "recieveChannelMessage" when user's channel gets new message
             * 2. Check if message is for currently active channel
             * 3. If yes, display message immediately in channel chat
             * 4. Update channels list to show recent activity
             * 
             * @param {Object} message - Channel message object from server
             * @param {string} message.channelId - ID of the channel this message belongs to
             * @param {Object} message.sender - User who sent the message
             * @param {string} message.content - Message text content
             * @param {Date} message.timestamp - When message was sent
             */
            const handleRecieveChannelMessage = (message)=>{
                // Get current state to check if this channel is currently active
                const {selectedChatData , selectedChatType , addMessage , addChannelInChannelList } = useAppStore.getState();
                
                // Only add to current view if this channel is currently selected
                // Prevents messages from other channels appearing in wrong chat
                if(selectedChatType !== undefined && 
                    (selectedChatData._id === message.channelId)
                ){
                    // Display message immediately in current channel
                    addMessage(message);
                }
                
                // Update channels list to reflect recent activity
                // This shows unread indicators and moves active channels to top
                addChannelInChannelList(message);
                
            }

            // =====================================
            // EVENT LISTENER REGISTRATION
            // =====================================
            
            // Register event listeners for real-time message handling
            // These listeners remain active for the duration of the socket connection
            socket.current.on("recieveMessage" , handleRecieveMessage);
            socket.current.on("recieveChannelMessage" , handleRecieveChannelMessage)
            
            // =====================================
            // CLEANUP FUNCTION
            // =====================================
            
            // Return cleanup function to prevent memory leaks
            // This runs when component unmounts or userInfo changes
            return ()=>{
                socket.current.disconnect();  
            }
        } 
        // Re-run effect when userInfo changes (login/logout)
    },[userInfo]);
    
    // Provide socket instance to all child components
    // Any component can now access socket using useSocket() hook
    return (
        <SocketContext.Provider value = {socket.current}>
            {children}
        </SocketContext.Provider>
    )

}

// =====================================
// DESIGN THINKING QUESTIONS FOR EXTENSION
// =====================================

/*
🤔 SCALABILITY CONSIDERATIONS:
1. How would this socket connection handle 10,000+ concurrent users?
   - Consider connection pooling, load balancing across multiple socket servers
   - Implement Redis adapter for horizontal scaling across server instances
   - Add connection limits and rate limiting

2. What happens if the socket connection drops unexpectedly?
   - Should we implement automatic reconnection with exponential backoff?
   - How do we handle message queuing during disconnection?
   - Should we show connection status to users?

🔒 SECURITY CONSIDERATIONS:
3. Is the socket authentication secure enough?
   - Currently using query params for userId - is this safe?
   - Should we implement JWT tokens for socket authentication?
   - How do we prevent socket session hijacking?

4. Message validation and sanitization:
   - Are incoming messages validated before adding to store?
   - How do we prevent XSS attacks through message content?
   - Should we implement message encryption for sensitive conversations?

⚡ PERFORMANCE OPTIMIZATIONS:
5. Event listener efficiency:
   - Should we debounce rapid incoming messages?
   - Is using getState() in event handlers optimal?
   - Could we implement message batching for high-frequency updates?

6. Memory management:
   - Do we need to limit the number of cached messages per chat?
   - Should old messages be removed from Redux store?
   - How do we handle memory leaks in long-running connections?

🚀 FEATURE EXTENSIONS:
7. Real-time features to consider:
   - Typing indicators: How would we track who's typing in each chat?
   - Message reactions: How would we sync emoji reactions across users?
   - Online/offline status: How would we track and display user presence?
   - Voice/video calls: How would we handle WebRTC signaling?

8. Notification system:
   - How would we implement push notifications for offline users?
   - Should we add sound notifications for new messages?
   - How would we handle notification permissions and preferences?

📱 MOBILE & OFFLINE SUPPORT:
9. How would this work on mobile devices?
   - Socket connections on mobile networks (connection drops, background states)
   - Should we implement offline message queuing?
   - How do we handle app backgrounding/foregrounding?

🔧 DEBUGGING & MONITORING:
10. Production debugging:
    - How would we debug socket connection issues in production?
    - Should we add socket event logging and analytics?
    - How do we monitor socket server health and performance?
*/ 