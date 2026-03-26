import React from 'react';
import clsx from 'clsx';

export default function Skeleton({ className, ...props }) {
    return (
        <div 
            className={clsx(
                "animate-pulse bg-slate-800/50 rounded-md",
                className
            )}
            {...props}
        />
    );
}

export function DeviceCardSkeleton() {
    return (
        <div className="glass-panel p-5">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="space-y-3 mt-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="mt-5 flex gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
        </div>
    );
}
