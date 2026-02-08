import React from 'react';
import { Inter, Sora } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const sora = Sora({
    subsets: ['latin'],
    variable: '--font-sora',
    display: 'swap',
});

export default function V49Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={`${inter.variable} ${sora.variable} font-sans bg-slate-950`}>
            {children}
        </div>
    );
}
