import React from "react";
import { cn } from "@/lib/utils";
import { Boxes } from "@/components/ui/background-boxes";
import { Zap, Github, Twitter, Instagram, Mail, MapPin, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Find Buddies", href: "/dashboard" },
    { label: "My Trips", href: "/dashboard?tab=my-trips" },
    { label: "Travel Store", href: "/store" },
    { label: "Travel Assistant", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: <Twitter className="w-4 h-4" />, href: "#", label: "Twitter" },
  { icon: <Instagram className="w-4 h-4" />, href: "#", label: "Instagram" },
  { icon: <Github className="w-4 h-4" />, href: "#", label: "GitHub" },
  { icon: <Mail className="w-4 h-4" />, href: "#", label: "Email" },
];

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleLink = (href: string) => {
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      window.open(href, "_blank");
    }
  };

  return (
    <footer className="relative w-full overflow-hidden bg-slate-900 pt-24 pb-10">
      {/* Radial fade overlay — makes the grid fade out toward the content */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_100%,transparent_10%,white_80%)] pointer-events-none" />

      {/* Animated background grid */}
      <Boxes />

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-6">
        {/* Top: brand + tagline */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="h-9 w-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Travel Buddy</span>
          </div>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Connecting adventurers worldwide. No one explores alone.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-3 mt-6">
            {socialLinks.map(({ icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Explore</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>100+ Countries</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>50,000+ Travelers</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>AI-Powered Matching</span>
              </div>
            </div>
          </div>

          {/* Dynamic link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">{group}</p>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => handleLink(href)}
                      className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Travel Buddy. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-pink-400 mx-0.5">♥</span> for explorers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
