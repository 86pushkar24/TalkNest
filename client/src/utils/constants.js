export const HOST = import.meta.env.VITE_SERVER_URL

export const AUTH_ROUTES = "api/auth"
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`
export const GET_USER_INFO_ROUTE = `${AUTH_ROUTES}/userInfo`
export const UPDATE_PROFILE_ROUTE = `${AUTH_ROUTES}/updateProfile`
export const UPDATE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/updateProfileImage`
export const DELETE_PROFILE_IMAGE_ROUTE = `${AUTH_ROUTES}/deleteProfileImage`
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`


export const CONTACT_ROUTES = "api/contacts"
export const SEARCH_CONTACTS_ROUTE = `${CONTACT_ROUTES}/search`
export const GET_ALL_CONTACTS_FOR_DM_ROUTE = `${CONTACT_ROUTES}/getAllContactsForDM`
export const GET_ALL_CONTACTS_ROUTE = `${CONTACT_ROUTES}/getAllContacts`

export const MESSAGES_ROUTES = "api/messages"
export const GET_MESSAGES_ROUTE = `${MESSAGES_ROUTES}/getMessages`
export const UPLOAD_FILE_ROUTE = `${MESSAGES_ROUTES}/uploadFile`

export const CHANNEL_ROUTES = "api/channel"
export const CREATE_CHANNEL_ROUTE = `${CHANNEL_ROUTES}/createChannel`
export const GET_USER_CHANNELS_ROUTE = `${CHANNEL_ROUTES}/getUserChannels`
export const GET_CHANNEL_MESSAGES = `${CHANNEL_ROUTES}/getChannelMessages`