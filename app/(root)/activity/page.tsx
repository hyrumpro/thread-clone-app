"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {fetchUserActivities, getUserByCustomId} from "@/lib/actions/user.actions";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface Activity {
    type: 'reply';
    threadId: string;
    replierName: string;
    replierUsername: string;
    replierImage: string;
    replyContent: string;
    createdAt: Date;
}

export default function ActivityComponent() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userId } = useAuth();

    useEffect(() => {
        async function loadActivities() {
            if (!userId) return;

            const userInfo = await getUserByCustomId(userId);

            setIsLoading(true);
            setError(null);

            try {
                const fetchedActivities = await fetchUserActivities(userInfo._id.toString());
                setActivities(fetchedActivities);
            } catch (err) {
                console.error('Failed to load activities:', err);
                setError('Failed to load activities. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        loadActivities();
    }, [userId]);

    function formatTimestamp(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    return (
        <div className="flex flex-col h-screen bg-dark-1 text-light-1 w-full">
            <ScrollArea className="flex-grow custom-scrollbar">
                <h1 className="head-text p-4">Activity</h1>
                {isLoading ? (
                    <p className="text-center text-light-2">Loading activities...</p>
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : activities.length === 0 ? (
                    <p className="text-center text-light-2">No recent activities.</p>
                ) : (
                    <div className="p-4 space-y-4">
                        {activities.map((activity, index) => (
                            <div key={index} className="activity-card">
                                <div className="bg-dark-4 p-2 rounded-full">
                                    <MessageCircle className="h-4 w-4 text-blue-500" />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="text-base-semibold">New reply</h2>
                                    <p className="text-small-regular text-light-2">
                                        <Link href={`/profile/${activity.replierUsername}`} className="font-semibold hover:underline">
                                            {activity.replierName}
                                        </Link>
                                        {' replied to your '}
                                        <Link href={`/thread/${activity.threadId}`} className="text-primary-500 hover:underline">
                                            thread
                                        </Link>
                                    </p>
                                    <p className="text-subtle-medium text-light-3 mt-1">
                                        {formatTimestamp(new Date(activity.createdAt))}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}