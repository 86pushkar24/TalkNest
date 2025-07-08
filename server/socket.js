// =====================================
// SOCKET.IO SERVER - REAL-TIME MESSAGING BACKEND
// =====================================
// This file sets up the WebSocket server that enables real-time communication
// in the Talkhere chat application. It handles socket connections, message routing,
// and maintains user session mapping for instant message delivery.
//
// Key Responsibilities:
// 1. Initialize Socket.IO server with CORS configuration
// 2. Maintain mapping of user IDs to socket IDs for message routing
// 3. Handle direct message sending between users
// 4. Manage channel/group message broadcasting
// 5. Track user connections and disconnections
// 6. Store all messages persistently in MongoDB

import {Server as socketIoServer} from "socket.io"
import {Message} from "./models/messages.model.js";
import Channel from "./models/channel.model.js"

/**
 * Initialize and configure Socket.IO server for real-time messaging
 * 
 * This function sets up the WebSocket server that communicates with the frontend
 * SocketContext. It handles the complete message lifecycle from client emission
 * to database storage and real-time delivery to recipients.
 * 
 * @param {Object} server - Express HTTP server instance to attach Socket.IO to
 * 
 * Design Decision: Why attach to existing HTTP server?
 * - Shares the same port as REST API (no need for separate socket port)
 * - Simplifies deployment and networking configuration
 * - Allows sharing of middleware and authentication context
 */
const setupSocket = (server) => {

    // =====================================
    // SOCKET.IO SERVER INITIALIZATION
    // =====================================
    
    // Create Socket.IO server instance with CORS configuration
    const io = new socketIoServer(server , {
        cors:{
            // Allow connections from frontend origin (React dev server or production URL)
            origin: process.env.ORIGIN,
            
            // Restrict to specific HTTP methods for security
            methods : ["GET" , "POST"],
            
            // Enable credentials for cookie-based authentication
            // This allows session cookies to be sent with socket requests
            credentials:true,
        },
    });

    // =====================================
    // USER SESSION MAPPING
    // =====================================
    
    // Map to store user ID -> socket ID relationships
    // This is crucial for routing messages to specific users
    // Key: userId (string), Value: socketId (string)
    //
    // Why Map instead of Object?
    // - Better performance for frequent lookups
    // - Cleaner iteration methods
    // - Prevents prototype pollution issues
    const userSocketMap = new Map();

    // =====================================
    // DISCONNECTION HANDLER
    // =====================================
    
    /**
     * Handle user disconnection and cleanup
     * 
     * When a user closes their browser, loses internet, or logs out,
     * we need to remove their socket mapping to prevent message delivery
     * to non-existent connections.
     * 
     * @param {Socket} socket - The disconnected socket instance
     * 
     * Process:
     * 1. Search through userSocketMap to find the disconnected user
     * 2. Remove the user-socket mapping
     * 3. Log disconnection for monitoring
     * 
     * Edge Case: What if multiple tabs are open?
     * Currently, each tab creates a separate socket connection.
     * Last tab closing will remove the user from the map.
     */
    const disconnect = (socket) => {
        // Iterate through the map to find which user this socket belongs to
        // We iterate because we have socketId and need to find the userId
        for(const [userId , socketId] of userSocketMap){
            if(socketId == socket.id ){
                // Remove user from active connections
                // This prevents messages being sent to disconnected sockets
                userSocketMap.delete(userId);
                break; // Exit loop once found (each socket maps to one user)
            }
        }
        console.log(`User got disconnected ${socket.id}`);
    }

    // =====================================
    // DIRECT MESSAGE HANDLER
    // =====================================
    
    /**
     * Handle direct message sending between two users
     * 
     * This function manages the complete lifecycle of a direct message:
     * 1. Save message to database for persistence
     * 2. Populate sender/receiver details for rich display
     * 3. Emit message to both sender and receiver sockets for real-time updates
     * 
     * @param {Object} message - Message object from frontend
     * @param {string} message.sender - Sender user ID
     * @param {string} message.receiver - Receiver user ID  
     * @param {string} message.content - Message text content
     * @param {string} message.messageType - Type: 'text', 'file', etc.
     * 
     * Message Flow:
     * Frontend → sendMessage event → this handler → database → real-time emission
     * 
     * Why emit to both sender and receiver?
     * - Sender: Confirms message was sent, updates their chat UI
     * - Receiver: Gets real-time notification and message display
     */
    const sendMessage = async (message) =>{

        try{
            // =====================================
            // SOCKET ID LOOKUP
            // =====================================
            
            // Get socket IDs for both users from our active connections map
            // These will be used to emit the message to specific clients
            const senderSocketId = userSocketMap.get(message.sender);
            const receiverSocketId = userSocketMap.get(message.receiver);

            // =====================================
            // DATABASE PERSISTENCE
            // =====================================
            
            // Save message to MongoDB for permanent storage
            // This ensures messages persist across app restarts and offline periods
            const createdMessage  = await Message.create(message);

            // Populate user details for rich message display
            // This includes profile info like names, avatars, etc.
            // Without populate, we'd only have user IDs
            const messageData = await Message.findById(createdMessage._id)
            .populate("sender" , "firstName lastName colorTheme imageURL email")
            .populate("receiver",  "firstName  lastName  colorTheme imageURL email");

            // =====================================
            // REAL-TIME MESSAGE DELIVERY
            // =====================================
            
            // Send message to receiver if they're currently online
            // io.to(socketId) sends to specific socket connection
            if(receiverSocketId){   
                io.to(receiverSocketId).emit("recieveMessage" , messageData)
            }

            // Send confirmation to sender (shows message in their chat)
            // This provides immediate feedback that message was sent
            if(senderSocketId){
                io.to(senderSocketId).emit("recieveMessage" , messageData);
            }
            
            // Note: If user is offline, message is still saved to database
            // They'll see it when they reconnect and load chat history
            
        }catch(error){
            // Log errors for debugging - in production, consider structured logging
            console.log({error});
            
            // TODO: Consider emitting error back to sender for user feedback
            // io.to(senderSocketId).emit("messageError", { error: "Failed to send message" });
        }       
    }

    // =====================================
    // CHANNEL MESSAGE HANDLER
    // =====================================
    
    /**
     * Handle channel/group message broadcasting
     * 
     * Channel messages are more complex than direct messages because:
     * 1. Must be delivered to multiple recipients (all channel members)
     * 2. Channel message history needs to be updated
     * 3. Both regular members and admins need to receive the message
     * 
     * @param {Object} message - Channel message object from frontend
     * @param {string} message.sender - User ID of message sender
     * @param {string} message.channel - Channel ID where message is sent
     * @param {string} message.content - Message text content
     * @param {string} message.messageType - Type of message
     * 
     * Channel Message Flow:
     * Frontend → sendMessageOnChannel event → save to DB → update channel → broadcast to all members
     */
    const sendMessageOnChannel = async (message) => {
        try{
            // =====================================
            // DATABASE OPERATIONS
            // =====================================
            
            // Save message to database first for persistence
            const createdMessage = await Message.create(message);

            // Populate sender details for rich display
            // Note: We only populate sender here since channel messages don't have a single receiver
            const messageData = await Message.findById(createdMessage._id)
            .populate("sender" , "firstName lastName  colorTheme imageURL email _id")
            .exec();

            // Add this message to the channel's message history
            // This maintains the chronological order of messages in the channel
            await Channel.findByIdAndUpdate(message.channel , {
                $push : {messages : createdMessage._id},
            });

            // =====================================
            // CHANNEL MEMBER RETRIEVAL
            // =====================================
            
            // Get complete channel information including all members and admins
            // We need this to know who should receive the message
            const channel = await Channel.findById(message.channel)
            .populate("members")    // Regular channel members
            .populate("admin");     // Channel administrators

            // Create final message object with channel context
            // We spread the message document and add channelId for frontend routing
            const finalData = {...messageData._doc , channelId : channel._id};
            
            // =====================================
            // BROADCAST TO CHANNEL MEMBERS
            // =====================================

            // Send message to all regular channel members
            if(channel && channel.members){
                channel.members.forEach( (member) => {
                    // Convert ObjectId to string for map lookup
                    const memberSocketId = userSocketMap.get(member._id.toString());
                    
                    // Only send if member is currently online
                    if(memberSocketId){
                        io.to(memberSocketId).emit("recieveChannelMessage" , finalData);
                    }
                    // Offline members will see message when they reconnect and load channel history
                })
            }

            // Send message to all channel administrators
            // Admins get messages even if they're not in the members list
            if(channel && channel.admin){
                channel.admin.forEach( (admin) =>{
                    const adminSocketId = userSocketMap.get(admin._id.toString());
                    
                    if(adminSocketId){
                        io.to(adminSocketId).emit("recieveChannelMessage" , finalData);
                    }
                })
            }

            // =====================================
            // OPTIMIZATION OPPORTUNITIES
            // =====================================
            
            // TODO: Consider these improvements:
            // 1. Batch database operations for better performance
            // 2. Use Redis pub/sub for channel broadcasting in multi-server setup
            // 3. Implement message delivery confirmations
            // 4. Add rate limiting to prevent spam in channels

        }catch(error){
            console.log({error});
            
            // TODO: Implement proper error handling
            // - Log structured errors for monitoring
            // - Emit error back to sender
            // - Consider retry mechanisms for failed operations
        }
    }

    // =====================================
    // SOCKET CONNECTION EVENT HANDLING
    // =====================================
    
    /**
     * Main socket connection handler
     * 
     * This is the entry point for all socket connections. When a user's browser
     * establishes a WebSocket connection, this handler:
     * 1. Extracts user identification from connection
     * 2. Maps user to their socket for message routing
     * 3. Sets up event listeners for message operations
     * 4. Handles disconnection cleanup
     * 
     * Connection Lifecycle:
     * Client connects → extract userId → map to socket → listen for events → handle disconnect
     */
    io.on("connection" , (socket)=>{

        // =====================================
        // USER IDENTIFICATION & MAPPING
        // =====================================
        
        // Extract user ID from connection query parameters
        // This was sent by the frontend SocketContext during connection
        const userId = socket.handshake.query.userId;

        if(userId){
            // Map this user to their socket ID for message routing
            // This allows us to find a user's socket when we need to send them a message
            userSocketMap.set(userId , socket.id);
            console.log(`User with ID ${userId} got connected to Session ID ${socket.id}`);
        }else{
            console.log(`User ID not provided during connnection`)
            // TODO: Consider disconnecting sockets without proper identification
            // socket.disconnect(true);
        }
        
        // =====================================
        // EVENT LISTENER REGISTRATION
        // =====================================
        
        // Listen for direct message sending requests
        // When frontend emits "sendMessage", call our sendMessage handler
        socket.on("sendMessage" , sendMessage);
        
        // Listen for channel message sending requests  
        // When frontend emits "sendMessageOnChannel", call our channel handler
        socket.on("sendMessageOnChannel" , sendMessageOnChannel);
        
        // Handle socket disconnection
        // This is automatically triggered when user closes browser, loses connection, etc.
        socket.on("disconnect",() => disconnect(socket))
        
        // =====================================
        // ADDITIONAL EVENT LISTENERS (Future Extensions)
        // =====================================
        
        // TODO: Add more real-time features:
        // socket.on("typing", handleTypingIndicator);
        // socket.on("stopTyping", handleStopTyping);
        // socket.on("joinRoom", handleJoinRoom);
        // socket.on("leaveRoom", handleLeaveRoom);
        // socket.on("markAsRead", handleMessageRead);
    })
}

export default setupSocket;

// =====================================
// DESIGN THINKING QUESTIONS FOR BACKEND SOCKET ARCHITECTURE
// =====================================

/*
🏗️ ARCHITECTURE & SCALABILITY:
1. How would this handle horizontal scaling across multiple servers?
   - Currently userSocketMap is in-memory, what about multi-server deployments?
   - Should we implement Redis adapter for socket.io clustering?
   - How would we handle session affinity or sticky sessions?

2. Database performance under high load:
   - Each message requires 3+ database operations (create, populate, update channel)
   - Should we implement database connection pooling?
   - Could we batch database writes for better performance?
   - Should message history have size limits per channel?

🔒 SECURITY & VALIDATION:
3. Socket authentication security:
   - Currently user ID comes from query params - is this secure?
   - Should we validate JWT tokens on socket connection?
   - How do we prevent socket session hijacking?
   - Should we implement rate limiting per socket connection?

4. Message validation and sanitization:
   - Are incoming messages validated before database storage?
   - How do we prevent XSS attacks through message content?
   - Should we implement profanity filtering or content moderation?
   - How do we handle malicious file uploads in messages?

⚡ PERFORMANCE OPTIMIZATIONS:
5. Memory management:
   - userSocketMap grows with connected users - what about cleanup?
   - Should we implement periodic cleanup of stale connections?
   - How do we handle memory leaks in long-running processes?
   - Could we implement connection pooling for database operations?

6. Message broadcasting efficiency:
   - Channel messages iterate through all members - O(n) complexity
   - Should we implement Redis pub/sub for channel broadcasting?
   - Could we use socket rooms for more efficient group messaging?
   - How would we handle channels with thousands of members?

🛠️ ERROR HANDLING & MONITORING:
7. Robust error handling:
   - Currently errors are just logged - should we emit back to clients?
   - How do we handle database connection failures?
   - Should we implement retry mechanisms for failed operations?
   - What about graceful degradation when services are down?

8. Production monitoring:
   - How do we track socket connection metrics?
   - Should we log message delivery success/failure rates?
   - How do we monitor database performance for message operations?
   - What alerts should we set up for system health?

🚀 FEATURE EXTENSIONS:
9. Real-time features to implement:
   - Typing indicators: How would we track and broadcast typing status?
   - Message reactions: How would we handle emoji reactions in real-time?
   - User presence: How would we track online/offline status?
   - Message delivery receipts: How would we confirm message delivery?

10. Advanced messaging features:
    - Message editing: How would we handle message updates in real-time?
    - Message deletion: Should we soft delete or hard delete messages?
    - File sharing: How would we handle real-time file upload progress?
    - Voice messages: How would we stream audio messages?

📱 MOBILE & OFFLINE SUPPORT:
11. Mobile considerations:
    - How do we handle mobile app backgrounding/foregrounding?
    - Should we implement push notifications for offline users?
    - How do we handle poor network conditions and reconnection?
    - What about battery optimization for socket connections?

🔧 DEPLOYMENT & DEVOPS:
12. Production deployment:
    - How do we handle zero-downtime deployments with active sockets?
    - Should we implement health checks for socket server?
    - How do we handle load balancing with sticky sessions?
    - What about SSL/TLS termination for WebSocket connections?

💾 DATA MANAGEMENT:
13. Message storage strategy:
    - Should old messages be archived to reduce database size?
    - How do we implement message search across chat history?
    - Should we implement message encryption at rest?
    - What about GDPR compliance for message data retention?
*/