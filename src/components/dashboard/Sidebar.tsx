import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Map,
    Compass,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';

interface SidebarProps {
    activeItem?: string;
    onItemClick?: (item: string) => void;
    userName?: string;
    userAvatar?: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'find-buddies', label: 'Find Buddies', icon: <Users className="w-5 h-5" /> },
    { id: 'my-trips', label: 'My Trips', icon: <Map className="w-5 h-5" /> },
    { id: 'invitations', label: 'Invitations', icon: <Users className="w-5 h-5" /> },
    { id: 'destinations', label: 'Destinations', icon: <Compass className="w-5 h-5" /> },
];

const Sidebar: React.FC<SidebarProps> = ({
    activeItem = 'dashboard',
    onItemClick,
    userName = 'Alex Rivers',
    userAvatar
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const navigate = useNavigate();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 z-50",
                isExpanded ? "w-56" : "w-20"
            )}
        >
            {/* Logo */}
            <div className={cn(
                "flex items-center gap-2 p-4 border-b border-gray-100",
                isExpanded ? "justify-start" : "justify-center"
            )}>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                {isExpanded && (
                    <span className="font-bold text-lg">
                        <span className="text-blue-600">ACTIVE</span>
                        <span className="text-gray-800">LIFE</span>
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => {
                                    // Update active item
                                    if (onItemClick) onItemClick(item.id);

                                    // Navigate based on the item
                                    switch (item.id) {
                                        case 'dashboard':
                                            navigate('/dashboard');
                                            break;
                                        case 'find-buddies':
                                            navigate('/dashboard?tab=find-buddies');
                                            break;
                                        case 'my-trips':
                                            navigate('/dashboard?tab=my-trips');
                                            break;
                                        case 'destinations':
                                            navigate('/dashboard?tab=destinations');
                                            break;
                                        case 'invitations':
                                            navigate('/invitations');
                                            break;
                                        default:
                                            break;
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                    isExpanded ? "justify-start" : "justify-center",
                                    activeItem === item.id
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                        : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {item.icon}
                                {isExpanded && <span className="font-medium">{item.label}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile */}
            <div className={cn(
                "p-4 border-t border-gray-100",
                isExpanded ? "flex items-center gap-3" : "flex flex-col items-center"
            )}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white font-semibold text-sm">
                            {userName.split(' ').map(n => n[0]).join('')}
                        </span>
                    )}
                </div>
                {isExpanded && (
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{userName}</p>
                        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Settings className="w-3 h-3" />
                            SETTINGS
                        </button>
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            >
                {isExpanded ? (
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
            </button>
        </aside>
    );
};

export default Sidebar;
