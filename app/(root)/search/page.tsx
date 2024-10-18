'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { searchThreads } from '@/lib/actions/thread.actions';
import { debounce } from '@/lib/utils';
import ThreadCard from '@/components/cards/ThreadCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Thread {
    _id: string;
    text: string;
    author: {
        _id: string;
        username: string;
        image: string;
    };
    community: {
        _id: string;
        name: string;
        image: string;
    } | null;
    createdAt: string;
    children: any[];
    parentId: string | null;
}

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
    const [searchResults, setSearchResults] = useState<Thread[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const fetchSearchResults = useCallback(
        async (
            query: string,
            author: string,
            sort: 'latest' | 'oldest',
            pageNum: number
        ) => {
            if (query.length === 0 && author.length === 0) {
                setSearchResults([]);
                setTotalPages(1);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchThreads({
                    searchQuery: query,
                    authorFilter: author,
                    sortOrder: sort,
                    page: pageNum,
                    limit: 10,
                });
                setSearchResults(results.threads as Thread[]);
                setTotalPages(results.totalPages);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setIsSearching(false);
            }
        },
        []
    );

    const debouncedSearch = useCallback(
        debounce(
            (
                query: string,
                author: string,
                sort: 'latest' | 'oldest',
                pageNum: number
            ) => {
                fetchSearchResults(query, author, sort, pageNum);
            },
            300
        ),
        []
    );

    const handleInputChange =
        (setter: React.Dispatch<React.SetStateAction<string>>) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setter(value);
                setPage(1);

                if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                }

                searchTimeoutRef.current = setTimeout(() => {
                    debouncedSearch(searchQuery, authorFilter, sortOrder, 1);
                }, 300);
            };

    const handleSortChange = (value: 'latest' | 'oldest') => {
        setSortOrder(value);
        setPage(1);
        fetchSearchResults(searchQuery, authorFilter, value, 1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchSearchResults(searchQuery, authorFilter, sortOrder, newPage);
    };

    const handleSearchFocus = () => {
        setIsSearchExpanded(true);
    };

    const handleSearchBlur = () => {
        if (searchQuery.length === 0 && authorFilter.length === 0) {
            setIsSearchExpanded(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setAuthorFilter('');
        setSearchResults([]);
        setIsSearchExpanded(false);
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    useEffect(() => {
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl bg-dark-2 min-h-screen">
            <motion.div
                initial={false}
                animate={isSearchExpanded ? { height: 'auto' } : { height: '100vh' }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center"
            >
                <h1 className={`text-4xl font-bold mb-8 text-center text-light-1 ${isSearchExpanded ? 'mt-4' : 'mb-16'}`}>
                    Threads Search
                </h1>

                <div className={`mb-8 w-full max-w-2xl transition-all duration-300 ${isSearchExpanded ? '' : 'scale-100'}`}>
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search threads..."
                                value={searchQuery}
                                onChange={handleInputChange(setSearchQuery)}
                                onFocus={handleSearchFocus}
                                onBlur={handleSearchBlur}
                                className="text-lg py-6 pl-12 pr-12 rounded-full shadow-lg focus:ring-2 focus:ring-primary bg-dark-4 text-light-1 border-dark-4"
                            />
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-light-3" />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-5 h-5 text-light-3" />
                                </button>
                            )}
                        </div>
                        <AnimatePresence>
                            {isSearchExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex gap-4"
                                >
                                    <Input
                                        type="text"
                                        placeholder="Filter by author..."
                                        value={authorFilter}
                                        onChange={handleInputChange(setAuthorFilter)}
                                        className="flex-grow bg-dark-4 text-light-1 border-dark-4"
                                    />
                                    <Select value={sortOrder} onValueChange={handleSortChange}>
                                        <SelectTrigger className="w-[180px] bg-dark-4 text-light-1 border-dark-4">
                                            <SelectValue placeholder="Sort order" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-dark-3 text-light-1 border-dark-4">
                                            <SelectItem value="latest">Latest first</SelectItem>
                                            <SelectItem value="oldest">Oldest first</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {isSearchExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full"
                        >
                            {isSearching && (
                                <p className="text-center text-light-3">Searching...</p>
                            )}

                            {!isSearching &&
                                searchResults.length === 0 &&
                                (searchQuery.length > 0 || authorFilter.length > 0) && (
                                    <p className="text-center text-light-3">
                                        No results found. Try adjusting your search.
                                    </p>
                                )}

                            <div className="space-y-6">
                                {searchResults.map((thread) => (
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
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center gap-4">
                                    <Button
                                        onClick={() => handlePageChange(Math.max(page - 1, 1))}
                                        disabled={page === 1}
                                        className="bg-dark-4 text-light-1 hover:bg-dark-3"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className="bg-dark-4 text-light-1 hover:bg-dark-3"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}




