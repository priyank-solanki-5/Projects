# Admin and Employee Management Setup

## Overview

This application supports two user roles:
- **Employee**: Default role for regular users
- **Admin**: Privileged role with special access to admin management features

## Admin Key

The admin key is set to: **`admin@12345`**

This key is required when:
- Creating an admin account from the registration form
- Creating an admin account from the Admin Management page

## Creating Accounts

### Creating an Employee Account

1. Go to the registration page
2. Fill in all required fields (name, email, phone, password)
3. Select "Employee" as the role
4. Submit the form

No special key is required for employee accounts.

### Creating an Admin Account

#### Option 1: From Registration Form

1. Go to the registration page
2. Fill in all required fields
3. Select "Admin" as the role
4. Enter the admin key: `admin@12345`
5. Submit the form

#### Option 2: From Admin Management Page

1. Log in as an admin
2. Navigate to "Admin Management" from the sidebar
3. Click "Add Admin"
4. Fill in the admin form:
   - Name
   - Email
   - Mobile Number
   - Password
5. Submit the form

**Note**: The admin key validation happens in the backend to prevent unauthorized admin account creation.

## Initial Admin Account

To create the initial admin account, you can use the seed script:

```bash
cd backend
node scripts/seedAdmin.js
```

This will create an admin account with:
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: admin

## Backend Validation

The backend validates:
1. **Role**: Only "employee" or "admin" roles are allowed
2. **Admin Key**: Required when role is "admin"
3. **Email**: Must be unique
4. **Password**: Must be at least 6 characters

## API Endpoints

### Registration Endpoint
```
POST /api/auth/register
```

**Body for Employee**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "role": "employee"
}
```

**Body for Admin**:
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "9876543210",
  "role": "admin",
  "adminKey": "admin@12345"
}
```

## Security Features

1. **Admin Key Protection**: Admin accounts can only be created with the correct admin key
2. **Role Validation**: Backend enforces only "employee" and "admin" roles
3. **Email Uniqueness**: Each email can only be associated with one account
4. **Password Hashing**: All passwords are hashed using bcrypt before storage
5. **JWT Authentication**: All protected routes require valid JWT tokens

## Database Schema

Users are stored in the `users` collection with the following schema:
- firstName (String, required)
- lastName (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- phone (String, required)
- role (String, enum: ["employee", "admin"], default: "employee")
- isActive (Boolean, default: true)
- lastLogin (Date)
- createdAt (Date)
- updatedAt (Date)

## Changing the Admin Key

To change the admin key, update it in these files:

1. **Frontend** (`client/src/pages/Register.jsx`):
   - Line 33: `const ADMIN_KEY = "admin@12345";`

2. **Backend** (`backend/controller/auth.controller.js`):
   - Line 49: `const ADMIN_KEY = "admin@12345";`

3. **Admin Management** (`backend/controller/admin.controller.js`):
   - Update if you add key validation there

**Security Note**: In production, consider storing the admin key in environment variables instead of hardcoding it.

