// =====================================
// CHAT SLICE - ZUSTAND STATE MANAGEMENT FOR MESSAGING
// =====================================
// This slice manages all chat-related state in the TalkNest frontend.
// It handles current chat selection, message history, contacts, and channels
// with real-time updates from socket events.

/**
 * Chat State Slice
 * 
 * Manages chat application state using Zustand store pattern.
 * Handles both direct messages and channel conversations with real-time updates.
 * 
 * State Structure:
 * - Chat Selection: Currently active chat and type
 * - Messages: Current chat message history
 * - Contacts: Direct message contact list
 * - Channels: Available channel list
 * 
 * Real-time Integration:
 * - addMessage: Called by socket events for incoming messages
 * - Contact/Channel updates: Maintain recent conversation order
 * 
 * @param {Function} set - Zustand state setter function
 * @param {Function} get - Zustand state getter function
 * @returns {Object} Chat state and methods
 */
export const createChatSlice = (set , get) => ({
    // =====================================
    // CURRENT CHAT SELECTION STATE
    // =====================================
    
    /**
     * Type of currently selected chat
     * undefined: No chat selected
     * "contact": Direct message conversation
     * "channel": Group chat conversation
     */
    selectedChatType : undefined,
    
    /**
     * Data for currently selected chat
     * For contacts: User object with profile info
     * For channels: Channel object with member info
     * undefined: No chat selected
     */
    selectedChatData : undefined,
    
    /**
     * Messages for currently selected chat
     * Array of message objects in chronological order
     * Updated in real-time via socket events
     * Cleared when switching chats
     */
    selectedChatMessages : [],
    
    // =====================================
    // CONTACT AND CHANNEL LISTS
    // =====================================
    
    /**
     * Direct message contacts list
     * Array of users with recent message activity
     * Ordered by most recent conversation
     * Updated when new messages arrive
     */
    directMessagesContacts : [],
    
    /**
     * Available channels list
     * Array of channels user is member/admin of
     * Ordered by most recent activity
     * Updated when channel messages arrive
     */
    channels : [],
    
    // =====================================
    // BASIC STATE SETTERS
    // =====================================
    
    setChannels : (channels) => set({channels}),
    setSelectedChatType : (selectedChatType) => set({selectedChatType}),
    setSelectedChatData : (selectedChatData) => set({selectedChatData}),
    setSelectedChatMessages : (selectedChatMessages) => set({selectedChatMessages}),
    setDirectMessagesContacts : (directMessagesContacts) => set({directMessagesContacts}),

    // =====================================
    // CHAT NAVIGATION METHODS
    // =====================================
    
    /**
     * Close current chat and clear selection
     * Called when user clicks away from chat or logs out
     * Resets all current chat state to initial values
     */
    closeChat : () => set({
        selectedChatType:undefined,
        selectedChatData:undefined,
        selectedChatMessages:[],
    }),

    // =====================================
    // REAL-TIME MESSAGE HANDLING
    // =====================================
    
    /**
     * Add new message to current chat
     * 
     * Called by socket event handlers when new messages arrive.
     * Handles both direct messages and channel messages with proper
     * data structure normalization for consistent UI rendering.
     * 
     * @param {Object} message - Message object from socket/API
     * @param {Object} message.sender - Sender user data
     * @param {Object} message.receiver - Receiver user data (DM only)
     * @param {string} message.content - Message text content
     * @param {Date} message.timeStamp - Message timestamp
     * 
     * Data Normalization:
     * - Channel messages: Keep full sender object for display
     * - Direct messages: Use sender/receiver IDs for consistency
     */
    addMessage : (message) => {

        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set(
            {
                selectedChatMessages : [
                    ...selectedChatMessages,
                    {
                        ...message,
                        // Normalize sender data based on chat type
                        sender : selectedChatType === "channel"
                            ? message.sender           // Keep full object for channel display
                            : message.sender._id,      // Use ID for direct messages
                        // Normalize receiver data based on chat type
                        receiver : selectedChatType === "channel"
                            ? message.receiver         // Usually undefined for channels
                            : message.receiver._id,    // Use ID for direct messages
                    }
                ]
            }
        )
        
    },

    // =====================================
    // CHANNEL MANAGEMENT METHODS
    // =====================================
    
    /**
     * Add new channel to channels list
     * Called when user creates or joins a new channel
     * Places new channel at top of list for immediate visibility
     * 
     * @param {Object} channel - Channel object with name, members, etc.
     */
    addChannel : (channel) =>{
        const channels = get().channels;
        set({channels : [channel, ...channels]})
    },

    /**
     * Update channel position in list based on new message activity
     * 
     * Called by socket handler when channel receives new message.
     * Moves active channel to top of list to show recent activity.
     * Maintains channel order based on conversation recency.
     * 
     * @param {Object} message - Channel message with channelId
     * @param {string} message.channelId - ID of channel that received message
     */
    addChannelInChannelList : (message) => {
        const channels = get().channels;
        
        // Find channel that received the message
        const data = channels.find((channel) => channel._id === message.channelId)
        const index = channels.findIndex(
            (channel) => channel._id === message.channelId
        );

        // Move channel to top of list if found
        if(index !== -1 && index !== undefined){
            channels.splice(index , 1);  // Remove from current position
            channels.unshift(data);       // Add to top of list
        }
    },

    // =====================================
    // DIRECT MESSAGE CONTACT MANAGEMENT
    // =====================================
    
    /**
     * Update direct message contacts list based on new message activity
     * 
     * Called by socket handler when direct message is received.
     * Maintains contacts list ordered by most recent conversation.
     * Handles both incoming and outgoing message scenarios.
     * 
     * @param {Object} message - Direct message object
     * @param {Object} message.sender - Message sender user data
     * @param {Object} message.receiver - Message receiver user data
     * 
     * Contact Management Logic:
     * 1. Determine which user is the contact (not current user)
     * 2. Find if contact already exists in list
     * 3. Move existing contact to top or add new contact
     * 4. Maintain recency-based ordering
     */
    addContactsInDMContacts : (message) => {
        // Get current user ID for comparison
        const userId = get().userInfo.id
        
        // Determine contact ID and data based on message direction
        const contactId = 
            message.sender._id === userId ? message.recipient._id : message.sender._id

        const contactData = message.sender._id === userId ? message.recipient : message.sender
        
        const dmContacts = get().directMessagesContacts;

        // Find existing contact in list
        const data = dmContacts.find((contact) => contact._id === contactId)
        const index = dmContacts.findIndex((contact) => contact._id === contactId);

        // Update contact list based on existence
        if(index !== -1 && index !== undefined){
            // Contact exists - move to top for recent activity
            dmContacts.splice(index , 1);    // Remove from current position
            dmContacts.unshift(data);        // Add to top of list
        }else{
            // New contact - add to top of list
            dmContacts.unshift(contactData);
        }

        // Update state with modified contacts list
        set({directMessagesContacts : dmContacts})

    }
    
    // TODO: Add additional chat management methods:
    // - markAsRead: (chatId) => {} - Mark messages as read
    // - deleteMessage: (messageId) => {} - Remove message from chat
    // - updateMessage: (messageId, newContent) => {} - Edit message
    // - clearChatHistory: (chatId) => {} - Clear chat messages
    // - addTypingIndicator: (userId) => {} - Show typing status
    // - removeTypingIndicator: (userId) => {} - Hide typing status

    // =====================================
    // DESIGN THINKING QUESTIONS
    // =====================================

    /*
    💬 MESSAGE MANAGEMENT:
    1. Message Features: How would we implement message editing, deletion, search functionality, and message reactions while maintaining real-time sync across users?

    ⚡ PERFORMANCE OPTIMIZATION:
    2. State Performance: Should we implement message virtualization for large chat histories, memoized selectors, and pagination to handle thousands of messages efficiently?

    🔄 REAL-TIME SYNC:
    3. State Synchronization: How do we handle message ordering conflicts, offline message queuing, and state reconciliation when multiple users send messages simultaneously?

    📱 USER EXPERIENCE:
    4. Chat UX Enhancement: How would we add typing indicators, read receipts, message status (sent/delivered/read), and smart contact suggestions to improve user experience?

    🛡️ DATA INTEGRITY:
    5. State Consistency: Should we implement optimistic updates, error handling for failed message sends, and state recovery mechanisms for better reliability?
    */
})