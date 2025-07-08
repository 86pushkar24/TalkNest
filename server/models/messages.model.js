// =====================================
// MESSAGE MODEL - MONGODB SCHEMA FOR CHAT MESSAGES
// =====================================
// This model defines the structure for all chat messages in the Talkhere
// application, supporting both direct messages and channel messages with
// text content and file attachments.

import mongoose from "mongoose";

// =====================================
// MESSAGE SCHEMA DEFINITION
// =====================================

/**
 * Message Schema for MongoDB
 * 
 * Handles both direct messages (1-on-1) and channel messages (group chat).
 * Supports text messages and file attachments with conditional validation.
 * 
 * Design Decisions:
 * - Single schema for all message types (DM and channel)
 * - Conditional validation based on message type
 * - References to User model for sender/receiver population
 * - Automatic timestamp generation for message ordering
 */
const messageSchema = new mongoose.Schema({
    // =====================================
    // MESSAGE PARTICIPANTS
    // =====================================
    
    /**
     * Message sender - always required for attribution
     * References Users collection for sender information
     * Populated with user details (name, avatar, etc.) for display
     */
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : true,
    },

    /**
     * Message receiver - for direct messages only
     * References Users collection for recipient information
     * Optional because channel messages don't have single receiver
     * For channel messages, recipients are determined by channel membership
     */
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Users",
        required : false,  // false for channel messages
    },

    // =====================================
    // MESSAGE CONTENT TYPE
    // =====================================
    
    /**
     * Type of message content
     * Determines which content field is required and how to display
     * 
     * "text" - Regular text message (uses content field)
     * "file" - File attachment (uses fileUrl field)
     */
    messageType : {
        type : String,
        enum : ["text" , "file"],
        required : true,
    },

    // =====================================
    // MESSAGE CONTENT FIELDS
    // =====================================
    
    /**
     * Text message content
     * Required only for text messages
     * Contains the actual message text from user
     */
    content :{
        type : String,
        required : function () {
            return this.messageType === "text";
        }
        // TODO: Add content length validation and sanitization
        // maxlength: [1000, "Message too long"],
        // validate: [sanitizeContent, "Invalid content"]
    },

    /**
     * File attachment URL
     * Required only for file messages
     * Points to uploaded file in server storage
     * Used for images, documents, media files
     */
    fileUrl : {
        type : String,
        required : function (){
            return this.messageType === "file";
        }
        // TODO: Add file URL validation
        // validate: [isValidFileUrl, "Invalid file URL"]
    },

    // =====================================
    // MESSAGE METADATA
    // =====================================
    
    /**
     * Message timestamp
     * Automatically set when message is created
     * Used for chronological ordering and display
     * Essential for real-time chat message sequencing
     */
    timeStamp : {
        type : Date,
        default : Date.now,
    }   
    
    // TODO: Add additional fields for enhanced features:
    // - editedAt: Date (for message editing)
    // - deletedAt: Date (for soft delete)
    // - readBy: [ObjectId] (for read receipts)
    // - reactions: [Object] (for emoji reactions)
    // - replyTo: ObjectId (for message threading)
    // - channel: ObjectId (for channel messages)
});

// =====================================
// INDEXES FOR PERFORMANCE OPTIMIZATION
// =====================================

// Compound index for efficient message retrieval between users
// Supports queries like: find messages between user A and user B
messageSchema.index({ sender: 1, receiver: 1, timeStamp: -1 });

// Index for channel message queries (when channel field is added)
// messageSchema.index({ channel: 1, timeStamp: -1 });

// =====================================
// MODEL EXPORT
// =====================================

/**
 * Export Message model for use in controllers and socket handlers
 * 
 * Model provides methods for:
 * - Message.create() - Create new message with validation
 * - Message.find() - Query messages with population of user data
 * - Message.findById() - Get specific message with user details
 * - Message.populate() - Load sender/receiver information
 * 
 * Collection name: 'Messages' in MongoDB
 * Used by: MessagesController, socket.js handlers
 */
export const Message = mongoose.model("Messages" , messageSchema);

// =====================================
// DESIGN THINKING QUESTIONS
// =====================================

/*
📊 DATA MODELING:
1. Message Features: How would we add message editing, threading/replies, reactions, and read receipts while maintaining performance and real-time sync?

🔐 SECURITY & VALIDATION:
2. Content Security: Should we implement message encryption, content filtering/moderation, and validation to prevent XSS attacks through message content?

⚡ PERFORMANCE:
3. Database Optimization: How do we handle message pagination efficiently, implement message archival for old conversations, and optimize queries for channels with thousands of messages?

🚀 SCALABILITY:
4. Message Storage: Should we implement message sharding by date/user, separate hot vs cold storage, and consider alternative databases for high-volume messaging?

💬 CHAT FEATURES:
5. Advanced Messaging: How would we support message search, file metadata (thumbnails, previews), voice messages, and message delivery status tracking?
*/