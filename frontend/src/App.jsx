import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Telemetry from './pages/Telemetry';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }}
        />
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
            <Route path="devices" element={<Devices />} />
            <Route path="telemetry" element={<Telemetry />} />

            {/* Fallback for unbuilt pages (settings, users) */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
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
