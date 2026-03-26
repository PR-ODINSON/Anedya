import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Example of Role-Based Route (Users page requires admin) */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-8 text-slate-400">Users Management (Admin Only)</div>
              </ProtectedRoute>
            } />

            {/* Fallback for other sidebar links */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <h2 className="text-2xl font-semibold text-slate-200">Coming Soon</h2>
                  <p className="text-slate-400 mt-2">This module is under development.</p>
              </div>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
