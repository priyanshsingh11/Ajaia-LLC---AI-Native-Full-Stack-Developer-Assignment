import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { 
  MoreVertical, 
  FileText, 
  Clock, 
  User as UserIcon,
  Trash2,
  Share2,
  Upload,
  Loader2,
  FileSearch
} from 'lucide-react';

export default function Dashboard({ activeTab = 'all' }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const deleteMutation = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document deleted');
    }
  });

  const importMutation = useMutation({
    mutationFn: documentsApi.import,
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries(['documents']);
      navigate(`/document/${newDoc.id}`);
      toast.success('Document imported');
    }
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const docsToDisplay = activeTab === 'all' ? data?.owned : data?.shared;

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {activeTab === 'all' ? 'My Documents' : 'Shared With Me'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and edit your cloud documents</p>
        </div>

        <div className="flex gap-3">
          <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
            <Upload size={18} />
            <span>Import</span>
            <input type="file" className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
            <p className="text-slate-500">Loading documents...</p>
          </div>
        ) : docsToDisplay?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <FileSearch size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No documents found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Start by creating a new document or importing a file.</p>
            {activeTab === 'all' && (
              <button 
                onClick={() => createMutation.mutate({ title: 'Untitled Document' })}
                className="btn btn-primary"
              >
                Create First Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {docsToDisplay?.map((doc) => (
              <div 
                key={doc.id} 
                className="card group cursor-pointer hover:border-primary-200 dark:hover:border-primary-800 transition-all dark:bg-slate-900 dark:border-slate-800"
                onClick={() => navigate(`/document/${doc.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                    <FileText className="text-slate-400 group-hover:text-primary-500" size={24} />
                  </div>
                  <div className="flex items-center gap-1">
                    {activeTab === 'all' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Are you sure?')) deleteMutation.mutate(doc.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 truncate">{doc.title}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={14} />
                    <span>Updated {new Date(doc.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <UserIcon size={14} />
                    <span>{doc.owner_id === user?.id ? 'You' : (doc.owner?.email || 'Shared User')}</span>
                  </div>
                </div>

                {activeTab === 'shared' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      Shared
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
