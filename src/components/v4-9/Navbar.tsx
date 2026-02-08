"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    const backgroundBlur = useTransform(
        scrollY,
        [0, 50],
        ['blur(0px)', 'blur(16px)']
    );

    const backgroundOpacity = useTransform(
        scrollY,
        [0, 50],
        ['rgba(3, 7, 18, 0)', 'rgba(3, 7, 18, 0.8)']
    );

    useEffect(() => {
        const unsub = scrollY.on('change', (latest) => {
            setIsScrolled(latest > 20);
        });
        return () => unsub();
    }, [scrollY]);

    return (
        <motion.nav
            style={{
                backgroundColor: backgroundOpacity,
                backdropFilter: backgroundBlur,
            }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 h-20 md:h-24 flex items-center transition-all duration-300",
                isScrolled ? "border-b border-white/5 shadow-2xl shadow-cyan-900/10" : "border-b border-transparent"
            )}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                        {/* Hexagon SVG Logo */}
                        <svg
                            viewBox="0 0 24 24"
                            className="w-full h-full text-cyan-400 fill-cyan-400/10 group-hover:rotate-12 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl md:text-2xl font-black tracking-tighter text-white leading-none">
                            AXIS
                        </span>
                        <span className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase leading-none mt-1">
                            Antivacância
                        </span>
                    </div>
                </div>

                {/* CTA Button */}
                <button className="relative group overflow-hidden px-5 py-2 md:px-7 md:py-3 rounded-full font-bold transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                    <div className="absolute inset-0 bg-cyan-400 group-hover:bg-cyan-300 transition-colors"></div>
                    <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40 group-hover:blur-xl transition-all"></div>
                    <span className="relative text-navy-950 text-xs md:text-sm uppercase tracking-wider">
                        Agendar Demonstração
                    </span>
                </button>
            </div>
        </motion.nav>
    );
};
