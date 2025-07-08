// =====================================
// AUTHENTICATION SLICE - ZUSTAND STATE MANAGEMENT
// =====================================
// This slice manages user authentication state in the TalkNest frontend.
// It stores user information and provides methods to update authentication
// status throughout the application lifecycle.

/**
 * Authentication State Slice
 * 
 * Manages user authentication state using Zustand store pattern.
 * Provides centralized user information storage and update methods.
 * 
 * State Structure:
 * - userInfo: Complete user object from backend authentication
 * - setUserInfo: Method to update user information
 * 
 * Usage:
 * - Login/logout operations
 * - Profile updates
 * - Authentication status checks
 * - User data access across components
 * 
 * @param {Function} set - Zustand state setter function
 * @returns {Object} Authentication state and methods
 */
export const createAuthSlice = (set)=>({
    // =====================================
    // AUTHENTICATION STATE
    // =====================================
    
    /**
     * Current user information
     * 
     * undefined: User not authenticated/logged out
     * Object: User authenticated with profile data
     * 
     * Contains:
     * - _id: User database ID
     * - email: User email address
     * - firstName/lastName: Display names
     * - profileSetup: Onboarding completion status
     * - imageURL: Profile picture path
     * - colorTheme: UI personalization preference
     */
    userInfo : undefined,
    
    /**
     * Update user information in state
     * 
     * Called during:
     * - Successful login/registration
     * - Profile updates
     * - User data refresh
     * - Logout (with null/undefined)
     * 
     * @param {Object|null} userInfo - User data from backend
     */
    setUserInfo : (userInfo) => set({userInfo}),
    
    // TODO: Add additional auth methods:
    // - clearUserInfo: () => set({userInfo: undefined})
    // - updateProfile: (updates) => set(state => ({userInfo: {...state.userInfo, ...updates}}))
    // - isAuthenticated: computed property based on userInfo
    // - hasCompletedProfile: computed property for profileSetup
});

// =====================================
// DESIGN THINKING QUESTIONS
// =====================================

/*
🔐 AUTH STATE MANAGEMENT:
1. Authentication Flow: Should we add loading states, error handling, and token refresh logic directly in the auth slice for better UX?

📊 STATE PERSISTENCE:
2. Data Persistence: How would we implement state persistence across browser sessions, handle offline authentication, and sync state changes across multiple tabs?

⚡ PERFORMANCE:
3. State Optimization: Should we implement computed properties for authentication checks, memoized selectors, and partial state updates for better performance?

🚀 FEATURE EXTENSIONS:
4. Enhanced Auth: How would we add multi-factor authentication state, session management, and user preferences/settings to the auth slice?

🛡️ SECURITY:
5. State Security: Should we implement state encryption for sensitive data, audit logging for auth state changes, and automatic logout on suspicious activity?
*/

