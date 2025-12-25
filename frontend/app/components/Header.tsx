"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "Temperature Check", icon: "🌡️", description: "Submit temperature" },
  { href: "/dashboard", label: "Dashboard", icon: "📊", description: "Data overview" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-2xl border-b border-indigo-500/40"
          : "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/temperature-logo.svg"
                alt="Temperature Check Logo"
                width={48}
                height={48}
                className="rounded-lg transition-all duration-300 group-hover:scale-110"
              />
            </div>
            <div className="hidden sm:block transition-all duration-300 group-hover:translate-x-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Encrypted Temperature Check
              </h1>
              <p className="text-xs text-gray-500 font-mono">FHEVM Powered</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 bg-gray-100/50 rounded-2xl p-1.5 backdrop-blur-sm border border-indigo-500/20">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isHovered = hoveredItem === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    relative px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-300 transform
                    ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                        : "text-gray-600 hover:text-indigo-600"
                    }
                    ${!isActive && isHovered ? "bg-gray-200/50" : ""}
                    hover:scale-105 active:scale-95
                  `}
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <span className={`text-lg transition-transform duration-300 ${isHovered ? "scale-125" : ""}`}>
                      {item.icon}
                    </span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full opacity-80" />
                  )}
                  
                  {/* Hover tooltip */}
                  {isHovered && !isActive && (
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-indigo-600 whitespace-nowrap bg-white/90 px-2 py-1 rounded-md border border-indigo-500/30 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                      {item.description}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Wallet Connect Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>
        </div>
      </div>
      
      {/* Gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
    </nav>
  );
}

