// =====================================
// CHANNEL MODEL - MONGODB SCHEMA FOR GROUP CHATS
// =====================================
// This model defines the structure for group chat channels in the TalkNest
// application, managing channel membership, administration, and message history.

import mongoose from "mongoose";

// =====================================
// CHANNEL SCHEMA DEFINITION
// =====================================

/**
 * Channel Schema for MongoDB
 * 
 * Represents group chat channels with multiple members and administrators.
 * Tracks message history and provides structure for group communication.
 * 
 * Design Decisions:
 * - Multiple admins supported for channel management
 * - Member list for access control and notifications
 * - Message references for channel history
 * - Automatic timestamps for creation/update tracking
 */
const channelSchema = new mongoose.Schema({
    // =====================================
    // CHANNEL IDENTIFICATION
    // =====================================
    
    /**
     * Channel name - display name for the group chat
     * Used in channel lists and chat headers
     * Required for channel identification
     */
    name : {
        type : String,
        required : true,
        // TODO: Add validation for channel name
        // trim: true,
        // maxlength: [50, "Channel name too long"],
        // minlength: [1, "Channel name required"]
    },
    
    // =====================================
    // CHANNEL MEMBERSHIP
    // =====================================
    
    /**
     * Channel members - users who can send/receive messages
     * Array of User ObjectIds for channel participants
     * Used for message broadcasting and access control
     * Does not include admins (they're in separate array)
     */
    members : [{
        type : mongoose.Schema.ObjectId,
        ref : "Users",
        required : true,
    }],
    
    /**
     * Channel administrators - users with management privileges
     * Array of User ObjectIds for channel managers
     * Can add/remove members, change channel settings
     * Separate from members array for permission management
     */
    admin : [{
        type : mongoose.Schema.ObjectId,
        ref : "Users",
        required : true,
    }],
    
    // =====================================
    // CHANNEL MESSAGE HISTORY
    // =====================================
    
    /**
     * Channel message references - chronological message history
     * Array of Message ObjectIds in the channel
     * Used for loading channel history and message navigation
     * Updated when new messages are sent to channel
     */
    messages : [{
        type : mongoose.Schema.ObjectId,
        ref : "Messages",
    }],
    
    // TODO: Add additional channel features:
    // - description: String (channel description)
    // - isPrivate: Boolean (public vs private channels)
    // - maxMembers: Number (member limit)
    // - channelImage: String (channel avatar)
    // - settings: Object (channel preferences)
    
} , {
    // =====================================
    // SCHEMA OPTIONS
    // =====================================
    
    /**
     * Automatic timestamps for channel lifecycle tracking
     * createdAt: When channel was created
     * updatedAt: When channel was last modified (members, messages, etc.)
     */
    timestamps : true  // Note: Fixed typo from "timeStamps"
})

// =====================================
// INDEXES FOR PERFORMANCE OPTIMIZATION
// =====================================

// Index for channel name searches
channelSchema.index({ name: 1 });

// Index for finding channels by member
channelSchema.index({ members: 1 });

// Index for finding channels by admin
channelSchema.index({ admin: 1 });

// =====================================
// SCHEMA METHODS
// =====================================

/**
 * Check if user is channel member or admin
 * Used for access control in channel operations
 */
channelSchema.methods.isMember = function(userId) {
    return this.members.includes(userId) || this.admin.includes(userId);
};

/**
 * Check if user is channel administrator
 * Used for permission validation in channel management
 */
channelSchema.methods.isAdmin = function(userId) {
    return this.admin.includes(userId);
};

// =====================================
// MODEL EXPORT
// =====================================

/**
 * Export Channel model for use in controllers and socket handlers
 * 
 * Model provides methods for:
 * - Channel.create() - Create new channel with members and admins
 * - Channel.findById() - Get channel with populated member/admin data
 * - Channel.findByIdAndUpdate() - Add messages, members, or settings
 * - Channel.populate() - Load member, admin, and message details
 * 
 * Collection name: 'Channel' in MongoDB
 * Used by: ChannelController, socket.js handlers
 */
const Channel = mongoose.model("Channel" , channelSchema);
export default Channel;

// =====================================
// DESIGN THINKING QUESTIONS
// =====================================

/*
👥 MEMBERSHIP MANAGEMENT:
1. Channel Permissions: How would we implement granular permissions (moderators, read-only members), member roles, and permission inheritance for complex organizational structures?

📊 PERFORMANCE & SCALING:
2. Large Channels: How do we handle channels with thousands of members, optimize member lookups, and implement efficient message broadcasting for high-traffic channels?

🔐 PRIVACY & SECURITY:
3. Channel Security: Should we implement private/public channel types, invitation-only channels, channel encryption, and audit logs for administrative actions?

💬 ADVANCED FEATURES:
4. Channel Enhancement: How would we add channel categories, announcement channels, thread support, and integration with external services or bots?

🗄️ DATA MANAGEMENT:
5. Message History: Should we implement message retention policies, channel archival, backup strategies, and efficient pagination for large channel histories?
*/

