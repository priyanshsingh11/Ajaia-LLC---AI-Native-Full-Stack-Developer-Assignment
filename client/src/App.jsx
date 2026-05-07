import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

import Layout from './components/Layout';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard activeTab="all" />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/shared" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard activeTab="shared" />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/document/:id" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <EditorPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
        <Toaster position="top-right" expand={false} richColors />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
