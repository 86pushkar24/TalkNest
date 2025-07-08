// =====================================
// MESSAGES CONTROLLER - REST API FOR MESSAGE OPERATIONS
// =====================================
// This controller handles HTTP REST API endpoints for message-related operations
// in the Talkhere chat application. It complements the real-time socket functionality
// by providing traditional HTTP endpoints for message history and file uploads.
//
// Key Responsibilities:
// 1. Retrieve message history for direct conversations
// 2. Handle file upload for message attachments
// 3. Provide RESTful interface for message operations
// 4. Support pagination and filtering of message data
//
// Architecture Note:
// - Real-time messaging: Handled by socket.js (instant delivery)
// - Message history: Handled by this controller (HTTP requests)
// - File uploads: Handled by this controller (multipart/form-data)

import { Message } from "../models/messages.model.js";
import {mkdirSync, renameSync} from "fs";
import moment from "moment";

// =====================================
// DIRECT MESSAGE HISTORY RETRIEVAL
// =====================================

/**
 * Retrieve message history between two users
 * 
 * This endpoint fetches the complete conversation history between two users
 * for displaying in the chat interface. Unlike socket events that handle
 * real-time message delivery, this provides historical context when users
 * open a conversation.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - Current user ID (from auth middleware)
 * @param {string} req.body.id - Other user ID to get conversation with
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: POST
 * Route: /api/messages/get-messages
 * Auth: Required (user must be authenticated)
 * 
 * Request Body:
 * {
 *   "id": "other_user_id"
 * }
 * 
 * Response:
 * {
 *   "messages": [
 *     {
 *       "_id": "message_id",
 *       "sender": "user_id",
 *       "receiver": "user_id", 
 *       "content": "message text",
 *       "timeStamp": "2025-07-08T10:30:00Z",
 *       "messageType": "text"
 *     }
 *   ]
 * }
 * 
 * Use Cases:
 * - User opens a chat conversation
 * - Loading older messages (pagination)
 * - Searching through message history
 */
export const getMessages = async (req , res , next)=>{
    try{
        // =====================================
        // INPUT VALIDATION & USER EXTRACTION
        // =====================================
        
        // Get current user ID from authentication middleware
        // This ensures users can only access their own conversations
        const user1 = req.userID;
        
        // Get the other user ID from request body
        // This identifies which conversation to retrieve
        const user2 = req.body.id;

        // Validate that both users are provided
        // Missing either user would make the query invalid
        if(!user1 || !user2){
            return res.status(404).json({
                msg : "Both the Users are Required"
            })
        }

        // =====================================
        // DATABASE QUERY FOR CONVERSATION HISTORY
        // =====================================
        
        // Find all messages between the two users
        // Uses MongoDB $or operator to find messages in both directions:
        // - Messages sent by user1 to user2
        // - Messages sent by user2 to user1
        const messages = await Message.find({
            $or: [
                {sender : user1 , receiver : user2},  // user1 → user2
                {sender : user2 , receiver : user1},  // user2 → user1
            ]
        }).sort({timeStamp : 1});  // Sort chronologically (oldest first)
        
        // =====================================
        // QUERY OPTIMIZATION NOTES
        // =====================================
        
        // Current implementation loads ALL messages between users
        // Performance considerations:
        // - For users with thousands of messages, this could be slow
        // - Consider implementing pagination (skip/limit)
        // - Could add date range filtering
        // - Indexing on sender+receiver+timeStamp would improve performance
        
        // Example pagination implementation:
        // const page = req.query.page || 1;
        // const limit = req.query.limit || 50;
        // const skip = (page - 1) * limit;
        // .skip(skip).limit(limit)

        return res.status(200).json({
            messages
        })
        
    }catch(error){
        // =====================================
        // ERROR HANDLING
        // =====================================
        
        // Log error for debugging (in production, use structured logging)
        console.error("Error fetching messages:", error);
        
        // Return generic error to client (don't expose internal errors)
        return res.status(500).json({
            msg : "Internal Server Error"
        })
        
        // TODO: Implement more specific error handling:
        // - Database connection errors
        // - Invalid user ID format
        // - Permission denied scenarios
    }
}

// =====================================
// FILE UPLOAD HANDLER FOR MESSAGE ATTACHMENTS
// =====================================

/**
 * Handle file uploads for message attachments
 * 
 * This endpoint processes file uploads that will be attached to messages.
 * It handles the server-side file storage and returns a file path that
 * can be included in message objects sent via socket or REST API.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.file - Multer file object containing uploaded file data
 * @param {string} req.file.originalname - Original filename from client
 * @param {string} req.file.path - Temporary file path from multer
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: POST
 * Route: /api/messages/upload-file
 * Content-Type: multipart/form-data
 * Auth: Required (user must be authenticated)
 * 
 * Request: Form data with file field
 * 
 * Response:
 * {
 *   "filePath": "upload/files/2025-07-08-10-30-45/document.pdf"
 * }
 * 
 * File Upload Flow:
 * 1. Client selects file and uploads via form
 * 2. Multer middleware processes multipart data
 * 3. File is temporarily stored by multer
 * 4. This controller moves file to permanent location
 * 5. File path is returned to client
 * 6. Client includes file path in message via socket
 */
export const uploadFile = async (req , res , next) =>{
    console.log("hello");
    try{
        // =====================================
        // FILE VALIDATION
        // =====================================
        
        // Check if file was included in the request
        // Multer middleware should populate req.file if upload successful
        if(!req.file){
            return res.status(400).json({
                msg : "File is Required"
            })
        }
        
        // TODO: Add additional file validation:
        // - File size limits (prevent huge uploads)
        // - File type validation (images, documents, etc.)
        // - Virus scanning for security
        // - User upload quota checking
        
        // Example file validation:
        // const maxSize = 10 * 1024 * 1024; // 10MB
        // if (req.file.size > maxSize) {
        //   return res.status(400).json({ msg: "File too large" });
        // }

        // =====================================
        // FILE ORGANIZATION & STORAGE
        // =====================================
        
        // Create timestamp-based directory structure
        // This prevents filename conflicts and organizes files by upload time
        const date = moment().format('YYYY-MM-DD-HH-mm-ss');
        const fileDir = `upload/files/${date}`;
        
        // Create final file path preserving original filename
        // This maintains user-friendly filenames while ensuring uniqueness
        const filePath = `${fileDir}/${req.file.originalname}`

        // Create directory structure recursively
        // {recursive: true} ensures parent directories are created if needed
        mkdirSync(fileDir , {recursive : true});

        // Move file from temporary location to permanent storage
        // req.file.path is the temporary location created by multer
        renameSync(req.file.path , filePath);
        
        // =====================================
        // FILE STORAGE CONSIDERATIONS
        // =====================================
        
        // Current implementation uses local file system
        // Production considerations:
        // - Use cloud storage (AWS S3, Google Cloud Storage)
        // - Implement CDN for faster file delivery
        // - Add file compression for images
        // - Generate thumbnails for images/videos
        // - Implement file cleanup for old/unused files
        
        // Security considerations:
        // - Validate file types and extensions
        // - Scan for malware
        // - Implement access controls
        // - Add rate limiting for uploads

        return res.status(200).json({
            filePath
        })


    }catch(error){
        // =====================================
        // ERROR HANDLING & CLEANUP
        // =====================================
        
        console.log({error});
        
        // TODO: Implement cleanup on error:
        // - Remove temporary files if operation fails
        // - Clean up partially created directories
        // - Log structured error information
        
        // TODO: Implement specific error types:
        // - Disk space full
        // - Permission denied
        // - Invalid file format
        // - Network/storage service errors
        
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR",
        })
    }
}

// =====================================
// DESIGN THINKING QUESTIONS FOR MESSAGE CONTROLLER
// =====================================

/*
📊 API DESIGN & ARCHITECTURE:
1. REST vs Real-time architecture balance:
   - Why use REST for message history but sockets for real-time delivery?
   - Should we implement GraphQL for more flexible message queries?
   - How do we handle offline message synchronization?
   - Should we implement server-sent events (SSE) as fallback for sockets?

2. Message history pagination and performance:
   - Current implementation loads ALL messages - how to add pagination?
   - Should we implement cursor-based pagination for better performance?
   - How do we handle conversations with millions of messages?
   - Should we implement message search and filtering?

🔒 SECURITY & VALIDATION:
3. Message access control:
   - How do we ensure users can only access their own conversations?
   - Should we implement message encryption at rest?
   - How do we handle message deletion and privacy?
   - Should we implement message expiration (disappearing messages)?

4. File upload security:
   - Current implementation has minimal validation - what's missing?
   - How do we prevent malicious file uploads?
   - Should we implement virus scanning?
   - How do we handle file size limits and user quotas?

⚡ PERFORMANCE & OPTIMIZATION:
5. Database optimization:
   - Should we add indexes for sender/receiver/timestamp queries?
   - How do we optimize for users with thousands of conversations?
   - Should we implement message archiving for old conversations?
   - How do we handle database connection pooling?

6. File storage optimization:
   - Local file system vs cloud storage trade-offs?
   - Should we implement CDN for faster file delivery?
   - How do we handle file compression and thumbnails?
   - Should we implement file deduplication?

🛠️ ERROR HANDLING & RELIABILITY:
7. Robust error handling:
   - Current error responses are generic - how to improve?
   - Should we implement retry mechanisms for failed operations?
   - How do we handle partial failures in file operations?
   - Should we implement circuit breakers for external services?

8. File upload reliability:
   - What happens if file move operation fails?
   - How do we handle disk space issues?
   - Should we implement upload progress tracking?
   - How do we handle interrupted uploads?

📱 MOBILE & OFFLINE SUPPORT:
9. Mobile API considerations:
   - How do we handle poor network conditions?
   - Should we implement request compression?
   - How do we handle background sync for message history?
   - Should we implement delta sync for message updates?

10. Offline message handling:
    - How do we queue messages when users are offline?
    - Should we implement message delivery confirmations?
    - How do we handle message ordering for offline users?
    - Should we implement conflict resolution for concurrent edits?

🚀 FEATURE EXTENSIONS:
11. Advanced message features:
    - How would we implement message reactions?
    - Should we add message threading/replies?
    - How do we handle message editing and history?
    - Should we implement message templates or quick replies?

12. File sharing enhancements:
    - How would we implement collaborative document editing?
    - Should we add image/video processing (thumbnails, compression)?
    - How do we handle large file transfers (chunked uploads)?
    - Should we implement file sharing permissions?

📈 MONITORING & ANALYTICS:
13. API monitoring:
    - How do we track message API performance?
    - Should we implement rate limiting per user?
    - How do we monitor file upload success rates?
    - Should we track message delivery metrics?

14. Business analytics:
    - How do we analyze message patterns and usage?
    - Should we implement message analytics dashboard?
    - How do we track user engagement with file sharing?
    - Should we implement A/B testing for message features?

🔧 DEPLOYMENT & SCALING:
15. Horizontal scaling:
    - How do we scale message history across multiple servers?
    - Should file uploads be handled by separate microservice?
    - How do we implement database sharding for messages?
    - Should we use message queues for background processing?

16. Backup and disaster recovery:
    - How do we backup message history and files?
    - Should we implement cross-region replication?
    - How do we handle data recovery for corrupted files?
    - Should we implement point-in-time recovery?

💾 DATA MANAGEMENT:
17. Message lifecycle management:
    - Should we implement automatic message cleanup?
    - How do we handle GDPR compliance for message data?
    - Should we implement message export functionality?
    - How do we handle data retention policies?

18. File lifecycle management:
    - Should we implement automatic file cleanup for old attachments?
    - How do we handle orphaned files (messages deleted but files remain)?
    - Should we implement file compression for old attachments?
    - How do we handle file migration between storage systems?

🌐 INTEGRATION & EXTENSIBILITY:
19. Third-party integrations:
    - How would we integrate with external storage services?
    - Should we implement webhooks for message events?
    - How do we handle integration with CRM systems?
    - Should we implement email notifications for messages?

20. API versioning and evolution:
    - How do we handle API versioning for message endpoints?
    - Should we implement backwards compatibility for old clients?
    - How do we migrate data when API changes?
    - Should we implement feature flags for gradual rollouts?
*/