"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fetchAllThreads } from "@/lib/actions/thread.actions";
import ThreadCard from '@/components/cards/ThreadCard';



const InfiniteScrollComponent: React.FC = () => {
    const [threads, setThreads] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const loadMoreThreads = useCallback(async () => {
        if (loading || (totalPages && page > totalPages)) return;

        setLoading(true);
        try {
            const { threads: newThreads, totalPages } = await fetchAllThreads({ page, limit: 10 });
            setThreads(prevThreads => {
                const existingIds = new Set(prevThreads.map(thread => thread._id));
                const uniqueNewThreads = newThreads.filter(thread => !existingIds.has(thread._id));
                return [...prevThreads, ...uniqueNewThreads];
            });
            setTotalPages(totalPages);
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
        if (currentObserver && document.getElementById('load-more-trigger')) {
            currentObserver.observe(document.getElementById('load-more-trigger')!);
        }

        return () => currentObserver?.disconnect();
    }, [loadMoreThreads]);

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
            <h1 className="head-text mb-10">Home</h1>
            {threads.map(thread => (
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    createdAt={thread.createdAt}
                />
            ))}
            {loading && <p className="text-light-1">Loading...</p>}
            <div id="load-more-trigger" style={{ height: '20px' }}></div>
        </div>
    );
};

export default function Home() {
    return (
        <>
            <InfiniteScrollComponent />
        </>
    );
}