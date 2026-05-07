# AjaiaDocs - Collaborative Document Editor

A production-quality full-stack collaborative document editor inspired by Google Docs, built with React, Node.js, and Supabase.

## Features
- **Authentication**: Secure login/signup via Supabase.
- **Dashboard**: Manage documents with "My Documents" and "Shared With Me" views.
- **Rich Text Editor**: Powered by Tiptap with support for formatting, headings, and lists.
- **Auto-save**: Real-time debounced persistence to the database.
- **Sharing**: Share documents with other users via email.
- **File Import**: Support for importing `.txt` and `.md` files.
- **Modern UI**: Polished design using TailwindCSS and Lucide icons.

## Tech Stack
- **Frontend**: React (Vite), TailwindCSS, React Query, Lucide React, Sonner (Toasts), Tiptap.
- **Backend**: Node.js, Express, Multer.
- **Database/Auth**: Supabase.

## Setup Instructions

### 1. Database Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Run the provided `supabase_schema.sql` in the Supabase SQL Editor.
3. Enable Email/Password auth in the Supabase Dashboard.

### 2. Environment Variables
Create `.env` files in both `client` and `server` directories.

**Client (`client/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

**Server (`server/.env`):**
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CLIENT_URL=http://localhost:5173
```

### 3. Installation
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start Backend
cd server && npm start

# Start Frontend
cd client && npm run dev
```

## Demo Credentials
- **User 1**: `priyansh@test.com` / `password123`
- **User 2**: `demo@test.com` / `demo`

## Testing
```bash
cd server && npm test
```
