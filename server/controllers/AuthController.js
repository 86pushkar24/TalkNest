// =====================================
// AUTHENTICATION CONTROLLER - USER SECURITY & PROFILE MANAGEMENT
// =====================================
// This controller handles all authentication and user profile operations
// in the TalkNest chat application. It manages user registration, login,
// session management, and profile customization.
//
// Key Responsibilities:
// 1. User registration with email/password validation
// 2. User login with credential verification
// 3. JWT token generation and cookie-based session management
// 4. User profile management (names, colors, images)
// 5. Secure logout and session cleanup
// 6. Profile image upload and management
//
// Security Features:
// - Password hashing with bcrypt
// - JWT tokens for stateless authentication
// - Secure HTTP-only cookies
// - Input validation and sanitization
// - Profile image file handling

import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {renameSync, unlinkSync} from "fs";

// =====================================
// AUTHENTICATION CONFIGURATION
// =====================================

// Token expiration time: 7 days in milliseconds
// This determines how long users stay logged in
const maxAge = 7 * 24 * 60 * 60 * 1000;

/**
 * Create JWT token for user authentication
 * 
 * This function generates a signed JWT token containing user identification
 * information. The token is used for stateless authentication across requests.
 * 
 * @param {string} email - User's email address
 * @param {string} id - User's database ID
 * @returns {string} Signed JWT token
 * 
 * Token Contents:
 * - email: User's email for identification
 * - id: User's database ID for quick lookups
 * - exp: Expiration timestamp (7 days from creation)
 * 
 * Security Notes:
 * - Token is signed with JWT_KEY from environment variables
 * - Contains no sensitive information (passwords, etc.)
 * - Expiration enforces re-authentication for security
 */
const createToken = (email , id) =>{
    return jwt.sign({email , id}, process.env.JWT_KEY , {expiresIn : maxAge});
}

// =====================================
// USER REGISTRATION ENDPOINT
// =====================================

/**
 * Handle user registration (signup)
 * 
 * This endpoint creates new user accounts with email/password authentication.
 * It includes validation, duplicate checking, password hashing, and automatic
 * login via JWT token creation.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: POST
 * Route: /api/auth/signup
 * Auth: Not required (public endpoint)
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response (Success):
 * {
 *   "user": {
 *     "email": "user@example.com",
 *     "_id": "user_id",
 *     "profileSetup": false
 *   }
 * }
 * 
 * Process Flow:
 * 1. Validate email and password presence
 * 2. Check for existing user with same email
 * 3. Create new user (password automatically hashed by User model)
 * 4. Generate JWT token and set secure cookie
 * 5. Return user data for frontend state initialization
 */
export const signup = async (req , res , next) =>{
    try{
        
        // =====================================
        // INPUT VALIDATION
        // =====================================
        
        const {email , password} = req.body;

        // Validate email presence
        // TODO: Add email format validation (regex or validator library)
        if(!email){
            return res.status(400).json({
                msg : "Email is required"
            });
        }

        // Validate password presence
        // TODO: Add password strength requirements (length, complexity)
        if(!password){
            return res.status(400).json({
                msg : "Password is required"
            });
        }

        // =====================================
        // DUPLICATE USER CHECK
        // =====================================
        
        // Check if user already exists with this email
        // Prevents duplicate accounts and provides clear feedback
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(404).json({
                msg : "User with this email already exits"
            });
        }

        // =====================================
        // USER CREATION
        // =====================================
        
        // Create new user in database
        // Password hashing is handled by User model pre-save middleware
        const user = await User.create({email , password});

        // Verify user creation was successful
        if(!user){
            return res.status(500).json({
                msg : "There was an internal error while creating the User"
            });
        }
    
        // =====================================
        // SESSION CREATION & COOKIE SETUP
        // =====================================
        
        // Generate JWT token and set as HTTP-only cookie
        res.cookie("jwt" , createToken(email , user._id) , {
            maxAge,              // Cookie expiration (7 days)
            secure : true,       // HTTPS only in production
            sameSite : "None",   // Cross-site requests allowed (for frontend/backend on different domains)
            // httpOnly: true,   // TODO: Enable to prevent XSS attacks
        });

        // =====================================
        // USER DATA RESPONSE
        // =====================================
        
        // Return minimal user data needed for frontend initialization
        // Excludes sensitive information like password hash
        return res.status(201).json({
            user : {
                email : user.email,
                _id : user._id,
                profileSetup : user.profileSetup,  // Indicates if user completed profile setup
            }
        })


    }catch(err){
        // =====================================
        // ERROR HANDLING
        // =====================================
        
        console.log({err});
        
        // Generic error response to avoid information leakage
        // TODO: Implement structured logging for debugging
        return res.status(500).json({
            msg : "Internal Server Error Due to Some Unforseen Reasons"
        });
    }
}

// =====================================
// USER LOGIN ENDPOINT
// =====================================

/**
 * Handle user login authentication
 * 
 * This endpoint verifies user credentials and establishes an authenticated
 * session. It checks email/password combination and returns complete user
 * profile data for frontend state initialization.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain text password
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: POST
 * Route: /api/auth/login
 * Auth: Not required (public endpoint)
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response (Success):
 * {
 *   "user": {
 *     "email": "user@example.com",
 *     "_id": "user_id",
 *     "profileSetup": true,
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "imageURL": "upload/profiles/123456789_avatar.jpg",
 *     "colorTheme": "#FF5733"
 *   }
 * }
 * 
 * Authentication Flow:
 * 1. Validate email and password presence
 * 2. Find user by email in database
 * 3. Compare provided password with stored hash
 * 4. Generate JWT token and set secure cookie
 * 5. Return complete user profile data
 */
export const login = async(req , res , next) => {
    try{
        // =====================================
        // INPUT VALIDATION
        // =====================================
        
        const {email , password} = req.body

        if(!email){
            return res.status(400).json({
                msg : "Email is required"
            });
        }

        if(!password){
            return res.status(400).json({
                msg : "Password is required"
            });
        }

        // =====================================
        // USER LOOKUP
        // =====================================
        
        // Find user by email address
        // Email serves as unique identifier for authentication
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                msg : "No such user with this email exists"
            })
        }

        // =====================================
        // PASSWORD VERIFICATION
        // =====================================
        
        // Compare provided password with stored hash using bcrypt
        // This is secure because we never store plain text passwords
        const checkPassword = await bcrypt.compare(password , user.password);
        if(!checkPassword){
            return res.status(401).json({
                msg : "Invalid Password",
            })
        }
        
        // =====================================
        // SESSION CREATION
        // =====================================
        
        // Create JWT token and set as secure cookie
        // Note: Using user.id instead of user._id (Mongoose virtual)
        res.cookie("jwt" , createToken(email , user.id) , {
            maxAge,              // 7 days expiration
            secure : true,       // HTTPS only
            sameSite : "None",   // Cross-origin requests allowed
        });

        // =====================================
        // COMPLETE USER PROFILE RESPONSE
        // =====================================
        
        // Return comprehensive user data for frontend state initialization
        // Includes profile information needed for chat interface
        return res.status(200).json({
            user : {
                email : user.email,
                _id : user._id,
                profileSetup : user.profileSetup,    // Whether profile is complete
                firstName : user.firstName,          // Display name components
                lastName : user.lastName,
                imageURL : user.imageURL,            // Profile picture path
                colorTheme : user.colorTheme,        // UI personalization          
            }
        })

    }catch(e){
        // =====================================
        // ERROR HANDLING
        // =====================================
        
        // Log error for debugging
        console.error("Login error:", e);
        
        // Generic error response for security
        res.status(500).json({
            msg : "There was an internal error"
        })
    }
    
}

// =====================================
// USER INFO RETRIEVAL ENDPOINT
// =====================================

/**
 * Get current user information
 * 
 * This endpoint retrieves complete user profile data for authenticated users.
 * It's typically called when the app loads to initialize user state from
 * an existing JWT token/session.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - User ID extracted from JWT by auth middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: GET
 * Route: /api/auth/user-info
 * Auth: Required (JWT token in cookie)
 * 
 * Response:
 * {
 *   "user": {
 *     "email": "user@example.com",
 *     "_id": "user_id",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "profileSetup": true,
 *     "imageURL": "upload/profiles/avatar.jpg",
 *     "colorTheme": "#FF5733"
 *   }
 * }
 * 
 * Use Cases:
 * - App initialization with existing session
 * - Profile page display
 * - Verification of current user state
 */
export const getUserInfo = async (req , res , next) =>{
    try{
        // =====================================
        // USER LOOKUP BY ID
        // =====================================
        
        // req.userID is populated by auth middleware after JWT verification
        // This ensures only authenticated users can access this endpoint
        const userData = await User.findById(req.userID);

        if(!userData){
            return res.status(401).json({
                msg : "User with the given ID not found"
            })
        }

        // Return complete user profile
        // All fields are safe to return since user is authenticated
        return res.status(200).json({
            user : userData,
        })

    }catch(error){
        console.error("Get user info error:", error);
        return res.status(500).json({
            msg : "There was an internal error"
        })
    }
}

// =====================================
// PROFILE UPDATE ENDPOINT
// =====================================

/**
 * Update user profile information
 * 
 * This endpoint allows users to complete or update their profile with
 * personal information like name and color theme. It marks the profile
 * as "setup complete" for new users.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - User ID from auth middleware
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.color - User's chosen color theme
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: PUT/PATCH
 * Route: /api/auth/update-profile
 * Auth: Required (JWT token in cookie)
 * 
 * Request Body:
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "color": "#FF5733"
 * }
 * 
 * Response:
 * {
 *   "user": {
 *     // Complete updated user object
 *   }
 * }
 * 
 * Profile Setup Flow:
 * 1. User registers (profileSetup: false)
 * 2. User calls this endpoint with name/color
 * 3. profileSetup becomes true
 * 4. User can now access full chat features
 */
export const updateProfile = async (req , res , next) => {
     try{
         
         // =====================================
         // INPUT EXTRACTION & VALIDATION
         // =====================================
         
         const {userID} = req;  // From auth middleware
         const {firstName , lastName , color} = req.body;

         // Validate required fields
         // Both names are required for complete profile setup
         if(!firstName || !lastName ){
            return res.status(401).json({
                msg : "FirstName and LastName are required fields"
            })
         }

         // =====================================
         // PROFILE UPDATE
         // =====================================
         
         // Update user profile with new information
         // Sets profileSetup to true to indicate completed onboarding
         const userData = await User.findByIdAndUpdate(userID , {
            firstName , 
            lastName , 
            colorTheme : color , 
            profileSetup : true        // Mark profile as complete
         },{
            new : true ,               // Return updated document
            runValidators : true       // Ensure Mongoose validation runs
         });

         return res.status(200).json({
            user : userData,
        })

     }catch(error){
        console.error("Update profile error:", error);
        return res.status(500).json({
            msg : "There was an internal error"
        })
     }
}

// =====================================
// PROFILE IMAGE UPLOAD ENDPOINT
// =====================================

/**
 * Upload and update user profile image
 * 
 * This endpoint handles profile picture uploads using multipart/form-data.
 * It stores the image file and updates the user's profile with the file path.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.file - Multer file object with uploaded image
 * @param {string} req.userID - User ID from auth middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: POST
 * Route: /api/auth/update-profile-image
 * Content-Type: multipart/form-data
 * Auth: Required (JWT token in cookie)
 * 
 * Request: Form data with image file
 * 
 * Response:
 * {
 *   "imageURL": "upload/profiles/1625234567890_avatar.jpg"
 * }
 * 
 * File Handling:
 * - Images stored in upload/profiles/ directory
 * - Filename includes timestamp to prevent conflicts
 * - Original filename preserved for user recognition
 * - Database updated with file path for retrieval
 */
export const updateProfileImage = async (req ,res , next) => {
    try{
        // =====================================
        // FILE VALIDATION
        // =====================================
        
        // Check if file was uploaded via multer middleware
        if(!req.file){
            return res.status(400).json({
                msg : "File is Required"
            })
        }
        
        // TODO: Add image-specific validation:
        // - File type validation (JPEG, PNG, WebP)
        // - File size limits (e.g., 5MB max)
        // - Image dimension validation
        // - Malware scanning for security
    
        // =====================================
        // FILE STORAGE & ORGANIZATION
        // =====================================
        
        // Create unique filename with timestamp to prevent conflicts
        const date = Date.now();
        let fileName = "upload/profiles/" + date + req.file.originalname;
        
        // Move file from temporary upload location to permanent storage
        renameSync(req.file.path , fileName);
    
        // =====================================
        // DATABASE UPDATE
        // =====================================
        
        // Update user record with new image URL
        const updatedUser = await User.findByIdAndUpdate( 
            req.userID ,
            { imageURL : fileName} ,
            { new : true} , 
            { runValidators : true});
    
        // Return image URL for frontend to update UI immediately
        return res.status(201).json({
            imageURL : updatedUser.imageURL,
        })
        
    }catch(err){
        console.log({err});
        
        // TODO: Implement cleanup on error:
        // - Remove uploaded file if database update fails
        // - Handle disk space issues
        // - Provide specific error messages for different failure types
        
        return res.status(500).json({msg : "Internal Servor Error"});
    }   
};

// =====================================
// PROFILE IMAGE DELETION ENDPOINT
// =====================================

/**
 * Delete user profile image
 * 
 * This endpoint removes the user's profile picture from both the file system
 * and database. It provides a way for users to remove their avatar and
 * revert to default appearance.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.userID - User ID from auth middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: DELETE
 * Route: /api/auth/delete-profile-image
 * Auth: Required (JWT token in cookie)
 * 
 * Response:
 * {
 *   "msg": "Profile Image Removed Successfully"
 * }
 * 
 * Deletion Process:
 * 1. Find user by ID
 * 2. Delete physical file from filesystem
 * 3. Clear imageURL field in database
 * 4. Return success confirmation
 */
export const deleteProfileImage = async(req , res , next) => {
    try{
        // =====================================
        // USER LOOKUP & VALIDATION
        // =====================================
        
        const userID = req.userID;
        const user = await User.findById(userID);
        
        if(!user){
            res.status(400).json({
                msg : "No such User exits"
            })
        }

        // =====================================
        // FILE SYSTEM CLEANUP
        // =====================================
        
        // Delete physical file if it exists
        // This prevents orphaned files from accumulating on disk
        if(user.imageURL) {
            try {
                unlinkSync(user.imageURL);
            } catch (fileError) {
                // Log file deletion error but don't fail the request
                // File might already be deleted or moved
                console.warn("Failed to delete profile image file:", fileError);
            }
        }

        // =====================================
        // DATABASE UPDATE
        // =====================================
        
        // Clear image URL from user profile
        user.imageURL = "";
        await user.save();

        return res.status(201).json({
            msg : "Profile Image Removed Successfully"
        })
        
    }catch(err){
        console.log(err);
        return res.status(500).json({
            msg : "There was an INTERNAL SERVER ERROR",
        })
    }
    
}

// =====================================
// USER LOGOUT ENDPOINT
// =====================================

/**
 * Handle user logout
 * 
 * This endpoint securely logs out users by invalidating their JWT cookie.
 * It clears the authentication token to prevent further authenticated requests.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * HTTP Method: POST
 * Route: /api/auth/logout
 * Auth: Not strictly required (but typically called by authenticated users)
 * 
 * Response:
 * {
 *   "msg": "Logout Successfull."
 * }
 * 
 * Logout Process:
 * 1. Override JWT cookie with empty value
 * 2. Set immediate expiration (maxAge: 1ms)
 * 3. Maintain security flags for proper cleanup
 * 4. Return success confirmation
 * 
 * Security Notes:
 * - Cookie is immediately expired, not just cleared
 * - Same security flags used as login to ensure proper handling
 * - Client should also clear any stored user state
 */
export const Logout = async (req , res , next) =>{
    try{
        // =====================================
        // JWT COOKIE INVALIDATION
        // =====================================
        
        // Clear JWT cookie by setting empty value with immediate expiration
        // maxAge: 1 ensures cookie expires immediately
        res.cookie("jwt" , "" , {
            maxAge:1 ,               // Expire immediately (1ms)
            sameSite: "None" ,       // Match original cookie settings
            secure : true            // HTTPS only (match login settings)
        });
        
        // TODO: Consider additional logout security measures:
        // - Blacklist the JWT token on server side
        // - Clear any server-side session data
        // - Log logout event for security auditing
        // - Notify other devices/sessions of logout (if multi-device support)
        
        res.status(200).json({
            msg : "Logout Successfull."
        })
        
    }catch(err){
        console.log(err);
        return res.status(500).json({
            msg: "There was an Internal SERVER ERROR"
        })
    }
}

// =====================================
// DESIGN THINKING QUESTIONS FOR AUTHENTICATION SYSTEM
// =====================================

/*
🔐 AUTHENTICATION SECURITY:
1. Password security and policies:
   - Current implementation has no password requirements - what should we add?
   - Should we implement password complexity rules (length, special chars, etc.)?
   - How do we handle password reset functionality securely?
   - Should we implement password history to prevent reuse?

2. JWT token security:
   - Is 7-day token expiration appropriate for a chat app?
   - Should we implement refresh tokens for better security?
   - How do we handle token revocation (logout from all devices)?
   - Should tokens include additional claims for authorization?

3. Session management:
   - Currently using HTTP-only cookies - is this the best approach?
   - How do we handle multiple device/browser sessions?
   - Should we implement session invalidation on suspicious activity?
   - How do we handle concurrent logins from different locations?

🛡️ INPUT VALIDATION & SANITIZATION:
4. Email validation:
   - Current implementation only checks presence - what about format validation?
   - Should we implement email verification before account activation?
   - How do we handle email normalization (case sensitivity, plus addressing)?
   - Should we block disposable email addresses?

5. File upload security:
   - Profile images have minimal validation - what's missing?
   - How do we prevent malicious file uploads (executables, scripts)?
   - Should we implement image processing (resizing, format conversion)?
   - How do we handle file size limits and storage quotas?

⚡ PERFORMANCE & SCALABILITY:
6. Database optimization:
   - Should we add indexes for email lookups and user searches?
   - How do we handle user search and discovery at scale?
   - Should we implement user profile caching (Redis)?
   - How do we optimize file storage for millions of profile images?

7. Authentication performance:
   - Is bcrypt comparison fast enough for high-traffic scenarios?
   - Should we implement rate limiting for login attempts?
   - How do we handle brute force attack prevention?
   - Should we cache authentication results temporarily?

🔄 USER EXPERIENCE:
8. Registration and onboarding:
   - Should we implement email verification before allowing chat access?
   - How do we guide users through profile setup completion?
   - Should we allow social login (Google, Facebook, GitHub)?
   - How do we handle username vs email-only identification?

9. Profile management:
   - Should users be able to change their email addresses?
   - How do we handle profile data export (GDPR compliance)?
   - Should we implement profile privacy settings?
   - How do we handle account deactivation vs deletion?

📱 MOBILE & CROSS-PLATFORM:
10. Mobile authentication:
    - How do we handle authentication in mobile apps vs web?
    - Should we implement biometric authentication (fingerprint, face ID)?
    - How do we handle push notification registration during auth?
    - Should we implement device-specific security settings?

11. Cross-platform session sync:
    - How do profile changes sync across multiple devices?
    - Should logout from one device affect others?
    - How do we handle offline authentication scenarios?
    - Should we implement device management (trusted devices)?

🛠️ ERROR HANDLING & MONITORING:
12. Security monitoring:
    - How do we detect and prevent account takeover attempts?
    - Should we implement login anomaly detection (unusual locations, times)?
    - How do we handle account lockouts and recovery?
    - Should we notify users of new device logins?

13. Audit logging:
    - What authentication events should we log for security?
    - How do we track user behavior patterns for fraud detection?
    - Should we implement security dashboards for administrators?
    - How do we handle privacy while maintaining security logs?

🚀 FEATURE EXTENSIONS:
14. Advanced authentication features:
    - Should we implement two-factor authentication (2FA)?
    - How would we add single sign-on (SSO) integration?
    - Should we implement OAuth2 for third-party app integration?
    - How do we handle enterprise authentication (LDAP, SAML)?

15. User verification and trust:
    - Should we implement user verification badges?
    - How do we handle identity verification for sensitive chats?
    - Should we implement user reputation systems?
    - How do we handle reported users and moderation?

🌐 COMPLIANCE & PRIVACY:
16. Data protection compliance:
    - How do we ensure GDPR compliance for user data?
    - Should we implement data minimization principles?
    - How do we handle right to be forgotten requests?
    - Should we implement privacy-by-design principles?

17. Geographic and legal considerations:
    - How do we handle different privacy laws by region?
    - Should we implement data residency requirements?
    - How do we handle government data requests?
    - Should we implement end-to-end encryption for profile data?

🔧 DEPLOYMENT & OPERATIONS:
18. Production considerations:
    - How do we handle database migrations for user schema changes?
    - Should we implement A/B testing for authentication flows?
    - How do we handle high availability for authentication services?
    - Should authentication be a separate microservice?

19. Backup and disaster recovery:
    - How do we backup user authentication data securely?
    - Should we implement cross-region replication for user data?
    - How do we handle authentication service failures?
    - Should we implement graceful degradation modes?

💾 DATA ARCHITECTURE:
20. User data modeling:
    - Should we separate authentication data from profile data?
    - How do we handle user relationships and social graphs?
    - Should we implement user groups and organizations?
    - How do we handle user data archival and retention?

21. Integration with chat features:
    - How does user authentication integrate with message encryption?
    - Should we implement per-chat identity verification?
    - How do we handle user blocking and privacy controls?
    - Should we implement user presence and status management?
*/