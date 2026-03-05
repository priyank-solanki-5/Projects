# Authentication System Setup Guide

This guide explains how to set up and use the complete authentication system for the Book Management application.

## 🚀 Features Implemented

### Backend Features
- ✅ User registration with validation
- ✅ User login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication middleware
- ✅ Role-based authorization
- ✅ User profile management
- ✅ Protected routes
- ✅ Error handling and validation

### Frontend Features
- ✅ Modern login page with form validation
- ✅ User registration page with comprehensive validation
- ✅ Authentication context for state management
- ✅ Protected route component
- ✅ Automatic token management
- ✅ User profile management
- ✅ Logout functionality
- ✅ Loading states and error handling

## 📁 Files Created/Modified

### Backend Files
```
backend/
├── models/user.models.js          # User schema with validation
├── controller/auth.controller.js  # Authentication logic
├── middleware/auth.middleware.js  # JWT middleware
├── routes/auth.routes.js          # Authentication routes
└── server.js                      # Updated with auth routes
```

### Frontend Files
```
client/src/
├── context/AuthContext.jsx        # Authentication context
├── pages/Login.jsx                # Login page
├── pages/Register.jsx             # Registration page
├── pages/Profile.jsx              # User profile page
├── components/ProtectedRoute.jsx  # Route protection
├── components/Navbar.jsx          # Updated with auth
├── components/Sidebar.jsx         # Updated with auth
└── App.jsx                        # Updated routing
```

## 🛠️ Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install bcryptjs jsonwebtoken
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/BookManagement
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

### 2. Frontend Setup

1. **Install Dependencies** (if needed)
   ```bash
   cd client
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   cd client
   npm run dev
   ```

## 🔐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| GET | `/api/auth/health` | Health check | No |

### Request/Response Examples

#### Register User
```javascript
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "employee"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

#### Login User
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

## 🎯 Usage Guide

### 1. User Registration
- Navigate to `/register`
- Fill in all required fields
- Choose appropriate role (employee, manager, admin, customer)
- Submit form to create account

### 2. User Login
- Navigate to `/login`
- Enter email and password
- System will redirect to dashboard on success

### 3. Profile Management
- Navigate to `/profile`
- View current profile information
- Click "Edit Profile" to update information
- Save changes to update profile

### 4. Logout
- Click logout button in navbar
- System will clear authentication and redirect to login

## 🔒 Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 12
- Passwords are never stored in plain text
- Password comparison is done securely

### JWT Token Security
- Tokens expire after 7 days (configurable)
- Tokens are validated on each request
- Invalid/expired tokens are rejected

### Input Validation
- Email format validation
- Phone number validation (10 digits)
- Password length validation (minimum 6 characters)
- Name length validation (minimum 2 characters)

### Role-Based Access
- Different user roles: admin, manager, employee, customer
- Role information stored in JWT token
- Can be extended for role-based route protection

## 🐛 Error Handling

### Backend Error Handling
- Comprehensive error messages
- Validation error details
- Database error handling
- JWT error handling

### Frontend Error Handling
- Form validation errors
- Network error handling
- Authentication error handling
- User-friendly error messages

## 🚀 Testing the System

### 1. Test Registration
1. Go to `/register`
2. Fill in the form with valid data
3. Submit and verify account creation
4. Check that you're automatically logged in

### 2. Test Login
1. Go to `/login`
2. Enter valid credentials
3. Verify successful login and redirect

### 3. Test Profile Management
1. Go to `/profile`
2. View your profile information
3. Edit and update your profile
4. Verify changes are saved

### 4. Test Logout
1. Click logout button
2. Verify you're redirected to login page
3. Verify you can't access protected routes

## 🔧 Customization

### Adding New User Roles
1. Update the role enum in `user.models.js`
2. Add role validation in registration
3. Update frontend role selection

### Extending User Profile
1. Add new fields to user schema
2. Update registration form
3. Update profile management page
4. Update authentication context

### Adding Protected Routes
1. Use `ProtectedRoute` component
2. Specify required role if needed
3. Add route to App.jsx

## 📝 Notes

- All passwords are hashed before storage
- JWT tokens are stored in localStorage
- Authentication state is managed globally
- All API calls include proper error handling
- Form validation is comprehensive
- UI is responsive and user-friendly

## 🎉 Success!

Your authentication system is now fully functional! Users can:
- Register new accounts
- Login with credentials
- Manage their profiles
- Access protected routes
- Logout securely

The system includes proper security measures, validation, and error handling for a production-ready authentication experience.
