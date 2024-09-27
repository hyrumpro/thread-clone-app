// app/(root)/layout.tsx
import React from 'react';
import { Inter } from 'next/font/google';
import TopBar from "@/components/shared/TopBar";
import BottomBar from "@/components/shared/BottomBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";

import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <div className={`${inter.className} min-h-screen flex flex-col`}>
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
                <LeftSidebar />
                <main className="flex-1 overflow-y-auto flex justify-center">
                    <section className="main-container w-full max-w-3xl">
                        {children}
                    </section>
                </main>
                <RightSidebar />
            </div>
            <BottomBar />
        </div>
    );
}