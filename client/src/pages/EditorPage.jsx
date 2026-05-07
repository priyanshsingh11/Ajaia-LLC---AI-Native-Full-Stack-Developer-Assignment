import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../lib/api';
import Editor from '../components/Editor';
import { toast } from 'sonner';
import { 
  ChevronLeft, 
  Share2, 
  CloudCheck, 
  CloudSync, 
  Users,
  UserPlus,
  Loader2,
  MoreVertical,
  X,
  Download
} from 'lucide-react';
import debounce from 'lodash.debounce';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const [hasInitialized, setHasInitialized] = useState(false);

  const { data: doc, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.get(id),
  });

  // Initial state setup from fetched data
  useEffect(() => {
    if (doc && !hasInitialized) {
      setTitle(doc.title);
      setContent(doc.content);
      setHasInitialized(true);
    }
  }, [doc, hasInitialized]);

  const updateMutation = useMutation({
    mutationFn: (updates) => documentsApi.update(id, updates),
    onSuccess: () => {
      setIsSaving(false);
      queryClient.invalidateQueries(['documents']);
    }
  });

  const shareMutation = useMutation({
    mutationFn: (email) => documentsApi.share(id, email),
    onSuccess: () => {
      toast.success('Shared successfully');
      setShareEmail('');
      queryClient.invalidateQueries(['document', id]);
    },
    onError: (err) => {
      console.error('Share error:', err);
      toast.error(err.response?.data?.error || 'Failed to share');
    }
  });

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce((updates) => {
      setIsSaving(true);
      updateMutation.mutate(updates);
    }, 2000),
    [id]
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    debouncedSave({ content: newContent });
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (shareEmail) {
      shareMutation.mutate(shareEmail);
    }
  };

  const handleExport = () => {
    // We'll get the content from the editor. 
    // Since we store 'content' state, we can use a basic converter if it's HTML, 
    // but our 'content' is JSON. Tiptap JSON is harder to convert manually.
    // I'll add an export method to the Editor component instead.
    window.dispatchEvent(new CustomEvent('export-markdown'));
  };

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
      <p className="text-slate-500 font-medium">Opening document...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
      <p className="text-slate-500 mb-6">{error.response?.data?.error || 'Failed to load document'}</p>
      <button onClick={() => navigate('/')} className="btn btn-primary">Go Back Dashboard</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col flex-1 max-w-xl">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-lg font-bold text-slate-800 dark:text-slate-100 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded px-2 -ml-2"
              placeholder="Untitled Document"
            />
            <div className="flex items-center gap-2 text-xs text-slate-400 px-0.5">
              {isSaving ? (
                <div className="flex items-center gap-1">
                  <CloudSync size={14} className="text-primary-500" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <CloudCheck size={14} className="text-emerald-500" />
                  <span>Saved to cloud</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4 overflow-hidden">
            {doc.shares?.map((share, i) => (
              <div 
                key={i} 
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase"
                title={share.user?.email}
              >
                {share.user?.email[0]}
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleExport}
            className="btn btn-secondary flex items-center gap-2"
            title="Export as Markdown"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Editor Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <Editor content={content} onChange={handleContentChange} />
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={22} className="text-primary-600" />
                Share Document
              </h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleShare} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">User Email</label>
                <input
                  type="email"
                  required
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email to share with"
                  className="input"
                />
              </div>
              <button 
                type="submit" 
                disabled={shareMutation.isPending}
                className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
              >
                {shareMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Invite User'}
              </button>
            </form>

            {doc.shares?.length > 0 && (
              <div className="px-6 pb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">People with access</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                        {doc.owner?.email[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{doc.owner?.email || 'Owner'}</p>
                        <p className="text-xs text-slate-500">Owner</p>
                      </div>
                    </div>
                  </div>
                  {doc.shares.map((share, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-xs font-bold text-primary-600 uppercase">
                          {share.user?.email[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{share.user?.email}</p>
                          <p className="text-xs text-slate-500">Can edit</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
