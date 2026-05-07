import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Users, 
  Plus, 
  LogOut, 
  Search,
  LayoutDashboard,
  Sun,
  Moon
} from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '../lib/api';

export default function Sidebar({ activeTab, setActiveTab, onCreateNew }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: documentsApi.list
  });

  const menuItems = [
    { id: 'all', label: 'My Documents', icon: LayoutDashboard, path: '/' },
    { id: 'shared', label: 'Shared With Me', icon: Users, path: '/shared' },
  ];

  const recentDocs = data?.owned?.slice(0, 5) || [];

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 transition-colors">
      <div className="p-6 overflow-y-auto flex-1">
        <div 
          className="flex items-center gap-3 mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-100 dark:shadow-none">
            <FileText size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">AjaiaDocs</span>
        </div>

        <button 
          onClick={onCreateNew}
          className="w-full btn btn-primary flex items-center justify-center gap-2 py-3 mb-8 shadow-lg shadow-primary-100"
        >
          <Plus size={20} />
          <span>New Document</span>
        </button>

        <nav className="space-y-1 mb-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {recentDocs.length > 0 && (
          <div className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Documents</p>
            {recentDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all truncate ${
                  location.pathname === `/document/${doc.id}`
                    ? 'bg-slate-100 text-slate-900 font-medium border-l-4 border-primary-500'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <FileText size={16} className="shrink-0" />
                <span className="truncate">{doc.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold uppercase">
            {user?.email?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            window.dispatchEvent(new Event('storage')); // Trigger update in other tabs
          }}
          className="w-full flex items-center gap-3 px-4 py-3 mb-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
        >
          <div className="dark:hidden flex items-center gap-3">
            <Moon size={20} />
            <span>Dark Mode</span>
          </div>
          <div className="hidden dark:flex items-center gap-3 text-amber-400">
            <Sun size={20} />
            <span>Light Mode</span>
          </div>
        </button>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
