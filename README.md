# Auth Next

A complete authentication system built with Next.js, Better Auth, and MongoDB.

## Features

- **Sign In / Sign Up**: Email and password authentication
- **Magic Link**: Passwordless sign-in via email
- **Email Verification**: Account verification via email
- **Password Reset**: Secure password reset functionality
- **Social Login**: Google OAuth integration
- **Organization Support**: Multi-tenant organization management
- **Database**: MongoDB

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   - Set up MongoDB (local or cloud)
   - Update `MONGODB_URI` in `.env.local`

3. **Configure environment variables:**
   - Copy `.env.local` and fill in your values
   - Set up email provider (Gmail, etc.)
   - Configure Google OAuth if needed

4. **Database setup:**
   - MongoDB is schema-less, no migrations needed

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...all]/route.ts    # Better Auth API routes
│   ├── auth/                         # Authentication pages
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── check-email/
│   │   └── verify-email/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── config/
│   ├── mail.ts                       # Email configuration
│   ├── routes.ts                     # Route definitions
│   └── site.config.ts                # Site configuration
├── core/                             # Core UI components
├── hooks/                            # Custom hooks
├── lib/
│   ├── auth.ts                       # Better Auth configuration
│   ├── auth-client.ts                # Auth client
│   ├── db.ts                         # Database connection
│   └── schema.ts                     # Database schema
├── utils/
│   └── auth-storage.ts               # Auth token storage
└── validators/                       # Form validation schemas
```

## Authentication Flow

1. **Sign Up**: User creates account → Email verification sent
2. **Email Verification**: User clicks verification link → Account activated
3. **Sign In**: User can sign in with email/password or magic link
4. **Magic Link**: User enters email → Magic link sent → Click link to sign in
5. **Password Reset**: User requests reset → Reset email sent → Set new password

## Technologies Used

- **Next.js 15**: React framework
- **Better Auth**: Authentication library
- **MongoDB**: Database
- **Tailwind CSS**: Styling
- **React Hook Form**: Form handling
- **Zod**: Validation
- **RizzUI**: UI components
- **Nodemailer**: Email sending

## Environment Variables

```env
# Database
MONGODB_URI="mongodb://localhost:27017/auth_next"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-here-minimum-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="noreply@yourdomain.com"
```
## Sonar
``` 
  sonar \  -Dsonar.host.url=http://localhost:9000 \ 
  -Dsonartoken=sqp_06aa43b009f1913b6d14553b78400f9fd9c5ee \
   -Dsonar.projectKey=authentication
  ```


## License

MIT
