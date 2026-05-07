import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../lib/api';
import { FileText, Clock, User, Plus, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Dashboard({ activeTab = 'all' }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.list
  });

  const createMutation = useMutation({
    mutationFn: (data) => documentsApi.create(data),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries(['documents']);
      navigate(`/document/${newDoc.id}`);
      toast.success('Document created');
    }
  });

  const importMutation = useMutation({
    mutationFn: (file) => documentsApi.importFile(file),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries(['documents']);
      navigate(`/document/${newDoc.id}`);
      toast.success('File imported successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import file');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      toast.error('Only .txt and .md files are supported');
      return;
    }

    importMutation.mutate(file);
  };

  const documents = activeTab === 'all' ? data?.owned || [] : data?.shared || [];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
      <p className="text-slate-500">Loading documents...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeTab === 'all' ? 'My Documents' : 'Shared With Me'}
          </h1>
          <p className="text-slate-500">Manage and edit your cloud documents</p>
        </div>
        
        <div className="flex gap-3">
          <label className="btn btn-secondary flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95">
            <Upload size={18} />
            <span>Import</span>
            <input type="file" className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No documents found</h3>
          <p className="text-slate-500 mb-6">Start by creating a new document or importing a file.</p>
          {activeTab === 'all' && (
            <button 
              onClick={() => createMutation.mutate({ title: 'Untitled Document' })}
              className="btn btn-primary px-8"
            >
              Create First Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => navigate(`/document/${doc.id}`)}
              className="card group cursor-pointer hover:border-primary-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary-50 transition-colors">
                  <FileText className="text-slate-400 group-hover:text-primary-600 transition-colors" size={24} />
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-primary-300 transition-colors">
                  AjaiaDocs
                </div>
              </div>
              
              <h3 className="font-semibold text-slate-800 mb-2 truncate">{doc.title}</h3>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={14} />
                  <span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={14} />
                  <span>{doc.owner_id === data?.user_id ? 'You' : doc.owner_email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
