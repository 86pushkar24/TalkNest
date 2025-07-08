export const createChatSlice = (set , get) => ({
    selectedChatType : undefined,
    selectedChatData : undefined,
    selectedChatMessages : [],
    directMessagesContacts : [],
    channels : [],
    setChannels : (channels) => set({channels}),
    setSelectedChatType : (selectedChatType) => set({selectedChatType}),
    setSelectedChatData : (selectedChatData) => set({selectedChatData}),
    setSelectedChatMessages : (selectedChatMessages) => set({selectedChatMessages}),
    setDirectMessagesContacts : (directMessagesContacts) => set({directMessagesContacts}),

    closeChat : () => set({
        selectedChatType:undefined,
        selectedChatData:undefined,
        selectedChatMessages:[],
    }),

    addMessage : (message) => {

        const selectedChatMessages = get().selectedChatMessages;
        const selectedChatType = get().selectedChatType;

        set(
            {
                selectedChatMessages : [
                    ...selectedChatMessages,
                    {
                        ...message,
                        sender : selectedChatType === "channel"
                            ? message.sender
                            : message.sender._id,
                        receiver : selectedChatType === "channel"
                            ? message.receiver
                            : message.receiver._id,
                    }
                ]
            }
        )
        
    },

    addChannel : (channel) =>{
        const channels = get().channels;
        set({channels : [channel, ...channels]})
    },

    addChannelInChannelList : (message) => {
        const channels = get().channels;
        const data = channels.find((channel) => channel._id === message.channelId)
        const index = channels.findIndex(
            (channel) => channel._id === message.channelId
        );

        if(index !== -1 && index !== undefined){
            channels.splice(index , 1);
            channels.unshift(data);
        }
    },

    addContactsInDMContacts : (message) => {
        const userId = get().userInfo.id
        const contactId = 
            message.sender._id === userId ? message.recipient._id : message.sender._id

        const contactData = message.sender._id === userId ? message.recipient : message.sender
        
        const dmContacts = get().directMessagesContacts;

        const data = dmContacts.find((contact) => contact._id === contactId)
        const index = dmContacts.findIndex((contact) => contact._id === contactId);

        //if a contact is already present in contact list then we remove it and place at top 
        if(index !== -1 && index !== undefined){
            dmContacts.splice(index , 1);
            dmContacts.unshift(data);
        }else{
            dmContacts.unshift(contactData);
        }

        set({directMessagesContacts : dmContacts})

    }
})