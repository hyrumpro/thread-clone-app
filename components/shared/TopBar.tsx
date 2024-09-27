import Link from "next/link";
import Image from "next/image";
import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, OrganizationSwitcher } from "@clerk/nextjs";

const Topbar: React.FC = () => {
    return (
        <nav className="topbar">
            <div className="flex justify-between items-center w-full px-4 py-2 md:px-6 md:py-3">
                <Link href="/" className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center">
                        <Image
                            src="/assets/logo.svg"
                            alt="Threads logo"
                            width={24}
                            height={24}
                            className="object-contain md:w-7 md:h-7"
                        />
                        <h1 className="text-heading4-bold md:text-heading3-bold text-light-1 hidden xs:block ml-2 md:ml-3">
                            Threads
                        </h1>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-4">
                    <SignedIn>
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8 md:w-10 md:h-10"
                                }
                            }}
                        />
                        <OrganizationSwitcher
                            appearance={{
                                elements: {
                                    organizationSwitcherTrigger: "py-1 px-2 md:py-2 md:px-4 rounded-full bg-dark-4 text-light-1 hover:bg-dark-3 transition-all"
                                }
                            }}
                        />
                        <SignOutButton>
                            <button className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-dark-4 text-light-1 hover:bg-dark-3 transition-all">
                                <Image
                                    src="/assets/logout.svg"
                                    alt="logout"
                                    width={16}
                                    height={16}
                                    className="md:w-5 md:h-5"
                                />
                            </button>
                        </SignOutButton>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="flex items-center justify-center gap-2 px-3 py-1 md:px-4 md:py-2 rounded-full bg-primary-500 text-light-1 hover:bg-primary-500/90 transition-all">
                                <Image
                                    src="/assets/login.svg"
                                    alt="login"
                                    width={16}
                                    height={16}
                                    className="md:w-5 md:h-5"
                                />
                                <span className="hidden md:block">Sign In</span>
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
};

export default Topbar;