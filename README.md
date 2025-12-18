# SimpleResu.me

<img width="584" alt="Screenshot 2024-12-25 at 3 57 41 PM" src="https://github.com/user-attachments/assets/95d817d8-6d61-41a3-8298-7d57fddec1cd" />

**Transforming Your Professional Profile Into a Standout Resume**

Generate professional resumes effortlessly using data from LinkedIn and GitHub. SimpleResu.me makes resume creation quick, simple, and customizable with a modern tech stack built for Vercel deployment.

## ✨ Features

- 📝 **Resume Builder**: Create beautiful resumes with real-time preview
- 🔗 **LinkedIn Integration**: Import your professional profile automatically
- 💻 **GitHub Integration**: Showcase your repositories and contributions
- 🎨 **Multiple Templates**: Choose from various professional resume designs
- 🔐 **Secure Authentication**: Powered by Clerk for seamless login (Google OAuth, Email, etc.)
- ⚡ **Automatic User Sync**: Users automatically synced to database on first login
- ☁️ **Cloud Storage**: All your data safely stored in Supabase
- 📚 **Interactive API Docs**: Swagger UI at `/api-docs` for testing APIs
- 🌓 **Dark Mode**: Built-in theme support for comfortable viewing
- 📱 **Responsive Design**: Works beautifully on all devices

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Rich Text**: TipTap Editor
- **Drag & Drop**: dnd-kit
- **Validation**: Zod

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Clerk account ([clerk.com](https://clerk.com))
- Supabase project ([supabase.com](https://supabase.com))
- LinkedIn API credentials (optional, for OAuth)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/simpleresu.me.git
   cd simpleresu.me
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Use the provided example file as a starting point:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and fill in your own keys:

   - **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - **Resend** (emails): `RESEND_API_KEY`, `FROM_EMAIL`
   - **Google Analytics** (optional): `GA_TRACKING_ID`
   - **App URL**: `NEXT_PUBLIC_APP_URL` (usually `http://localhost:3000` for local dev)

4. **Set up the database**

   - Go to your Supabase project dashboard
   - Navigate to the **SQL Editor**
   - Run the migration script from `supabase-full-migration.sql`

   ```bash
   # The SQL file is located at:
   # ./supabase-full-migration.sql
   ```

   This will create all necessary tables for:
   - `users` - User profiles and email preferences
   - `feedback` - User feedback (with admin replies)
   - `bug_reports` - Bug reports (status, comments, screenshots)
   - `admins` - Admin accounts for the custom admin panel

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
simpleresu.me/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── lib/                  # API utilities
│   │   │   ├── auth.ts           # Clerk authentication helper
│   │   │   ├── errors.ts         # Error handling
│   │   │   ├── supabase-server.ts # Supabase admin client
│   │   │   └── validation.ts     # Zod schemas
│   │   ├── users/sync/           # User sync endpoint
│   │   ├── resumes/              # Resume CRUD endpoints
│   │   └── linkedin/             # LinkedIn OAuth handlers
│   ├── resume-builder/           # Resume builder page
│   ├── sign-in/                  # Auth pages
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── resume-templates/         # Resume templates
│   └── resume-sections/          # Resume section components
├── lib/                          # Utilities
│   ├── supabase.ts               # Supabase client
│   ├── github-api.ts             # GitHub API helper
│   └── utils.ts                  # Helper functions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types
│   └── resume.ts                 # Resume types
├── public/                       # Static assets
├── middleware.ts                 # Clerk middleware
├── supabase-migration.sql        # Database schema
└── package.json                  # Dependencies
```

---

## 🧑‍💻 Contributing & Local Setup

Want to hack on SimpleResu.me locally?

- **Fork & clone**
  - Fork this repo on GitHub, then:
  - `git clone <your-fork-url> && cd simpleresu.me`
  - Install deps with `pnpm install` (or `npm install` / `yarn`).

- **Environment variables**
  - Copy the example file: `cp .env.example .env.local`
  - Fill in your own keys (do **not** reuse production keys):
    - Create a **Clerk** app → set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
    - Create a **Supabase** project → set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
    - Create a **Resend** account & domain (for emails) → set `RESEND_API_KEY`, `FROM_EMAIL`
    - Optionally add `GA_TRACKING_ID` if you want Google Analytics locally.

- **Supabase schema**
  - In Supabase, open the SQL editor and run `supabase-full-migration.sql`.
  - This creates all app tables: users, feedback, bug_reports, admins, etc.
  - Create at least one admin user manually (example, don’t commit this):

    ```sql
    INSERT INTO admins (username, password)
    VALUES ('admin', 'your-strong-password');
    ```

- **Run the app**
  - Start dev server: `pnpm dev`
  - App: `http://localhost:3000`
  - Admin login: `http://localhost:3000/admin/login` (use the admin user you inserted).

When opening a PR, please mention any schema or env changes so others can keep their setup in sync.

---

## 🔌 API Documentation

### Interactive API Documentation

Visit **[/api-docs](/api-docs)** for interactive Swagger UI documentation where you can:
- View all API endpoints
- See request/response schemas
- Test APIs directly in your browser
- Get authentication examples

### Authentication

All API routes (except LinkedIn OAuth) require Clerk authentication. Include the Clerk session token in requests.

**Automatic User Sync**: When a user logs in via Clerk (Google OAuth, email, etc.), they are automatically synced to the Supabase database. This happens transparently in the background using the `UserSyncProvider` component.

### Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
Swagger UI: http://localhost:3000/api-docs
```

### Endpoints

#### **User Management**

##### Sync User
```http
POST /api/users/sync
```

Sync Clerk user with Supabase database. Call this once after user signs in for the first time.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "clerk_user_id": "clerk_user_id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

#### **Resumes**

##### Get All Resumes
```http
GET /api/resumes
```

Get all resumes for the authenticated user.

**Response:**
```json
{
  "resumes": [
    {
      "id": "uuid",
      "name": "My Resume",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "positions": [...],
      "educations": [...],
      "skills": [...],
      "config": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

##### Create Resume
```http
POST /api/resumes
```

**Request Body:**
```json
{
  "name": "My Resume",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "headline": "Software Engineer",
  "summary": "Experienced developer...",
  "positions": [
    {
      "title": "Senior Developer",
      "company": "Tech Corp",
      "startDate": "2020-01",
      "endDate": "Present",
      "description": "Led development team..."
    }
  ],
  "educations": [...],
  "skills": [{ "name": "JavaScript" }],
  "config": {
    "showPhoto": true,
    "showSummary": true,
    "showExperience": true
  }
}
```

**Response:** `201 Created`
```json
{
  "resume": { ... }
}
```

##### Get Resume by ID
```http
GET /api/resumes/:id
```

##### Update Resume
```http
PUT /api/resumes/:id
```

**Request Body:** Partial resume data (any fields from create)

##### Delete Resume
```http
DELETE /api/resumes/:id
```

Soft delete (sets `is_active` to false).

**Response:**
```json
{
  "success": true
}
```

---

## 🗄️ Database Schema

### Tables

#### `users`
- `id` (UUID, PK)
- `clerk_user_id` (TEXT, UNIQUE) - Synced with Clerk
- `email` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

#### `resumes`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `name` (TEXT) - Resume title
- Personal info: `first_name`, `last_name`, `email`, `headline`, `summary`, `location`, `phone_number`
- Social: `linkedin_id`, `github_id`
- Complex data (JSONB): `positions`, `educations`, `skills`, `projects`, `certifications`, `custom_sections`
- Configuration (JSONB): `config` - visibility toggles
- Metadata: `template`, `zoom`, `is_active`, `created_at`, `updated_at`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `title` (TEXT) - Custom status name
- `color` (TEXT) - Tailwind class
- `is_default` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

---

## 🌐 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import project to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

   Add all variables from your `.env` file in the Vercel dashboard:
   - Project Settings → Environment Variables
   - Add each variable for Production, Preview, and Development

4. **Deploy**

   Vercel will automatically deploy your app. Each push to `main` triggers a new deployment.

### Environment Variables for Vercel

Make sure to add these in Vercel:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_LINKEDIN_CLIENT_ID (optional)
LINKEDIN_CLIENT_SECRET (optional)
NEXT_PUBLIC_APP_URL
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run analyze      # Analyze bundle size
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Integrated with Tailwind
- **Validation**: Zod schemas for API routes

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** - The React Framework
- **Clerk** - User authentication
- **Supabase** - Backend as a Service
- **Vercel** - Deployment platform
- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible components
- **TailwindCSS** - Utility-first CSS

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/simpleresu.me/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/simpleresu.me/discussions)
- **Email**: support@simpleresu.me

---

## 🗺️ Roadmap

- [ ] PDF Export functionality
- [ ] Email resume sharing
- [ ] Resume analytics
- [ ] AI-powered resume suggestions
- [ ] Cover letter generator
- [ ] Mobile app (React Native)
- [ ] Resume templates marketplace
- [ ] Interview prep integration

---

Made with ❤️ by the SimpleResu.me team
