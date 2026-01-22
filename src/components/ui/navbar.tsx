import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "./button";

export const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">ACTIVELIFE</span>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Home
                    </a>
                    <a href="#destinations-section" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Destinations
                    </a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                        onClick={() => navigate("/auth")}
                    >
                        Join Us
                    </Button>
                </div>
            </div>
        </nav>
    );
};
