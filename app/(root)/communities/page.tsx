"use client"

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Users } from 'lucide-react'
import { fetchCommunities } from '@/lib/actions/community.actions'
import { useRouter } from "next/navigation";

interface Community {
    externalId: string;
    name: string;
    username: string;
    image: string;
    bio: string;
    members: {
        image: string;
        name: string;
    }[];
    createdAt: string;
}

export default function CommunitiesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<'desc' | 'asc'>('desc')
    const [communities, setCommunities] = useState<Community[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const router = useRouter();
    const handleJoinCommunity = (communityId: string) => {
        console.log(communityId)
        router.push(`/communities/${communityId}`)
    }

    const fetchCommunityData = async (reset: boolean = false) => {
        try {
            setLoading(true)
            const pageToFetch = reset ? 1 : page
            const result = await fetchCommunities({
                searchString: searchQuery,
                pageNumber: pageToFetch,
                pageSize: 6,
                sortBy: filter
            })

            setCommunities(prev => reset ? result.communities : [...prev, ...result.communities])
            setHasMore(result.isNext)
            console.log(communities);
            if (!reset) setPage(prev => prev + 1)
        } catch (error) {
            console.error('Error fetching communities:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCommunityData(true)
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, filter])

    return (
        <div className="flex flex-col w-full bg-dark-1">
            <div className="max-w-7xl mx-auto w-full px-4 py-6">
                <header className="mb-8">
                    <h1 className="head-text mb-6">Explore Communities</h1>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search communities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="searchbar_input pl-9 w-full bg-dark-3 border-none text-light-1"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            <Button
                                onClick={() => setFilter('desc')}
                                className={`min-w-fit ${
                                    filter === 'desc'
                                        ? 'bg-primary-500 text-light-1 hover:bg-primary-500'
                                        : 'bg-dark-3 text-light-2 border-dark-4 hover:bg-dark-4'
                                }`}
                            >
                                Newest
                            </Button>
                            <Button
                                onClick={() => setFilter('asc')}
                                className={`min-w-fit ${
                                    filter === 'asc'
                                        ? 'bg-primary-500 text-light-1 hover:bg-primary-500'
                                        : 'bg-dark-3 text-light-2 border-dark-4 hover:bg-dark-4'
                                }`}
                            >
                                Oldest
                            </Button>
                        </div>
                    </div>
                </header>

                <ScrollArea className="w-full">
                    {loading && page === 1 ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <p className="text-light-3">Loading communities...</p>
                        </div>
                    ) : communities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[200px]">
                            <p className="text-light-3 text-center">
                                No communities found. Try adjusting your search.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {communities.map((community) => (
                                    <Card
                                        key={community.externalId}
                                        className="bg-dark-3 border-dark-4 hover:bg-dark-4 transition-colors duration-200"
                                    >
                                        <CardHeader className="flex flex-row items-start gap-4 p-6">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={community.image} alt={community.name} />
                                                <AvatarFallback className="bg-dark-4 text-light-1 text-lg">
                                                    {community.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <CardTitle className="text-light-1 text-xl mb-1">
                                                    {community.name}
                                                </CardTitle>
                                                <div className="flex items-center text-light-2 mb-3">
                                                    <Users className="w-4 h-4 mr-2" />
                                                    <span className="text-sm">
                                                        {community.members.length} members
                                                    </span>
                                                </div>
                                                <p className="text-light-2 text-sm line-clamp-2">
                                                    {community.bio}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardFooter className="p-6 pt-0">
                                            <Button
                                                onClick={() => handleJoinCommunity(community.externalId)}
                                                className="w-full bg-primary-500 hover:bg-primary-500/90 text-light-1"
                                            >
                                                Join Community
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="mt-8 flex justify-center">
                                    <Button
                                        onClick={() => fetchCommunityData()}
                                        disabled={loading}
                                        className="bg-dark-3 text-light-1 hover:bg-dark-4"
                                    >
                                        {loading ? 'Loading...' : 'Load More'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}