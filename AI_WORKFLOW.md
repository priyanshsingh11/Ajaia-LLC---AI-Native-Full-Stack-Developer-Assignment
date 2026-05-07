# AI Workflow Note

## AI Tools Used
- **Antigravity (AI Assistant)**: Acted as a senior pair programmer and architect throughout the 6-hour build.

## Where AI Materially Sped Up Work
- **Boilerplate & Routing**: AI generated the complex Express routes and React Query hooks in minutes.
- **Tailwind v4 Migration**: When Tailwind v4 caused build failures on Render, AI identified the issue (unknown utility classes in `@apply`) and helped refactor the UI to use explicit classes in seconds.
- **Document Export**: AI generated the HTML-to-Markdown conversion logic for the export feature.
- **Security**: AI helped write and verify complex Postgres RLS policies for document sharing.

## AI Output Changed or Rejected
- **Theme Logic**: I initially had a complex Dark Mode toggle, but rejected it in favor of a rock-solid Light Theme to ensure better usability and deployment stability under the time limit.
- **Editor Hooks**: Refined the AI-generated Tiptap hooks to handle external content updates more elegantly without resetting the cursor position.

## Verification of Correctness & UX
- **Manual QA**: Rigorous testing of the sharing flow between two different browser sessions.
- **Build Testing**: Repeatedly ran production builds to ensure Tailwind v4 was correctly generating all styles for the Render environment.
- **Code Review**: Audited AI-generated SQL and Express logic to ensure no security loopholes in the sharing permissions.
