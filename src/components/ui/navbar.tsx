import { useNavigate } from "react-router-dom";
import { Zap, Bell, ChevronDown, User, Settings, Heart, LogOut } from "lucide-react";
import { Button } from "./button";
import { getUser, clearTokens } from "@/utils/storage";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDrawer from "@/components/NotificationDrawer";

export const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    useEffect(() => {
        setUser(getUser());
    }, []);

    const handleLogout = () => {
        clearTokens();
        window.location.href = "/"; // Force reload to clear state
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">Travel Buddy</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Home
                        </a>
                        <a href="#destinations-section" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                            Destinations
                        </a>
                        {user && (
                            <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                My Activities
                            </a>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <button
                                    className="relative text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setIsNotificationOpen(true)}
                                >
                                    <Bell className="h-5 w-5" />
                                    {/* Notification badge */}
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>
                                <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                                <div className="relative">
                                    <button
                                        className="flex items-center gap-3 hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-medium text-sm">
                                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-gray-900 leading-none">{user.full_name}</p>
                                            <p className="text-xs text-blue-600 font-medium">Pro Member</p>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>

                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 origin-top-right"
                                            >
                                                <div className="px-2 space-y-1">
                                                    <button
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                                        onClick={() => { setIsDropdownOpen(false); navigate("/profile"); }}
                                                    >
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        My Profile
                                                    </button>
                                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                        <Settings className="h-4 w-4 text-gray-500" />
                                                        Settings
                                                    </button>
                                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                        <Heart className="h-4 w-4 text-gray-500" />
                                                        Saved Places
                                                    </button>
                                                </div>
                                                <div className="h-[1px] bg-gray-100 my-2"></div>
                                                <div className="px-2">
                                                    <button
                                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        onClick={handleLogout}
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                                onClick={() => navigate("/auth")}
                            >
                                Join Us
                            </Button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Notification Drawer */}
            <NotificationDrawer
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
            />
        </>
    );
};
