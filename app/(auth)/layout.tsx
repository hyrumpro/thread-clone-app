import React from 'react';
import Image from 'next/image';
import '../globals.css';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col justify-between bg-dark-1 text-light-1">
            <header className="topbar">
                <div className="flex items-center gap-4">
                    <Image src="/assets/logo.svg" alt="Threads logo" width={28} height={28} />
                    <h1 className="text-heading3-bold text-light-1">Threads</h1>
                </div>
            </header>

            <main className="main">
                {children}
            </main>

            <footer className="bottombar">
                <div className="bottombar_container">
                    <p className="text-small-regular text-light-3">
                        © {new Date().getFullYear()} Threads. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}