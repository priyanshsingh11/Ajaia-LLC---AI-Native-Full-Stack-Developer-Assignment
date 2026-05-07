# Architecture Decisions

## Tech Stack Choice
- **React + Vite**: Chosen for fast development cycle and modern frontend features. Vite's HMR provides an excellent developer experience.
- **Tiptap**: A headless rich-text editor framework that allows full control over the UI while handling complex text operations. It's more flexible than Quill or Draft.js for modern React apps.
- **Supabase**: Provides a robust Backend-as-a-Service (BaaS) for Auth and Database. Using Supabase allowed us to focus on the business logic and UI rather than infrastructure.
- **Express**: Used as a middleware layer to handle complex operations like file imports and custom sharing logic that might require more control than direct Supabase client calls.

## Database Design
- **Users**: We sync Supabase Auth users to a public `users` table to store metadata and facilitate sharing (searching by email).
- **Documents**: Stores the content and metadata. Using JSONB or Text for content allows easy Tiptap integration.
- **Document Shares**: A junction table that manages many-to-many relationships between users and documents, implementing a simple but effective permission system.

## Tradeoffs & Prioritization
- **Real-time Collaboration**: Per requirements, we did not implement CRDTs (like Yjs). We prioritized a robust auto-save mechanism over real-time synchronization to ensure stability within the assignment timeframe.
- **Security**: Implemented Row Level Security (RLS) on Supabase to ensure that even if the backend is bypassed, data remains secure.
- **Performance**: Used React Query for efficient data fetching, caching, and optimistic updates (where applicable).

## Future Improvements
- Implement real-time collaboration using Hocuspocus/Yjs.
- Add document versioning/history.
- Implement more granular permissions (read-only vs. editor).
- Add folder structure for document organization.
