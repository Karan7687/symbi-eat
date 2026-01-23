# Role-Based Authentication Setup

This document explains the role-based authentication system implemented for Symbi-Eat.

## Features

### 1. Role-Based User Model
- Users have a `role` field with enum values: `admin` or `customer`
- Default role is `customer`
- Proper validation at database level

### 2. Admin Login System
- **Admin Credentials:**
  - Username: `admin`
  - Password: `admin@123`
- Admin login uses special authentication logic that checks for these credentials
- Upon successful admin login, user is redirected to `/admin/orders`

### 3. Customer Login System
- Customers log in with their email and password
- Upon successful login, customers are redirected to `/customer/orders`

### 4. Admin Management
- Admin can update their credentials via `/admin/settings`
- Can change email and password
- Password must be at least 6 characters
- Current password verification required for changes

## Setup Instructions

### 1. Seed the Admin User
Run the seed script to create the default admin user:

```bash
npm run seed-admin
```

This will create an admin user with:
- Email: `admin@symbieat.com`
- Password: `admin@123`
- Role: `admin`

### 2. Environment Variables
Make sure your `.env` file contains:
```
MONGO_URL=mongodb://localhost:27017/symbieat
SESSION_SECRET=your-secret-key-here
```

## Usage

### Admin Login
1. Go to `/login`
2. Enter username: `admin`
3. Enter password: `admin@123`
4. You'll be redirected to `/admin/orders`

### Customer Login
1. Go to `/login`
2. Enter customer email and password
3. You'll be redirected to `/customer/orders`

### Admin Settings
1. Log in as admin
2. Go to `/admin/settings`
3. Update email and/or password as needed
4. Click "Update Credentials"

## Security Features

- Passwords are hashed using bcrypt
- Session management with MongoDB store
- Role-based route protection
- Input validation and sanitization
- CSRF protection (if implemented)

## Database Schema

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'customer'], default: 'customer'),
  timestamps: true
}
```

## Future Enhancements

- Add more user roles (e.g., 'manager', 'staff')
- Implement password reset functionality
- Add two-factor authentication
- Implement account lockout after failed attempts
- Add audit logging for admin actions
