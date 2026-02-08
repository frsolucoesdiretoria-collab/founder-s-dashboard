"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useEffect(() => {
        const unsub = scrollY.on('change', (latest) => {
            setIsScrolled(latest > 20);
        });
        return () => unsub();
    }, [scrollY]);

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
        >
            <div className={cn(
                "bg-white text-black px-6 py-3 rounded-full flex items-center gap-6 md:gap-8 shadow-2xl transition-all duration-300",
                isScrolled ? "scale-90 opacity-90 hover:scale-100 hover:opacity-100" : "scale-100"
            )}>
                {/* Logo Section */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="6" width="12" height="12" />
                        </svg>
                    </div>
                    <span className="font-['Syne'] font-bold text-lg tracking-tighter uppercase hidden md:inline-block">AXIS</span>
                </div>

                {/* Links (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide">
                    <span className="text-[10px] uppercase tracking-widest opacity-50">High-End Automation</span>
                </div>

                {/* CTA Button - Preserving Copy "Agendar Demonstração" */}
                <button className="hidden md:block px-6 py-2 bg-black text-white text-xs font-bold rounded-full uppercase tracking-wider hover:bg-gray-800 transition-colors">
                    Agendar Demonstração
                </button>

                {/* Mobile Menu Icon */}
                <button className="md:hidden">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </motion.nav>
    );
};
