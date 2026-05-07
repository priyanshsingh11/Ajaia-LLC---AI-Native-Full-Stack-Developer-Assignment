require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Supabase Client (using service role for admin tasks)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.txt' || ext === '.md') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .md files are allowed'));
    }
  }
});

// Helper: Create a Supabase client for a specific request
const getSupabaseClient = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Return admin client if no auth header (for public/special routes if needed)
    return supabase;
  }
  // Create client with user's JWT to respect RLS
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: authHeader } }
    }
  );
};

// Helper: Get user from token
const getUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
};

// --- API Routes ---

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 1. Documents API
// GET /api/documents - List owned and shared documents
app.get('/api/documents', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const client = getSupabaseClient(req);

  try {
    // Documents owned by user
    const { data: owned, error: ownedError } = await client
      .from('documents')
      .select('*') // Removed join to users table as it might not exist
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });

    if (ownedError) throw ownedError;

    // Documents shared with user
    const { data: sharedRelations, error: sharedError } = await client
      .from('document_shares')
      .select('document_id')
      .eq('shared_with_user_id', user.id); // Updated column name

    if (sharedError) throw sharedError;

    const sharedIds = sharedRelations.map(s => s.document_id);
    let shared = [];
    if (sharedIds.length > 0) {
      const { data: sharedDocs, error: sharedDocsError } = await client
        .from('documents')
        .select('*')
        .in('id', sharedIds)
        .order('updated_at', { ascending: false });
      
      if (sharedDocsError) throw sharedDocsError;
      shared = sharedDocs;
    }

    res.json({ owned, shared });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents - Create new document
app.post('/api/documents', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, content } = req.body;
  const client = getSupabaseClient(req);

  try {
    const { data, error } = await client
      .from('documents')
      .insert([{ 
        title: title || 'Untitled Document', 
        content: content || '', 
        owner_id: user.id 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/documents/:id - Get single document
app.get('/api/documents/:id', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const client = getSupabaseClient(req);

  try {
    const { data: doc, error } = await client
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !doc) return res.status(404).json({ error: 'Document not found' });

    // Check for shared status or owner
    const isOwner = doc.owner_id === user.id;
    const { data: share } = await client
      .from('document_shares')
      .select('id')
      .eq('document_id', id)
      .eq('shared_with_user_id', user.id) // Updated column name
      .single();

    if (!isOwner && !share) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get shared users list if owner
    let shares = [];
    if (isOwner) {
      const { data: shareList } = await client
        .from('document_shares')
        .select('shared_with_user_id')
        .eq('document_id', id);
      
      if (shareList?.length > 0) {
        const { data: { users: allUsers } } = await supabase.auth.admin.listUsers();
        shares = shareList.map(s => {
          const u = allUsers.find(user => user.id === s.shared_with_user_id);
          return { user: { email: u?.email || 'Unknown User' } };
        });
      }
    }

    // Get owner email
    const { data: { user: owner } } = await supabase.auth.admin.getUserById(doc.owner_id);
    const docWithOwner = { ...doc, owner: { email: owner?.email }, shares };

    res.json(docWithOwner);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/documents/:id - Update document
app.patch('/api/documents/:id', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { title, content } = req.body;
  const client = getSupabaseClient(req);

  try {
    // Check permission
    const { data: doc } = await client.from('documents').select('owner_id').eq('id', id).single();
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const isOwner = doc.owner_id === user.id;
    const { data: share } = await client
      .from('document_shares')
      .select('id')
      .eq('document_id', id)
      .eq('shared_with_user_id', user.id) // Updated column name
      .single();

    if (!isOwner && !share) return res.status(403).json({ error: 'Access denied' });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await client
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/documents/:id - Delete document
app.delete('/api/documents/:id', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const client = getSupabaseClient(req);

  try {
    const { error } = await client
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id); // Only owner can delete

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Sharing API
// POST /api/documents/:id/share - Share document with user email
app.post('/api/documents/:id/share', async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.params;
  const { email } = req.body;
  const client = getSupabaseClient(req);

  try {
    // Check if owner
    const { data: doc } = await client.from('documents').select('owner_id').eq('id', id).single();
    if (!doc || doc.owner_id !== user.id) return res.status(403).json({ error: 'Only owners can share' });

    // Find user by email using Supabase Auth Admin API
    const { data: { users: foundUsers }, error: userError } = await supabase.auth.admin.listUsers();
    const targetUser = foundUsers?.find(u => u.email === email);

    if (userError || !targetUser) return res.status(404).json({ error: 'User not found' });
    if (targetUser.id === user.id) return res.status(400).json({ error: 'Cannot share with yourself' });

    // Insert share
    const { error: shareError } = await client
      .from('document_shares')
      .insert([{ document_id: id, shared_with_user_id: targetUser.id }]); // Updated column name

    if (shareError) {
      if (shareError.code === '23505') return res.status(400).json({ error: 'Already shared with this user' });
      throw shareError;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Import API
app.post('/api/documents/import', upload.single('file'), async (req, res) => {
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const content = req.file.buffer.toString('utf-8');
  const title = req.file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
  const client = getSupabaseClient(req);

  try {
    const { data, error } = await client
      .from('documents')
      .insert([{ title, content, owner_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

console.log('Starting server...');
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;