# Auth Next

A complete authentication system built with Next.js, Better Auth, and Drizzle ORM.

## Features

- **Sign In / Sign Up**: Email and password authentication
- **Magic Link**: Passwordless sign-in via email
- **Email Verification**: Account verification via email
- **Password Reset**: Secure password reset functionality
- **Social Login**: Google OAuth integration
- **Organization Support**: Multi-tenant organization management
- **Database**: PostgreSQL with Drizzle ORM

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   - Create a PostgreSQL database
   - Update `DATABASE_URL` in `.env.local`

3. **Configure environment variables:**
   - Copy `.env.local` and fill in your values
   - Set up email provider (Gmail, etc.)
   - Configure Google OAuth if needed

4. **Run database migrations:**
   ```bash
   # Generate migration
   npx drizzle-kit generate

   # Run migration
   npx drizzle-kit migrate
   ```

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
- **Drizzle ORM**: Database ORM
- **PostgreSQL**: Database
- **Tailwind CSS**: Styling
- **React Hook Form**: Form handling
- **Zod**: Validation
- **RizzUI**: UI components
- **Nodemailer**: Email sending

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/auth_next"

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
 sonar \
  -Dsonar.host.url=http://localhost:9000 \ 
  -Dsonar.token=sqp_5535d3ce4c90132f4d922c3bd90e8e921fd402aa \
  -Dsonar.projectKey=authenticationsonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_6f7458eb56944d3ed899e7e21a1abd6e606dd05f \
  -Dsonar.projectKey=authentication
  ```


## License

MIT
