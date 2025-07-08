// =====================================
// API CLIENT - AXIOS CONFIGURATION FOR BACKEND COMMUNICATION
// =====================================
// This module configures and exports an Axios instance for making HTTP requests
// to the TalkNest backend API. It provides centralized configuration for
// all API calls throughout the frontend application.

import axios from "axios";
import {HOST} from "../utils/constants.js"

/**
 * Configured Axios instance for backend API communication
 * 
 * This pre-configured axios instance handles all HTTP requests to the backend
 * with consistent base URL and configuration settings.
 * 
 * Configuration:
 * - baseURL: Points to backend server (from constants)
 * - Credentials: Automatically includes cookies for authentication
 * - Headers: Default content-type and other necessary headers
 * 
 * Usage Examples:
 * - apiClient.post('/api/auth/login', credentials)
 * - apiClient.get('/api/messages/get-messages')
 * - apiClient.post('/api/channels/create', channelData)
 * 
 * Authentication:
 * - JWT tokens are sent via HTTP-only cookies
 * - No manual token management required
 * - Automatic authentication for protected routes
 */
export const apiClient = axios.create({
    baseURL : HOST,
    withCredentials: true,  // Include cookies for authentication
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,  // 10 second timeout for requests
})

// =====================================
// REQUEST INTERCEPTOR (Optional Enhancement)
// =====================================
// TODO: Add request interceptor for common functionality:
// apiClient.interceptors.request.use(
//     (config) => {
//         // Add request logging, auth headers, etc.
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// =====================================
// RESPONSE INTERCEPTOR (Optional Enhancement)
// =====================================
// TODO: Add response interceptor for error handling:
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // Handle common errors (401, 403, 500)
//         // Redirect to login on authentication failure
//         // Show toast notifications for errors
//         return Promise.reject(error);
//     }
// );

// =====================================
// DESIGN THINKING QUESTIONS
// =====================================

/*
🔧 API CLIENT ENHANCEMENT:
1. Error Handling: Should we implement centralized error handling, automatic retry logic, and user-friendly error messages for different API failure scenarios?

🚀 PERFORMANCE:
2. Request Optimization: How would we add request/response caching, request deduplication, and loading state management for better user experience?

🔐 SECURITY:
3. API Security: Should we implement request signing, rate limiting protection, and secure header management for sensitive operations?

📱 OFFLINE SUPPORT:
4. Connectivity: How would we handle offline scenarios, queue failed requests, and implement background sync when connection is restored?

🛠️ DEVELOPMENT:
5. Developer Experience: Should we add request/response logging, API mocking capabilities, and TypeScript integration for better development workflow?
*/