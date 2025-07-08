// =====================================
// CHANNEL CONTROLLER - REST API FOR CHANNEL OPERATIONS
// =====================================
// This controller handles HTTP REST API endpoints for channel/group chat operations
// in the TalkNest chat application. It manages channel creation, membership,
// and message history retrieval for group conversations.

import mongoose from "mongoose";
import Channel from "../models/channel.model.js"
import {User} from "../models/user.model.js"

// =====================================
// CHANNEL CREATION ENDPOINT
// =====================================

/**
 * Create new channel/group chat
 * 
 * This endpoint creates a new channel with the requesting user as admin
 * and specified users as members. It validates all members exist and
 * sets up the channel structure for group messaging.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - Admin user ID (from auth middleware)
 * @param {string} req.body.name - Channel name
 * @param {Array} req.body.members - Array of user IDs to add as members
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Channel Creation Process:
 * 1. Validate admin user exists
 * 2. Validate all member users exist
 * 3. Create channel with admin and members
 * 4. Return channel data for frontend
 */
export const CreateChannel = async (req , res , next) =>{
    try{
        // =====================================
        // INPUT VALIDATION
        // =====================================
        
        const {name , members} = req.body;
        const user = new mongoose.Types.ObjectId(req.userID);
        
        // Validate admin user exists
        const admin = await User.findById(user);
        if(!admin){
            return res.status(400).json({
                msg : "Admin User Not Found",
            })
        }

        // =====================================
        // MEMBER VALIDATION
        // =====================================
        
        // Validate all specified members exist in database
        const validMembers =await User.find({ _id : {$in : members}})
        if(validMembers.length !== members.length){
            return res.status(400).json({
                msg : "Some Members are not Valid Users"
            })
        }

        // =====================================
        // CHANNEL CREATION
        // =====================================
        
        // Create channel with admin and members
        const channel = await Channel.create({
            name,
            admin : [admin._id],  // Creator becomes admin
            members               // Specified users become members
        })

        return res.status(200).json({
            msg : "Channel Created Successfully",
            channel,
        })

        
    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR",
        })
    }
}

// =====================================
// USER CHANNELS RETRIEVAL ENDPOINT
// =====================================

/**
 * Get all channels for authenticated user
 * 
 * This endpoint retrieves all channels where the user is either
 * an admin or member. Results are sorted by most recent activity
 * for displaying in the channels list.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - User ID (from auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Query Logic:
 * - Find channels where user is admin OR member
 * - Sort by updatedAt (most recent first)
 * - Return complete channel list for sidebar
 */
export const getUserChannels = async (req , res , next) =>{
    try{
        
        // =====================================
        // USER CHANNEL QUERY
        // =====================================
        
        const userId = new mongoose.Types.ObjectId(req.userID);

        // Find channels where user is admin or member
        const channels = await Channel.find({
            $or : [
                {admin : userId},    // User is admin
                {members : userId},  // User is member
            ]
        }).sort({updatedAt : -1});   // Most recent activity first

        return res.status(200).json({
            channels,
        })
        
    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : 'INTERNAL SERVER ERROR',
        })
    }
}

// =====================================
// CHANNEL MESSAGE HISTORY ENDPOINT
// =====================================

/**
 * Get message history for specific channel
 * 
 * This endpoint retrieves all messages for a channel with populated
 * sender information for display. Similar to direct message history
 * but for group conversations.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.channelId - Channel ID to get messages for
 * @param {string} req.userID - User ID (from auth middleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Message Retrieval Process:
 * 1. Validate channel ID provided
 * 2. Find channel and populate message history
 * 3. Populate sender details for each message
 * 4. Return chronological message list
 */
export const getChannelMessages = async (req , res , next) => {
    try{
        // =====================================
        // INPUT VALIDATION
        // =====================================
        
        const {channelId} = req.params;

        if(!channelId){
            return res.status(400).json({
                msg : "NO ChannelId was provided"
            })
        }

        // =====================================
        // CHANNEL MESSAGE QUERY
        // =====================================
        
        // Find channel and populate message history with sender details
        const channel = await Channel.findById(channelId)
        .populate({
            path: 'messages',
            select: 'sender messageType content fileUrl timeStamp',
            populate: {
                path: 'sender',
                select: 'colorTheme firstName lastName emailID'
            }
        });

        // TODO: Add access control validation
        // - Verify user is member/admin of channel
        // - Handle private channel permissions
        
        const messages = channel.messages;

        return res.status(200).json({
            messages,
        })

    }catch(error){
        console.log({error});
        return res.status(500).json({
            msg : "INTERNAL SERVER ERROR",
        })
    }
}

// =====================================
// DESIGN THINKING QUESTIONS
// =====================================

/*
👥 CHANNEL MANAGEMENT:
1. Advanced Permissions: How would we implement moderator roles, member-specific permissions, and hierarchical admin structures for large organizations?

🔐 ACCESS CONTROL:
2. Channel Security: Should we add channel visibility controls, invitation-only channels, and audit logging for administrative actions?

⚡ PERFORMANCE:
3. Scalability: How do we handle channels with thousands of members, optimize member queries, and implement efficient message pagination for large channels?

🚀 FEATURE EXTENSIONS:
4. Enhanced Functionality: How would we add channel categories, announcement channels, threaded discussions, and integration with external services?

📊 ANALYTICS:
5. Channel Insights: Should we implement channel activity tracking, member engagement metrics, and administrative dashboards for channel management?
*/