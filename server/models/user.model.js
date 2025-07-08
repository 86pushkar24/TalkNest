// =====================================
// USER MODEL - MONGODB SCHEMA & AUTHENTICATION
// =====================================
// This model defines the user data structure and authentication logic
// for the TalkNest chat application. It handles user registration,
// profile management, and password security.

import mongoose  from "mongoose";
import bcrypt from "bcrypt";

// =====================================
// USER SCHEMA DEFINITION
// =====================================

/**
 * User Schema for MongoDB
 * 
 * Defines the structure and validation rules for user documents.
 * Handles both authentication data (email/password) and profile
 * information (name, image, preferences).
 * 
 * Schema Design Decisions:
 * - Email as unique identifier for authentication
 * - Separate fields for profile setup tracking
 * - Optional profile fields for gradual onboarding
 * - Automatic password hashing via middleware
 */
const userSchema = new mongoose.Schema({
    // =====================================
    // AUTHENTICATION FIELDS
    // =====================================
    
    /**
     * User's email address - primary identifier
     * Used for login and account identification
     * Must be unique across all users
     */
    email:{
        type: String,
        required : [true , "Email is required"],
        unique : true,
        // TODO: Add email format validation
        // validate: [validator.isEmail, "Please provide valid email"]
    },
    
    /**
     * User's password - stored as bcrypt hash
     * Plain text password is hashed before storage via pre-save middleware
     * Never stored or returned in plain text for security
     */
    password:{
        type : String,
        required : [true , "Password is required"],
        // TODO: Add password strength validation
        // minlength: [6, "Password must be at least 6 characters"]
    },
    
    // =====================================
    // PROFILE INFORMATION FIELDS
    // =====================================
    
    /**
     * User's first name - for display in chat interface
     * Optional during registration, required for profile completion
     */
    firstName :{
        type : String,
        required : false,
        // TODO: Add length validation and sanitization
        // trim: true, maxlength: [50, "First name too long"]
    },
    
    /**
     * User's last name - for display in chat interface
     * Optional during registration, required for profile completion
     */
    lastName :{
        type : String,
        required : false,
        // TODO: Add length validation and sanitization
    },
    
    /**
     * Profile image file path - relative to server upload directory
     * Points to uploaded profile picture file
     * Used for avatar display in chat interface
     */
    imageURL:{
        type : String,
        required : false,
        // TODO: Add URL validation for security
        // validate: [isValidImagePath, "Invalid image path"]
    },
    
    /**
     * User's color theme preference - for UI personalization
     * Numeric value representing color choice
     * Used for chat bubble colors and profile customization
     */
    colorTheme:{
        type : Number,
        required : false,
        // TODO: Add range validation for available colors
        // min: [0, "Invalid color theme"], max: [10, "Invalid color theme"]
    },
    
    /**
     * Profile completion status - tracks onboarding progress
     * false: User registered but hasn't completed profile
     * true: User has provided name and can access full chat features
     */
    profileSetup:{
        type:Boolean,
        default:false,
    },

})

// =====================================
// PASSWORD HASHING MIDDLEWARE
// =====================================

/**
 * Pre-save middleware for automatic password hashing
 * 
 * This middleware runs before every user document save operation.
 * It automatically hashes plain text passwords using bcrypt for security.
 * 
 * Security Features:
 * - Uses bcrypt with auto-generated salt for each password
 * - Salt prevents rainbow table attacks
 * - Bcrypt is slow by design to prevent brute force attacks
 * - Only runs on password changes to avoid re-hashing
 * 
 * Process:
 * 1. Generate unique salt for this password
 * 2. Hash password with salt using bcrypt
 * 3. Replace plain text password with hash
 * 4. Continue with save operation
 * 
 * Note: This runs on both user creation and password updates
 */
userSchema.pre("save" , async function(next){
    // Only hash password if it's been modified (new user or password change)
    // This prevents re-hashing already hashed passwords
    if (!this.isModified('password')) return next();
    
    // Generate salt with default cost factor (10 rounds)
    // Higher rounds = more secure but slower hashing
    const salt = await bcrypt.genSalt()
    
    // Hash the password with the generated salt
    // this.password contains plain text, gets replaced with hash
    this.password = await bcrypt.hash(this.password , salt)
    
    // Continue with the save operation
    next()
})

// =====================================
// DESIGN THINKING QUESTIONS
// =====================================

/*
🔐 SECURITY & VALIDATION:
1. Password Security: Should we add password strength validation, implement password history to prevent reuse, and add account lockout after failed attempts?

📊 DATA MODELING:
2. User Relationships: How would we extend this model to support user blocking, friend relationships, and user groups/organizations for enterprise features?

⚡ PERFORMANCE:
3. Database Optimization: Should we add indexes for email lookups, implement user search by name, and consider separating authentication data from profile data for better performance?

🚀 FEATURE EXTENSIONS:
4. Profile Enhancement: How would we add user verification badges, online status tracking, last seen timestamps, and user preferences/settings?

🌐 SCALABILITY:
5. Data Architecture: Should we implement user data archival, add soft delete functionality, and consider data partitioning strategies for millions of users?
*/

// =====================================
// MODEL EXPORT
// =====================================

/**
 * Export User model for use in controllers and routes
 * 
 * Model provides methods for:
 * - User.create() - Create new user with automatic password hashing
 * - User.findOne() - Find user by email for authentication
 * - User.findById() - Get user by ID for profile operations
 * - User.findByIdAndUpdate() - Update user profile information
 * 
 * Collection name: 'Users' in MongoDB
 */
export const User = mongoose.model('Users' , userSchema);