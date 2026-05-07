import React from 'react';
import Sidebar from './Sidebar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { documentsApi } from '../lib/api';
import { toast } from 'sonner';

export default function Layout({ children }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on path
  const activeTab = location.pathname === '/' ? 'all' : (location.pathname.includes('/shared') ? 'shared' : 'all');

  const createMutation = useMutation({
    mutationFn: (data) => documentsApi.create(data),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries(['documents']);
      navigate(`/document/${newDoc.id}`);
      toast.success('Document created');
    }
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(id) => navigate(id === 'all' ? '/' : '/shared')} 
        onCreateNew={() => createMutation.mutate({ title: 'Untitled Document' })}
      />
      <main className="flex-1 ml-64 min-h-screen dark:text-slate-100">
        {children}
      </main>
    </div>
  );
}
