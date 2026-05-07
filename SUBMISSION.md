# Submission - Collaborative Document Editor

## Included Features
- [x] Full-stack architecture (React/Node/Supabase)
- [x] Authentication with demo users
- [x] Dashboard with "My Documents" and "Shared With Me"
- [x] Tiptap Editor with formatting and auto-save
- [x] Document renaming and deletion
- [x] Sharing system with email invites
- [x] File import (.txt, .md)
- [x] Export to Markdown (Stretch Feature)
- [x] Premium responsive UI (Light Theme optimized)
- [x] Backend API stability
- [x] Detailed documentation (README, ARCHITECTURE, AI_WORKFLOW)

## Demo Credentials
- **Admin**: `priyansh@test.com` / `Test12345`
- **Demo User**: `demo@test.com` / `demo`

## Deployed URL
- Frontend (Render): `https://ajaia-docs-client.onrender.com` (Update with your actual link)
- Backend (Render): `https://ajaia-docs-api.onrender.com` (Update with your actual link)

## Video Walkthrough
- [Loom Video Link](https://www.loom.com/share/cf704b088e224fe38fc83a85840e89e3)

## Working Functionality
- **Real-time Persistence**: Documents auto-save to Supabase with UI feedback ("Synced to Cloud").
- **Collaborative Sharing**: Users can invite others via email to view/edit documents.
- **File Interop**: Import `.txt`/`.md` files as new documents; export documents as `.md`.
- **Responsive Layout**: Sidebar and editor adapt to mobile and desktop screens.

## Incomplete / Limitations
- **Real-time Indicators**: While the editor is collaborative (shared documents), we did not implement "Who is editing" presence bubbles due to the 4-6 hour time limit.
- **Conflict Resolution**: Uses a "last-write-wins" strategy rather than full CRDT (Yjs) for complexity management.

## Future Roadmap (Next 2-4 Hours)
1. **Presence Indicators**: Add avatars showing who is currently viewing/editing the document.
2. **True CRDT Integration**: Integrate Yjs for character-by-character real-time collaboration.
3. **Commenting System**: Allow users to highlight text and add comments for team feedback.
