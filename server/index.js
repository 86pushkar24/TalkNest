/**
 * TalkNest BACKEND SERVER - Main Entry Point
 * 
 * This is the core server file that bootstraps the entire TalkNest real-time chat application backend.
 * It sets up Express.js server, MongoDB connection, middleware stack, API routes, and Socket.IO integration.
 * 
 * Key Responsibilities:
 * - Database connection management
 * - Express server configuration and middleware setup
 * - CORS policy configuration for frontend-backend communication
 * - Static file serving for uploaded content (profiles, files)
 * - API route registration for all feature modules
 * - Socket.IO server initialization for real-time messaging
 * - Production-ready server startup with proper error handling
 * 
 * Architecture Pattern: Modular backend with clear separation of concerns
 * - Routes handle HTTP endpoints
 * - Controllers contain business logic
 * - Models define data structure
 * - Socket.js handles real-time communication
 * 
 * @fileoverview Main server entry point for TalkNest chat application
 * @author TalkNest Development Team
 * @version 1.0.0
 */

// Core Express.js framework for building REST API server
import express from "express";
// Environment variable management for configuration
import dotenv from "dotenv";
// Cross-Origin Resource Sharing middleware for frontend-backend communication
import cors from "cors";
// Cookie parsing middleware for session management and JWT handling
import cookieParser from "cookie-parser";
// MongoDB object modeling for Node.js
import mongoose from "mongoose";

// Feature-specific route modules for clean code organization
import authRoutes from "./routes/AuthRoutes.js"           // User authentication endpoints
import contactsRoutes from "./routes/ContactsRoutes.js";  // Contact management endpoints
import messagesRoutes from "./routes/MessagesRoutes.js";  // Message handling endpoints
import channelRoutes from "./routes/ChannelRoutes.js";    // Channel/group chat endpoints

// Socket.IO setup for real-time messaging functionality
import setUpSocket from "./socket.js";

// Load environment variables from .env file
// This must be called early to ensure all config values are available
dotenv.config();

/**
 * EXPRESS APPLICATION SETUP
 * 
 * Initialize the Express.js application instance that will handle all HTTP requests.
 * Configure port and database connection string from environment variables.
 */

// Create Express application instance
const app = express();

// Server port configuration with fallback for development
// In production, this should be set via environment variable
const port = process.env.PORT || 5555;

// MongoDB connection string from environment configuration
// Should be in format: mongodb://localhost:27017/TalkNest or MongoDB Atlas connection string
const DB_URL = process.env.DB_URL;

/**
 * DATABASE CONNECTION SETUP
 * 
 * Establish connection to MongoDB database using Mongoose ODM.
 * Mongoose provides schema-based modeling, built-in type casting, validation,
 * query building, and business logic hooks.
 * 
 * Connection handling includes:
 * - Success logging for confirmation
 * - Error handling with descriptive messages
 * - Automatic retry logic (built into Mongoose)
 */
mongoose.connect(DB_URL)
.then(() => {
    console.log("✅ Database is Connected Successfully");
    console.log("🔗 Connected to:", DB_URL.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in logs
}).catch((error) => {
    console.error("❌ There was an error connecting to the database:", error.message);
    console.error("💡 Check your DB_URL environment variable and ensure MongoDB is running");
    // In production, you might want to exit the process on DB connection failure
    // process.exit(1);
});

/**
 * MIDDLEWARE CONFIGURATION
 * 
 * Set up the middleware pipeline for request processing. Order matters here!
 * Each middleware function processes requests before they reach route handlers.
 */

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Enables secure communication between frontend (React) and backend (Express).
 * Critical for security - only allows requests from trusted origins.
 * 
 * Configuration:
 * - origin: Frontend URL (React development server or production domain)
 * - methods: Allowed HTTP methods for API operations
 * - credentials: Enables sending cookies (required for JWT auth)
 */
app.use(cors({
    origin: process.env.ORIGIN,                                    // Frontend URL from environment
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],          // Allowed HTTP methods
    credentials: true,                                            // Allow cookies for authentication
}));

/**
 * STATIC FILE SERVING
 * 
 * Serve uploaded files directly via HTTP endpoints.
 * This enables the frontend to access user profile images and message attachments
 * without additional API calls.
 * 
 * Security considerations:
 * - Files should be scanned for malware in production
 * - Consider implementing access control for sensitive files
 * - Set appropriate cache headers for performance
 */
app.use("/upload/profiles", express.static("upload/profiles"));   // User profile images
app.use("/upload/files", express.static("upload/files"));        // Message attachments and files

/**
 * JSON Body Parser
 * 
 * Parse incoming JSON payloads in request bodies.
 * Essential for POST/PUT/PATCH requests that send data.
 * Sets req.body with parsed JSON object.
 */
app.use(express.json());

/**
 * Cookie Parser
 * 
 * Parse HTTP cookies from incoming requests.
 * Required for JWT authentication stored in HTTP-only cookies.
 * Makes cookies available via req.cookies object.
 */
app.use(cookieParser());

/**
 * API ROUTE REGISTRATION
 * 
 * Register all feature-specific route modules with their base paths.
 * This creates a clean separation of concerns and makes the API RESTful.
 * 
 * Route Structure:
 * - /api/auth/*      - User authentication (signup, login, profile management)
 * - /api/contacts/*  - Contact discovery and friend management
 * - /api/messages/*  - Message sending, receiving, and file uploads
 * - /api/channel/*   - Channel/group chat creation and management
 * 
 * Each route module contains its own controller logic and validation.
 */
app.use("/api/auth", authRoutes);        // Authentication endpoints
app.use("/api/contacts", contactsRoutes); // Contact management endpoints
app.use("/api/messages", messagesRoutes); // Message handling endpoints
app.use("/api/channel", channelRoutes);   // Channel/group chat endpoints


/**
 * HEALTH CHECK ENDPOINT
 * 
 * Simple endpoint to verify the server is running and responsive.
 * Useful for load balancers, monitoring systems, and deployment verification.
 * 
 * Returns basic server information and confirms API is accessible.
 */
app.get("/", (req, res) => {
    res.json({
        msg: "TalkNest Backend API is running successfully! 🚀",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            contacts: "/api/contacts", 
            messages: "/api/messages",
            channels: "/api/channel"
        },
        status: "healthy"
    });
});

/**
 * SERVER STARTUP AND SOCKET.IO INTEGRATION
 * 
 * Start the HTTP server and attach Socket.IO for real-time communication.
 * The server handles both REST API requests and WebSocket connections.
 * 
 * Process:
 * 1. Start HTTP server on specified port
 * 2. Attach Socket.IO to the same server instance
 * 3. Enable real-time bidirectional communication for chat features
 */

// Start the HTTP server and store reference for Socket.IO attachment
const server = app.listen(port, () => {
    console.log(`🚀 TalkNest server is running on PORT ${port}`);
    console.log(`📡 API Base URL: http://localhost:${port}`);
    console.log(`🔗 WebSocket ready for real-time messaging`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * Initialize Socket.IO for Real-time Communication
 * 
 * Attach Socket.IO to the HTTP server to enable WebSocket connections.
 * This allows for instant messaging, typing indicators, online status,
 * and other real-time features that HTTP alone cannot provide.
 * 
 * Socket.IO features enabled:
 * - Real-time message delivery
 * - Room-based communication (channels, DMs)
 * - Connection management and user presence
 * - Cross-browser compatibility with fallbacks
 */
setUpSocket(server);

/**
 * 🤔 KEY DESIGN THINKING QUESTIONS FOR SERVER ARCHITECTURE
 * 
 * As you extend and scale this backend server, consider these important questions:
 * 
 * 1. **SCALABILITY & PERFORMANCE**: 
 *    How would you handle increased load and concurrent users? Would you implement:
 *    - Horizontal scaling with load balancers and multiple server instances?
 *    - Database connection pooling and query optimization?
 *    - Redis for session storage and Socket.IO adapter for multi-server communication?
 *    - CDN for static file serving and caching strategies?
 * 
 * 2. **SECURITY & COMPLIANCE**:
 *    What additional security measures should be implemented for production?
 *    - Rate limiting to prevent API abuse and DDoS attacks?
 *    - Input validation and sanitization middleware?
 *    - HTTPS enforcement, security headers, and CSP policies?
 *    - Audit logging for compliance and security monitoring?
 * 
 * 3. **ERROR HANDLING & MONITORING**:
 *    How would you improve error handling and system observability?
 *    - Global error handling middleware with structured logging?
 *    - Health check endpoints for different services (DB, Redis, etc.)?
 *    - Application performance monitoring (APM) and alerting?
 *    - Graceful shutdown handling for zero-downtime deployments?
 * 
 * 4. **CONFIGURATION & DEPLOYMENT**:
 *    How would you make the application more deployment-ready and configurable?
 *    - Configuration validation and environment-specific settings?
 *    - Docker containerization and orchestration (Kubernetes)?
 *    - CI/CD pipeline integration with automated testing?
 *    - Blue-green or rolling deployment strategies?
 * 
 * 5. **API DESIGN & VERSIONING**:
 *    How would you evolve the API while maintaining backward compatibility?
 *    - API versioning strategy (URL path, headers, or query parameters)?
 *    - OpenAPI/Swagger documentation and automated testing?
 *    - GraphQL adoption for more flexible client queries?
 *    - Webhook system for external integrations and notifications?
 */

