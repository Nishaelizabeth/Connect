import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    variant?: 'green' | 'blue' | 'yellow';
}

const variantStyles = {
    green: 'bg-green-50 border-green-100',
    blue: 'bg-blue-50 border-blue-100',
    yellow: 'bg-yellow-50 border-yellow-100',
};

const iconBgStyles = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
};

const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    variant = 'green'
}) => {
    return (
        <div className={cn(
            "rounded-2xl p-5 border transition-all hover:shadow-md",
            variantStyles[variant]
        )}>
            <div className="flex items-start justify-between">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    iconBgStyles[variant]
                )}>
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
        </div>
    );
};

export default StatCard;
