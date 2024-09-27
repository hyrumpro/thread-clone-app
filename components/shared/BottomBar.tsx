"use client";
import React from 'react';
import { sidebarLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';



const BottomBar: React.FC = () => {
    const pathname = usePathname();

    return (
        <section className="bottombar">
            <div className="bottombar_container">
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
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <p className={`text-light-1 text-sm max-lg:hidden ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {link.label}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};

export default BottomBar;

