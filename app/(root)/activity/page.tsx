"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUserActivities, getUserByCustomId } from "@/lib/actions/user.actions";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";


interface ActivityResponse {
    type: 'reply';
    threadId: string;
    replierName: string;
    replierUsername: string;
    replierImage: string;
    replyContent: string;
    createdAt: Date;
}

interface ActivityWithId extends ActivityResponse {
    replierId: string;
}

export default function ActivityComponent() {

    const [activities, setActivities] = useState<ActivityWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userId } = useAuth();

    useEffect(() => {
        async function loadActivities() {
            if (!userId) return;

            setIsLoading(true);
            setError(null);

            try {
                const userInfo = await getUserByCustomId(userId);
                if (!userInfo || !userInfo._id) {
                    throw new Error('User information not found');
                }

                const fetchedActivities = await fetchUserActivities(userInfo._id.toString());

                const transformedActivities: ActivityWithId[] = fetchedActivities.map(activity => ({
                    ...activity,
                    replierId: activity.replierUsername
                }));

                setActivities(transformedActivities);
            } catch (err) {
                console.error('Failed to load activities:', err);
                setError('Failed to load activities. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }

        loadActivities();
    }, [userId]);

    // Rest of your component remains the same
    function formatTimestamp(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
        }
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }

    return (
        <div className="flex flex-col min-h-screen bg-dark-1 text-light-1 w-full">
            <ScrollArea className="flex-grow custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    <h1 className="head-text p-4">Activity</h1>

                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <div className="animate-pulse flex flex-col items-center">
                                <div className="h-8 w-8 bg-dark-4 rounded-full mb-2"></div>
                                <div className="h-4 w-32 bg-dark-4 rounded"></div>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
                            <p className="text-red-500 text-center mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-dark-4 text-light-1 px-4 py-2 rounded-lg hover:bg-dark-3 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
                            <MessageCircle className="h-12 w-12 text-light-3 mb-4" />
                            <p className="text-light-2 text-center">No activities yet. When someone replies to your threads, you will see them here.</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {activities.map((activity, index) => (
                                <div
                                    key={index}
                                    className="activity-card hover:bg-dark-3 transition-colors duration-200"
                                >
                                    <div className="flex items-start gap-4">
                                        <Link
                                            href={`/profile/${activity.replierId}`}
                                            className="relative h-11 w-11 rounded-full overflow-hidden hover:opacity-75 transition-opacity"
                                        >
                                            <Image
                                                src={activity.replierImage}
                                                alt={activity.replierName}
                                                fill
                                                className="object-cover"
                                            />
                                        </Link>

                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/profile/${activity.replierId}`}
                                                    className="font-semibold hover:underline"
                                                >
                                                    {activity.replierName}
                                                </Link>
                                                <span className="text-light-3">•</span>
                                                <span className="text-subtle-medium text-light-3">
                                                    {formatTimestamp(activity.createdAt)}
                                                </span>
                                            </div>

                                            <p className="text-small-regular text-light-2 mt-1">
                                                replied to your{' '}
                                                <Link
                                                    href={`/thread/${activity.threadId}`}
                                                    className="text-primary-500 hover:underline"
                                                >
                                                    thread
                                                </Link>
                                            </p>

                                            <div className="mt-2 p-3 bg-dark-4 rounded-xl">
                                                <p className="text-light-2">{activity.replyContent}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}