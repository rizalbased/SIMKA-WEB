# SIMKA Digital Signage EMKA

A full-stack Digital Signage application built with Vite, React, TypeScript, and Supabase.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion
- **Backend/Database**: Supabase (PostgreSQL, Storage, Realtime)

## Features
- Dynamic Slides (Photos, Videos, Posters, Grid)
- Real-time Running Text
- Real-time Lesson Schedule (Jadwal Les)
- Fullscreen TV Display Mode
- Admin Dashboard for Media & Content Management

## Project Structure
- `/src/services/`: Supabase data access layer
- `/src/components/admin/`: Admin management interfaces
- `/src/components/display/`: Digital signage display components
- `/supabase/schema.sql`: Database schema & RLS policies

## Setup Instructions

### 1. Supabase Configuration
1. Create a new project in [Supabase](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `/supabase/schema.sql`.
3. Go to **Storage**:
   - Create a bucket named `media`.
   - Create a bucket named `videos`.
   - (RLS policies for storage are included in `schema.sql`).

### 2. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment
This project is ready for deployment to platforms like Vercel, Netlify, or Cloud Run.
Ensure you set the Environment Variables in your deployment platform's settings.

## Important Notes
- **Supabase is the Source of Truth**: Data is synced in real-time across all connected displays.
- **Media Storage**: Photos and videos are stored in Supabase Storage.
- **RLS Policies**: Default policies allow public read and authenticated/anon write for the preview environment. Hardening is recommended for production.
