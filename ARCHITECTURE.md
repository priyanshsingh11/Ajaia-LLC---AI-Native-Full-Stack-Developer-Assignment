# Architecture Decisions

## Tech Stack Choice
- **React + Vite**: Chosen for fast development cycle and modern frontend features. 
- **Tailwind CSS v4**: Utilized the latest Tailwind version for a premium, design-system-first approach. Bypassed build-time `@apply` limitations by using explicit utility classes for maximum deployment stability.
- **Tiptap**: A headless rich-text editor framework that allows full control over the UI while handling complex text operations.
- **Supabase**: Used for Auth and Postgres database. Provided robust RLS (Row Level Security) to ensure document privacy.
- **Express**: Acts as a controller layer to handle file processing (import/export) and complex database queries that span multiple tables.

## Database Design
- **Users**: Mirrored public profile table synced from Supabase Auth.
- **Documents**: Core table storing HTML content and metadata.
- **Document Shares**: Junction table linking users to documents with specific access rights.

## Tradeoffs & Prioritization
- **Stability over Complexity**: Intentionally pivoted to a "Light Theme Only" design to ensure 100% UI stability and readability across all devices, avoiding the "dark mode flicker" common in fast-build prototypes.
- **Explicit Styling**: Moved from CSS-based `@apply` to explicit JSX classes to resolve Tailwind v4 build issues on static hosting platforms like Render.
- **Auto-save**: Implemented a reliable debounced auto-save mechanism as a proxy for real-time collaboration, ensuring user work is never lost.

## Future Improvements
- **Presence Bubbles**: Implementing real-time user presence (who's online).
- **Yjs/CRDTs**: Adding character-level synchronization for high-concurrency editing.
- **Folders/Tags**: Better document organization for scaling teams.
