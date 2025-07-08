/**
 * ContactsController.js
 * 
 * Manages contact-related operations for the TalkNest chat application.
 * Handles contact search, DM list retrieval, and all contacts fetching.
 * 
 * Key Responsibilities:
 * - Search for users based on name/email (excludes current user)
 * - Retrieve contacts sorted by last message time for DM list
 * - Fetch all available users for channel creation/contact selection
 * 
 * Architecture Notes:
 * - Uses MongoDB aggregation pipelines for complex contact queries
 * - Implements regex-based search with sanitization for security
 * - Optimizes queries by excluding current user and projecting only needed fields
 */

/**
 * ContactsController.js
 * 
 * This controller handles all contact-related operations in the TalkNest chat application.
 * It provides endpoints for:
 * 1. Searching contacts by name/email
 * 2. Getting contacts for DM list (with last message info)
 * 3. Getting all contacts for channel member selection
 * 
 * Key Features:
 * - Real-time contact search with regex sanitization
 * - Aggregation pipelines for efficient contact retrieval
 * - User exclusion (current user not included in results)
 * - Contact formatting for different UI components
 * 
 * Security Considerations:
 * - Input sanitization to prevent regex injection
 * - User authentication required (via AuthMiddleware)
 * - Proper error handling and response formatting
 */

import mongoose from "mongoose";
import {User} from "../models/user.model.js"
import {Message} from "../models/messages.model.js"

/**
 * Search for contacts based on a search term
 * 
 * Allows users to find other users by searching their first name, last name, or email.
 * Implements case-insensitive search with regex sanitization to prevent injection attacks.
 * Excludes the current user from search results to prevent self-messaging.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.searchTerm - The search term to match against user fields
 * @param {string} req.userID - Current user's ID (from auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with matching contacts or error message
 */
export const searchedContacts = async (req , res , next) =>{
    try{
        // Extract search term from request body
        const {searchTerm} = req.body

        // Validate that search term is provided
        if(searchTerm === undefined || searchTerm === null){
            return res.status(400).json({
                msg:"Search Term is Required"
            })
        }

        // Sanitize the search term to prevent regex injection attacks
        // Escape special regex characters to treat them as literal strings
        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${([\])}|\\]/g,"\\$&"
        );

        // Create case-insensitive regex pattern for flexible matching
        const regex = new RegExp(sanitizedSearchTerm , "i");

        // Query database for matching users
        const contacts = await User.find({
            $and:[
                // Exclude current user from search results to prevent self-messaging
                {_id : {$ne : req.userID} },
                {$or : [
                    // Search across multiple fields for better user experience
                    {firstName : regex},    // Match against first name
                    {lastName : regex},     // Match against last name
                    {email : regex}         // Match against email address
                ]},
            ],
        });

        // Return successful response with matching contacts
        return res.status(200).json({contacts});

    }catch(err){
        // Log error for debugging and monitoring
        console.log({err});
        return res.status(500).json({
            msg : "Internal Server Error"
        })
    }
}

/**
 * Get contacts for DM list with last message information
 * 
 * This function retrieves all contacts that the current user has exchanged direct messages with,
 * sorted by the time of their last message. It uses MongoDB aggregation pipeline to:
 * 1. Find all messages involving the current user
 * 2. Group by conversation partner
 * 3. Get the last message time for each contact
 * 4. Join with user information
 * 5. Sort by last message time (most recent first)
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - Current user's ID (from auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with contacts array sorted by last message time
 * 
 * Pipeline Steps:
 * - $match: Find messages where user is sender or receiver
 * - $sort: Sort by timestamp descending
 * - $group: Group by conversation partner, get last message time
 * - $lookup: Join with users collection to get contact info
 * - $unwind: Flatten the contact information
 * - $project: Select only needed fields
 * - $sort: Final sort by last message time
 */
export const getContactsForDMList = async (req , res , next)=>{
    try{    
        // Get current user ID and convert to ObjectId for aggregation
        let {userID} = req;
        userID = new mongoose.Types.ObjectId(userID);

        // MongoDB aggregation pipeline to get contacts with last message info
        const contacts = await Message.aggregate([
            {
                // Stage 1: Find all messages involving the current user
                $match : {
                    $or : [
                        {sender : userID},    // Messages sent by current user
                        {receiver : userID}   // Messages received by current user
                    ]
                }
            },
            {
                // Stage 2: Sort by timestamp descending to get most recent first
                $sort : {timeStamp : -1}
            },
            {
                // Stage 3: Group by conversation partner to get unique contacts
                $group : {
                    _id : {
                        // Determine the other participant in the conversation
                        $cond : {
                            if:{ $eq : ["$sender" , userID]},
                            then : "$receiver",  // If current user is sender, group by receiver
                            else : "$sender",    // If current user is receiver, group by sender
                        }
                    },
                    // Get the timestamp of the most recent message (first due to sorting)
                    lastMessageTime : {$first : "$timeStamp"},
                },
            },
            {
                // Stage 4: Join with users collection to get contact details
                $lookup : {
                    from : "users",
                    localField : "_id",
                    foreignField : "_id",
                    as : "contactInfo",
                },
            },
            {
                // Stage 5: Unwind the contact info array (should be single document)
                $unwind : "$contactInfo",
            },
            {
                // Stage 6: Project only the fields needed for the DM list UI
                $project: {
                    _id : 1,
                    lastMessageTime : 1,
                    email : "$contactInfo.email",
                    firstName : "$contactInfo.firstName",
                    lastName : "$contactInfo.lastName",
                    imageURL : "$contactInfo.imageURL",
                    colorTheme : "$contactInfo.colorTheme",
                }
            },
            {
                // Stage 7: Final sort by last message time (most recent conversations first)
                $sort : {lastMessageTime : -1},
            },  
        ]);

        // Return successful response with contacts sorted by last message time
        return res.status(200).json({
            contacts
        })
    }catch(error){
        // Log error for debugging and monitoring
        console.log({error});
        return res.status(404).json({
            msg : "INTERNAL SERVER ERROR"
        })
    }
}

/**
 * Get all available contacts for selection (channel creation, contact lists)
 * 
 * This function retrieves all users except the current user and formats them
 * for use in UI components like dropdowns, multi-select lists, or contact pickers.
 * It provides a simple label/value format commonly used in form controls.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - Current user's ID (from auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with formatted contacts array
 * 
 * Format:
 * - label: Display name (firstName + lastName) or email fallback
 * - value: User's MongoDB ObjectId for selection
 * 
 * Use Cases:
 * - Channel member selection
 * - Contact picker components
 * - User directory display
 */
export const getAllContacts = async (req , res , next) =>{
    try{
        // Query all users except the current user
        // Project only the fields needed for contact selection
        const users = await User.find(
            {_id : {$ne : req.userID} },   // Exclude current user
            "firstName lastName _id email"  // Select only needed fields for performance
        );

        // Transform user data into label/value format for UI components
        const contacts = users.map((user)=> ({
            // Create display label: use full name if available, otherwise fall back to email
            label : user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            // Use user ID as the value for selection
            value : user._id,
        }))

        // Return formatted contacts for UI consumption
        return res.status(200).json({
            contacts
        })
        
    }catch(error){
        // Log error for debugging and monitoring
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR"
        })
    }
}

/**
 * =============================================================================
 * KEY DESIGN THINKING QUESTIONS FOR CONTACTS CONTROLLER
 * =============================================================================
 * 
 * 1. SEARCH PERFORMANCE & SCALABILITY:
 *    As the user base grows to millions, how can we optimize contact search?
 *    Should we implement search indexing, elasticsearch, or database text search?
 *    Consider: pagination, search result limits, caching strategies, and search analytics.
 * 
 * 2. PRIVACY & CONTACT DISCOVERY:
 *    How do we balance discoverability with user privacy preferences?
 *    Should users be able to control who can find them in search results?
 *    Consider: privacy settings, blocked users, public profiles vs private users.
 * 
 * 3. CONTACT RELATIONSHIP MANAGEMENT:
 *    Should we implement formal friend/contact relationships instead of implicit contacts?
 *    How do we handle contact requests, blocking, and relationship status?
 *    Consider: friend requests, mutual connections, contact import from external sources.
 * 
 * 4. REAL-TIME CONTACT STATUS:
 *    How can we show real-time presence (online/offline) and activity status in contact lists?
 *    Should we include typing indicators, last seen timestamps, or activity status?
 *    Consider: Socket.IO integration, user preference controls, and performance impact.
 * 
 * 5. CONTACT LIST PERSONALIZATION:
 *    How can we make contact lists more intelligent and personalized?
 *    Should we show frequently contacted users first, group contacts, or suggest connections?
 *    Consider: ML-based recommendations, contact grouping, favorite contacts, and user behavior analytics.
 */