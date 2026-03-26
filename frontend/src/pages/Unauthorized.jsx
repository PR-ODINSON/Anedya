import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen items-center justify-center bg-background text-slate-200 p-4">
            <div className="glass-panel p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-slate-400 mb-8">
                    You do not have the required permissions to view this page. Please contact your system administrator if you believe this is an error.
                </p>
                
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 w-full btn-primary bg-slate-700 hover:bg-slate-600 shadow-none border border-slate-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
            </div>
        </div>
    );
}
