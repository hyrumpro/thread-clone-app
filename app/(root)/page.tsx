"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAllThreads } from "@/lib/actions/thread.actions";
import ThreadCard from '@/components/cards/ThreadCard';

interface Author {
    _id: string;
    name: string;
    username: string;
    image: string;
}

interface Community {
    _id: string;
    name: string;
    image: string;
}

interface Thread {
    _id: string;
    parentId: string | null;
    text: string;
    author: Author;
    community: Community | null;
    createdAt: string;
    children: Thread[];
}

interface FetchResponse {
    threads: Thread[];
    totalPages: number;
    currentPage: number;
}

const InfiniteScrollComponent: React.FC = () => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const loadMoreThreads = useCallback(async () => {
        if (loading || (totalPages && page > totalPages)) return;

        setLoading(true);
        try {
            const response = await fetchAllThreads({ page, limit: 10 });
            const typedResponse = response as unknown as FetchResponse; // Type assertion
            setThreads(prevThreads => {
                const existingIds = new Set(prevThreads.map(thread => thread._id));
                const uniqueNewThreads = typedResponse.threads.filter(
                    (thread: Thread) => !existingIds.has(thread._id)
                );
                return [...prevThreads, ...uniqueNewThreads];
            });
            setTotalPages(typedResponse.totalPages);
            setPage(prevPage => prevPage + 1);
        } catch (error) {
            console.error("Error loading threads:", error);
        } finally {
            setLoading(false);
        }
    }, [page, loading, totalPages]);

    useEffect(() => {
        loadMoreThreads();
    }, [loadMoreThreads]);

    useEffect(() => {
        if (!observerRef.current) {
            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreThreads();
                }
            });
        }

        const currentObserver = observerRef.current;
        const triggerElement = document.getElementById('load-more-trigger');
        if (currentObserver && triggerElement) {
            currentObserver.observe(triggerElement);
        }

        return () => {
            if (currentObserver && triggerElement) {
                currentObserver.unobserve(triggerElement);
            }
        };
    }, [loadMoreThreads]);

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
            <h1 className="head-text mb-10">Home</h1>
            {threads.map(thread => (
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId=""
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    isComment={false}
                />
            ))}
            {loading && <p className="text-light-1">Loading...</p>}
            <div id="load-more-trigger" style={{ height: '20px' }}></div>
        </div>
    );
};

const Home: React.FC = () => {
    return (
        <>
            <InfiniteScrollComponent />
        </>
    );
};

export default Home;