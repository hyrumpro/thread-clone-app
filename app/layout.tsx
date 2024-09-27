import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Threads - Connect with Your Community',
    description: 'Join Threads to connect with your favorite communities, share ideas, and engage in meaningful conversations.',
    keywords: 'threads, community, social media, conversations',
    authors: [{ name: 'Hyrum' }],
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider afterSignOutUrl="/">
            <html lang="en">
            <body className={inter.className}>{children}</body>
            </html>
        </ClerkProvider>
    );
}