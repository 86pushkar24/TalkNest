# 🗨️ TalkNest

A modern, full-stack real-time chat application that enables seamless communication through instant messaging and group channels. Built with cutting-edge web technologies for optimal performance and user experience.

## 🧩 Project Description

**TalkNest** is a comprehensive chat platform supporting real-time 1:1 messaging and group channels with persistent message storage. The application demonstrates modern web development practices with a React frontend, Node.js backend, and real-time WebSocket communication.

### 🛠️ Technologies Used

- **Frontend**: React 18 + Vite, Redux Toolkit, TailwindCSS
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Real-time**: Socket.IO for WebSocket communication
- **File Handling**: Multer for image/file uploads

### ✨ Key Capabilities

- 🔐 Secure user authentication and profile management
- 💬 Real-time messaging via WebSockets with instant delivery
- 👥 Group channels for team communication
- 📱 Direct messaging (DM) between users
- 💾 Message persistence with MongoDB storage
- 📎 File and image sharing capabilities
- 🎨 Responsive, modern UI with dark/light themes
- 🔍 Contact search and discovery
- 📊 Online presence and typing indicators

## 📸 Application Screenshots

### 🔐 Authentication & Onboarding
<!-- Add your login/signup page screenshots here -->
<div align="center">
    <img src="./screenshots/login-page.png" alt="Login Page" width="45%" style="margin-right: 16px;"/>
    <img src="./screenshots/signup-page.png" alt="Signup Page" width="45%" style="margin-left: 16px;"/>
    <p><em>User authentication with clean, modern interface</em></p>
</div>

### 💬 Chat Interface
<!-- Add your main chat interface screenshots here -->
<div align="center">
  <img src="./screenshots/chat-interface.png" alt="Main Chat Interface" width="100%" />
  <p><em>Real-time messaging with intuitive chat layout</em></p>
</div>

### 👥 Group Channels & Direct Messages
<!-- Add group chat and DM screenshots here -->
<div align="center">
    <img src="./screenshots/group-chat.png" alt="Group Channel Chat" width="45%" style="border: 2px  #e0e0e0; margin-right: 16px; border-radius: 8px;" />
    <img src="./screenshots/direct-message.png" alt="Direct Message" width="45%" style="border: 2px  #e0e0e0; margin-left: 16px; border-radius: 8px;" />
    <p><em>Group channels and private messaging capabilities</em></p>
</div>

### 👤 Profile Management
<!-- Add profile page and settings screenshots here -->
<div align="center">
  <img src="./screenshots/profile-page.png" alt="User Profile" width="100%" />
  <p><em>User profile management and customization</em></p>
</div>

### 📱 Responsive Design
<!-- Add mobile/responsive screenshots here -->
<div align="center">
  <img src="./screenshots/mobile-view.png" alt="Mobile Interface" width="30%" />
  <img src="./screenshots/tablet-view.png" alt="Tablet Interface" width="45%" />
  <p><em>Responsive design across all device sizes</em></p>
</div>

---

## ⚙️ Architecture Overview

TalkNest follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    HTTP/WS     ┌─────────────────┐    Mongoose    ┌─────────────────┐
│                 │   Requests     │                 │     ODM        │                 │
│  React Frontend │ ◄─────────────►│ Node.js Backend │ ◄─────────────►│  MongoDB Atlas  │
│                 │                │                 │                │                 │
│  • Redux Store  │                │  • Express API  │                │  • Users        │
│  • Socket.IO    │                │  • Socket.IO    │                │  • Messages     │
│  • Components   │                │  • Controllers  │                │  • Channels     │
└─────────────────┘                └─────────────────┘                └─────────────────┘
```

### 🔄 Data Flow

1. **Authentication**: User signs up/logs in → JWT token stored in HTTP-only cookie
2. **Socket Connection**: Frontend establishes WebSocket connection with user credentials
3. **Real-time Messaging**: Messages sent via Socket.IO → Broadcast to relevant users → Stored in MongoDB
4. **REST API**: Profile updates, file uploads, and contact management via HTTP endpoints
5. **State Management**: Redux manages auth state, chat data, and UI state on the frontend

## 🖼️ Architecture Diagram
<!-- Add your system architecture diagram here -->
<div align="center">
  <img src="./diagrams/system-architecture.png" alt="System Architecture Diagram" width="100%" />
  <p><em>Complete system architecture showing data flow and component interactions</em></p>
</div>

## 🗄️ Database Schema
<!-- Add your database schema diagram here -->
<div align="center">
  <img src="./diagrams/database-schema.png" alt="MongoDB Database Schema" width="100%" />
  <p><em>MongoDB collections, relationships, and data structure for efficient chat storage</em></p>
</div>

## 🔄 API Flow Diagram
<!-- Add your API flow diagram here -->
<div align="center">
  <img src="./diagrams/api-flow-diagram.png" alt="API Flow Diagram" width="100%" />
  <p><em>REST API endpoints and Socket.IO real-time communication flow</em></p>
</div>

---

## 🚀 Features

### 🔐 Authentication & User Management
- User registration and login with secure password hashing
- JWT-based authentication with HTTP-only cookies
- Profile management with avatar upload functionality
- Secure logout with token invalidation

### 💬 Real-time Communication
- Instant message delivery using Socket.IO WebSockets
- Real-time typing indicators and user presence
- Message read receipts and delivery status
- Connection state management with reconnection logic

### 👥 Channel & Contact Management
- Create and join group channels with member management
- Direct messaging between users
- Contact search and friend discovery
- Channel member permissions and administration

### 💾 Data Persistence
- All messages stored in MongoDB for chat history
- User profiles and preferences persistence
- Channel membership and settings storage
- File uploads with secure static serving

### 🎨 Modern UI/UX
- Responsive design for desktop and mobile devices
- Clean, intuitive chat interface
- Message timestamps and user avatars
- Loading states and error handling
- Smooth animations and transitions

## 🎨 Feature Highlights

<!-- ### Real-time Messaging Demo -->
<!-- Add GIF or video showing real-time message delivery -->
<!-- <div align="center">
  <img src="./demos/real-time-messaging.gif" alt="Real-time Messaging Demo" width="70%" />
  <p><em>Live demonstration of instant message delivery across multiple users</em></p>
</div> -->

### File Sharing Capabilities
<!-- Add screenshots showing file upload and sharing -->
<div align="center">
  <img src="./screenshots/file-upload.png" alt="File Upload Interface" width="100%" />
  <!-- <img src="./screenshots/shared-files.png" alt="Shared Files View" width="45%" /> -->
  <p><em>Seamless file sharing with preview capabilities</em></p>
</div>

### Contact Management
<!-- Add screenshots of contact search and management -->
<div align="center">
  <img src="./screenshots/contact-search.png" alt="Contact Search" width="100%" />
  <p><em>Easy contact discovery and friend management</em></p>
</div>

---

## 📁 Project Structure

```
TalkNest/
├── client/                          # React Frontend Application
│   ├── src/
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── Auth.jsx            # Authentication forms
│   │   │   ├── Chat.jsx            # Main chat layout
│   │   │   ├── ChatContainer.jsx   # Chat message display
│   │   │   ├── MessageBar.jsx      # Message input component
│   │   │   ├── ContactsList.jsx    # User contacts sidebar
│   │   │   └── Profile.jsx         # User profile management
│   │   ├── context/
│   │   │   └── SocketContext.jsx   # Socket.IO connection management
│   │   ├── store/                  # Redux Store Configuration
│   │   │   ├── index.js           # Store setup with middleware
│   │   │   └── slices/            # Redux Toolkit slices
│   │   │       ├── authSlice.js   # Authentication state
│   │   │       └── chatSlice.js   # Chat data and messages
│   │   ├── lib/
│   │   │   ├── api-client.js      # HTTP client with interceptors
│   │   │   └── utils.js           # Utility functions
│   │   └── utils/
│   │       └── constants.js       # App-wide constants
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite build configuration
│
├── server/                         # Node.js Backend Application
│   ├── controllers/                # Business Logic Handlers
│   │   ├── AuthController.js      # User authentication logic
│   │   ├── MessagesController.js  # Message CRUD operations
│   │   ├── ContactsController.js  # Contact management
│   │   └── ChannelController.js   # Channel/group management
│   ├── models/                     # MongoDB Data Models
│   │   ├── user.model.js          # User schema with auth
│   │   ├── messages.model.js      # Message schema
│   │   └── channel.model.js       # Channel/group schema
│   ├── routes/                     # Express Route Definitions
│   │   ├── AuthRoutes.js          # Authentication endpoints
│   │   ├── MessagesRoutes.js      # Message API routes
│   │   ├── ContactsRoutes.js      # Contact API routes
│   │   └── ChannelRoutes.js       # Channel API routes
│   ├── middlewares/
│   │   └── AuthMiddleware.js      # JWT verification middleware
│   ├── upload/                     # File Upload Storage
│   │   ├── profiles/              # User profile images
│   │   └── files/                 # Message attachments
│   ├── socket.js                   # Socket.IO server setup
│   ├── index.js                    # Express app entry point
│   └── package.json               # Backend dependencies
│
└── README.md                       # Project documentation
```

## 📂 Screenshots Directory Structure
```
screenshots/
├── login-page.png                  # User login interface
├── signup-page.png                 # User registration form
├── chat-interface.png              # Main chat dashboard
├── group-chat.png                  # Group channel conversation
├── direct-message.png              # Private messaging interface
├── profile-page.png                # User profile management
├── contact-search.png              # Contact discovery interface
├── file-upload.png                 # File sharing interface
├── shared-files.png                # File management view
├── mobile-view.png                 # Mobile responsive design
└── tablet-view.png                 # Tablet responsive design

<!-- demos/
├── real-time-messaging.gif         # Live messaging demonstration
├── user-onboarding.gif             # Registration and setup flow
└── feature-overview.mp4            # Complete application walkthrough -->

diagrams/
├── system-architecture.png         # Technical architecture diagram
├── database-schema.png             # MongoDB collection relationships
└── api-flow-diagram.png            # REST API and Socket.IO flow
```

---

## 🛠️ Installation & Setup

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account) - [Setup guide](https://docs.mongodb.com/manual/installation/)
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd TalkNest
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create environment variables file
cp .env.example .env

# Edit .env file with your configuration:
# DB_URL=mongodb://localhost:27017/TalkNest
# OR DB_URL=mongodb+srv://username:password@cluster.mongodb.net/TalkNest
# ORIGIN=http://localhost:5173
# JWT_SECRET=your-super-secret-jwt-key
# PORT=5555
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install frontend dependencies
npm install

# Create environment variables file (if needed)
# Create .env file for any frontend-specific variables
```

### 4. Database Configuration

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod

# MongoDB will be available at mongodb://localhost:27017
```

**Option B: MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster
3. Get connection string and add to server/.env

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev

# Server will start on http://localhost:5555
# You should see:
# ✅ Database is Connected Successfully
# 🚀 TalkNest server is running on PORT 5555
# 🔗 WebSocket ready for real-time messaging
```

**Terminal 2 - Frontend Development Server:**
```bash
cd client
npm run dev

# Frontend will start on http://localhost:5173
# Vite dev server with hot reload enabled
```

### Production Build

```bash
# Build frontend for production
cd client
npm run build

# The build files will be in client/dist/
# You can serve these with any static file server
```

### 🌐 Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5555
- **Health Check**: http://localhost:5555/ (API status)

## 🎯 Quick Start Demo
<!-- Add a quick demo GIF showing the application in action -->
<div align="center">
  <img src="./demos/quick-start-demo.gif" alt="Quick Start Demo" width="100%" />
  <p><em>60-second overview: From signup to sending your first message</em></p>
</div>

---

## 🧪 Testing & Usage Guide

### 👥 Multi-User Testing

1. **Create Test Accounts**:
   - Open the application in two different browsers or incognito windows
   - Register two different user accounts (e.g., alice@test.com, bob@test.com)

2. **Test Direct Messaging**:
   - Log in as Alice in browser 1
   - Log in as Bob in browser 2  
   - Alice searches for Bob in contacts
   - Start a direct message conversation
   - Send messages and verify real-time delivery

3. **Test Group Channels**:
   - Create a new channel as Alice
   - Add Bob to the channel
   - Send group messages and verify all members receive them

4. **Test File Sharing**:
   - Upload profile pictures
   - Share files in messages
   - Verify files are accessible via static URLs

### 🔍 Development Debugging

**Frontend Debugging:**
```bash
# Check browser console for Socket.IO connection logs
# Redux DevTools for state inspection
# Network tab for API call monitoring
```

**Backend Debugging:**
```bash
# Server logs show:
# - Database connection status
# - Socket.IO connection events
# - API request logs
# - Error messages with stack traces
```

**Socket.IO Connection Testing:**
```javascript
// In browser console:
window.socket.emit('test-event', { message: 'Hello Server!' });
```

<!-- ### 🧪 Testing Checklist

- [ ] User registration and login
- [ ] Profile picture upload
- [ ] Real-time message delivery
- [ ] Message persistence after refresh
- [ ] Contact search functionality
- [ ] Channel creation and joining
- [ ] File upload and sharing
- [ ] Multiple browser/device synchronization
- [ ] Network disconnection recovery -->

<!-- ## 📱 Testing Screenshots
<!-- Add screenshots showing the testing process -->
<!-- <div align="center">
  <img src="./screenshots/multi-user-testing.png" alt="Multi-user Testing Setup" width="100%" />
  <p><em>Testing real-time messaging across multiple browser windows</em></p> -->
</div> -->

---

## ⚠️ Known Limitations & Future Enhancements

### Current Limitations

- 🚫 **Message Management**: No editing or deletion of sent messages
- 🔕 **Push Notifications**: No browser or mobile push notifications
- 🔐 **End-to-End Encryption**: Messages are not encrypted in transit/storage
- 👀 **Read Receipts**: Limited read status tracking
- 🎥 **Media Calls**: No voice/video calling functionality
- 📱 **Mobile App**: Web-only, no native mobile applications

### 🚀 Planned Future Enhancements

**Short Term (v2.0)**:
- ✏️ Message editing and deletion
- 👀 Enhanced read receipts and typing indicators
- 🔍 Message search and filtering
- 📎 Better file upload management with previews
- 🎨 UI/UX improvements and accessibility features

**Medium Term (v3.0)**:
- 🔔 Push notification system
- 📱 Progressive Web App (PWA) support
- 🌙 Advanced theme customization
- 👥 Channel administration and moderation tools
- 📊 User presence and status management

**Long Term (v4.0)**:
- 🔐 End-to-end message encryption
- 🎥 Voice and video calling integration
- 📱 React Native mobile applications
- 🤖 Bot and webhook integrations
- 📈 Analytics and reporting dashboard

---

## 🤝 Contributing

We welcome contributions to TalkNest! Here's how you can help:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper documentation
4. **Test thoroughly** on both frontend and backend
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with detailed description

### 📋 Contribution Guidelines

- Follow existing code style and conventions
- Add comprehensive comments for complex logic
- Test all changes across different browsers
- Update documentation for new features
- Ensure backwards compatibility
- Add proper error handling

### 🐛 Bug Reports

Please use GitHub Issues and include:
- Clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser/Node.js version information
- Screenshots or error logs if applicable

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Socket.IO** for excellent real-time communication
- **MongoDB** for robust data persistence
- **React Team** for the amazing frontend framework
- **Express.js** for the lightweight backend framework
- **Open Source Community** for inspiration and resources

---

## 📞 Support & Contact

- 📧 **Email**: guptapushkar86@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/86.pushkar.24/TalkNest/issues)
- 📖 **Documentation**: [Wiki](https://github.com/86.pushkar.24/TalkNest/wiki)

---

<div align="center">

**Built with ❤️ by the TalkNest Team**

If you find this project helpful, please give it a ⭐ on GitHub!

[⬆ Back to top](#-TalkNest)

</div>

---
