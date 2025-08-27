# NextAuth v5 Authentication Setup

This document provides instructions for setting up NextAuth v5 authentication in your Olympiad webapp.

## Features

- ✅ Email/password authentication
- ✅ User registration and login
- ✅ Protected routes with middleware
- ✅ User dashboard with progress tracking
- ✅ Video lectures and practice problems (protected content)
- ✅ User profile management
- ✅ MongoDB integration for user storage

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
AUTH_SECRET=your-auth-secret-here
AUTH_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/olympiad-webapp

# Email Configuration (optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@olympiadwebapp.com
```

### 2. Generate Auth Secret

Generate a secure random string for `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 3. MongoDB Setup

Ensure MongoDB is running and accessible. The app will automatically create the necessary collections.

### 4. Install Dependencies

All required dependencies are already installed:

- `next-auth@beta` - NextAuth v5
- `@auth/mongodb-adapter` - MongoDB adapter for NextAuth
- `bcryptjs` - Password hashing
- `@heroicons/react` - Icons

### 5. Database Schema

The app creates a `User` collection with the following schema:

```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  role: 'student' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

## Protected Routes

The following routes require authentication:

- `/dashboard` - User dashboard
- `/training/*` - Training materials
- `/video-lectures` - Video content
- `/practice-problems` - Practice problems
- `/progress` - Progress tracking
- `/profile` - User profile

## Authentication Flow

1. **Registration**: Users can create accounts at `/auth/signup`
2. **Login**: Users can sign in at `/auth/signin`
3. **Middleware**: Automatically redirects unauthenticated users to signin
4. **Session**: JWT-based sessions with user role information
5. **Logout**: Users can sign out from the navbar dropdown

## User Roles

- `student` - Default role for registered users
- `admin` - Administrative access (can be manually set in database)

## API Endpoints

- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

## Customization

### Adding New Protected Routes

1. Add the route path to the `protectedRoutes` array in `src/middleware.ts`
2. Create the page component with authentication check:

```typescript
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }
  
  return <div>Protected content</div>
}
```

### Adding New Authentication Providers

1. Install the provider package
2. Add the provider to `src/lib/auth.ts`
3. Configure environment variables for the provider

### Customizing User Model

Modify `src/models/User.ts` to add additional fields to the user schema.

## Security Features

- Password hashing with bcrypt
- JWT-based sessions
- CSRF protection
- Secure cookie handling
- Input validation
- Rate limiting (can be added)

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and the URI is correct
2. **Auth Secret**: Make sure `AUTH_SECRET` is set and secure
3. **Environment Variables**: Verify all required variables are set
4. **Port Conflicts**: Ensure port 3000 is available

### Debug Mode

Enable debug mode by adding to `.env.local`:

```env
NEXTAUTH_DEBUG=true
```

## Production Deployment

1. Set production environment variables
2. Use a production MongoDB instance
3. Configure proper domain in `AUTH_URL`
4. Set up HTTPS
5. Consider adding rate limiting and additional security measures

## Support

For issues related to:
- NextAuth: Check the [NextAuth documentation](https://next-auth.js.org/)
- MongoDB: Check the [MongoDB documentation](https://docs.mongodb.com/)
- Next.js: Check the [Next.js documentation](https://nextjs.org/docs)
