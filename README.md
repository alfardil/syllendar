# Syllendar 📅

A modern student planning app that helps you manage your academic life with style.

## Features

- **Upload Syllabus**: Upload and review course information
- **Calendar Integration**: Sync important dates to your calendar
- **Grade Tracking**: Monitor your academic progress
- **Study Resources**: Get personalized study recommendations
- **Modern UI**: Neobrutalism design that's fun and functional

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with Neobrutalism components
- **UI Components**: Shadcn UI
- **Authentication**: NextAuth.js with Google OAuth
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your Google OAuth credentials
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                # Utilities and API client
└── public/             # Static assets
```

## Pages

- `/` - Landing page
- `/upload` - Upload syllabus
- `/review` - Review extracted events
- `/calendar` - Sync to calendar
- `/grades` - Track grades
- `/resources` - Study resources
- `/dashboard` - User dashboard

Built with ❤️ for students 