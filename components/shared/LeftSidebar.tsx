"use client";
import React from 'react';
import Link from "next/link";
import { sidebarLinks } from "@/constants";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { SignOutButton, SignedIn } from "@clerk/nextjs";

const LeftSidebar: React.FC = () => {
    const pathname = usePathname();

    return (
        <section className="custom-scrollbar leftsidebar bg-dark-2 text-light-1 flex flex-col justify-between hidden md:flex">
            <div className="flex w-full flex-col px-6">
                <div className="flex flex-col gap-2 py-4">
                    {sidebarLinks.map((link) => {
                        const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

                        return (
                            <Link
                                href={link.route}
                                key={link.label}
                                className={`leftsidebar_link group relative transition-all duration-200 ${
                                    isActive ? 'bg-primary-500' : 'hover:bg-dark-4'
                                }`}
                            >
                                <div className="flex items-center gap-4 p-2 rounded-lg">
                                    <div className={`w-5 h-5 relative ${isActive ? 'text-light-1' : 'text-gray-400 group-hover:text-light-1'}`}>
                                        <Image
                                            src={link.imgURL}
                                            alt={link.label}
                                            className="object-contain"
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                    <p className={`text-light-1 text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                                        {link.label}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto px-6 py-4">
                <SignedIn>
                    <SignOutButton>
                        <div className="flex cursor-pointer items-center gap-4 p-2 rounded-lg hover:bg-dark-4 transition-all duration-200">
                            <Image
                                src="/assets/logout.svg"
                                alt="logout"
                                width={20}
                                height={20}
                            />
                            <p className="text-light-2 text-sm">Logout</p>
                        </div>
                    </SignOutButton>
                </SignedIn>
            </div>
        </section>
    );
};

export default LeftSidebar;