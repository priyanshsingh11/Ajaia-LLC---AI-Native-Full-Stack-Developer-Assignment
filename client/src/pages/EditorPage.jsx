import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../lib/api';
import Editor from '../components/Editor';
import { 
  ArrowLeft, 
  Save, 
  Share2, 
  Download, 
  Trash2, 
  Check, 
  Loader2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.get(id),
    onSuccess: (data) => setTitle(data.title)
  });

  const updateMutation = useMutation({
    mutationFn: (updates) => documentsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['document', id]);
      queryClient.invalidateQueries(['documents']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      navigate('/');
      toast.success('Document deleted');
    }
  });

  const shareMutation = useMutation({
    mutationFn: (email) => documentsApi.share(id, email),
    onSuccess: () => {
      queryClient.invalidateQueries(['document', id]);
      setShareEmail('');
      toast.success('Document shared successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to share document');
    }
  });

  const handleTitleBlur = () => {
    if (title !== document.title) {
      updateMutation.mutate({ title });
    }
  };

  const exportAsMarkdown = () => {
    if (!document) return;
    
    // Simple HTML to MD conversion
    const content = document.content || '';
    const md = content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<ul>(.*?)<\/ul>/g, '$1\n')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '');

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as Markdown');
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
      <p className="text-slate-500">Opening your document...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex flex-col flex-1">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-lg font-bold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded px-2 -ml-2"
              placeholder="Untitled Document"
            />
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium ml-0.5">
              {updateMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" />
                  SAVING TO CLOUD...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-500">
                  <Check size={10} />
                  SAVED TO CLOUD
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
            {document?.collaborators?.slice(0, 3).map((collab, i) => (
              <div 
                key={i}
                title={collab.email}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700 uppercase"
              >
                {collab.email[0]}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowShare(!showShare)}
            className={`btn ${showShare ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2 py-2`}
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
          
          <button 
            onClick={exportAsMarkdown}
            className="btn btn-secondary flex items-center gap-2 py-2"
          >
            <Download size={18} />
            <span>Export</span>
          </button>

          <button 
            onClick={() => {
              if (window.confirm('Delete this document?')) {
                deleteMutation.mutate();
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {showShare && (
        <div className="bg-primary-50 border-b border-primary-100 px-6 py-4 animate-in slide-in-from-top duration-300">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="flex-1 relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
              <input 
                type="email" 
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter email to share with..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button 
              onClick={() => shareMutation.mutate(shareEmail)}
              disabled={!shareEmail || shareMutation.isPending}
              className="btn btn-primary px-6 py-2"
            >
              {shareMutation.isPending ? 'Sharing...' : 'Invite'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
        <div className="max-w-4xl mx-auto">
          <Editor 
            content={document?.content} 
            onChange={(content) => updateMutation.mutate({ content })} 
          />
        </div>
      </main>
    </div>
  );
}
