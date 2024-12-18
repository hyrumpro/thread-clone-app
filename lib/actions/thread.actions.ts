"use server";

import { connectToDb } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import UserModel from "@/lib/models/user.model";
import Community from "@/lib/models/community.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";




interface FetchThreadsParams {
    page: number;
    limit: number;
}

interface CreateThreadParams {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}



interface FetchThreadByIdParams {
    threadId: string;
}

interface AddCommentToThreadParams {
    threadId: string;
    commentText: string;
    userId: string;
    path: string;
}

interface FetchUserThreadsParams {
    userId: string;
    page?: number;
    limit?: number;
}

interface SearchThreadsParams {
    searchQuery: string;
    authorFilter: string;
    sortOrder: 'latest' | 'oldest';
    page?: number;
    limit?: number;
}



function toPlainObject<T>(doc: T): T {
    return JSON.parse(JSON.stringify(doc));
}



export async function createThread({
                                       text,
                                       author,
                                       communityId,
                                       path
                                   }: CreateThreadParams) {
    try {
        await connectToDb();


        const threadData: any = {
            text,
            author,
            parentId: null
        };



        if (communityId) {
            const communityExists = await Community.findOne({ externalId: communityId });

            if (!communityExists) {
                throw new Error(`Community not found with ID: ${communityId}`);
            }
            threadData.community = communityExists._id;
        }


        const createdThread = await Thread.create(threadData);


        await UserModel.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        });


        if (threadData.community) {
            await Community.findByIdAndUpdate(threadData.community, {
                $push: { threads: createdThread._id }
            });
        }


        const populatedThread = await Thread.findById(createdThread._id)
            .populate({
                path: 'author',
                model: UserModel,
                select: '_id name username image'
            })
            .populate({
                path: 'community',
                model: Community,
                select: '_id id name image'
            });

        revalidatePath(path);
        return JSON.parse(JSON.stringify(populatedThread));
    } catch (error) {
        console.error('Error creating thread:', error);
        throw error;
    }
}


export async function fetchAllThreads({ page = 1, limit = 10 }: FetchThreadsParams) {
    try {
        await connectToDb();

        const skip = (page - 1) * limit;
        const threads = await Thread.find({
            parentId: { $in: [null, undefined] }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'author',
                model: UserModel,
                select: '_id username name image'
            })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: UserModel,
                    select: '_id name username parentId image'
                }
            })
            .lean();

        const totalThreads = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });
        const totalPages = Math.ceil(totalThreads / limit);


        const simplifiedThreads = threads.map(toPlainObject);

        return {
            threads: simplifiedThreads,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error fetching threads:', error);
        throw new Error('Failed to fetch threads');
    }
}



export async function fetchThreadById({ threadId }: FetchThreadByIdParams) {
    try {

        await connectToDb();

        if (!mongoose.Types.ObjectId.isValid(threadId)) {
            throw new Error('Invalid thread ID format');
        }

        const thread = await Thread.findById(threadId)
            .populate({
                path: 'author',
                model: UserModel,
                select: '_id name image'
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: UserModel,
                        select: '_id id username name parentId image'
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: UserModel,
                            select: '_id id username name parentId image'
                        }
                    }
                ]
            })
            .lean();

        if (!thread) {
            throw new Error('Thread not found');
        }


        const simplifiedThread = toPlainObject(thread);

        return simplifiedThread;
    } catch (error) {
        console.error('Error fetching thread by ID:', error);
        throw new Error('Failed to fetch thread');
    }
}



export async function addCommentToThread({
                                             threadId,
                                             commentText,
                                             userId,
                                             path
                                         }: AddCommentToThreadParams) {
    try {
        await connectToDb();


        const objectIdUserId = new mongoose.Types.ObjectId(userId);


        const originalThread = await Thread.findById(threadId);

        if (!originalThread) {
            throw new Error("Thread not found");
        }

        // Create a new thread as a comment
        const commentThread = new Thread({
            text: commentText,
            author: objectIdUserId,
            parentId: threadId,
        });

        const savedCommentThread = await commentThread.save();


        originalThread.children.push(savedCommentThread._id);
        await originalThread.save();


        await UserModel.findByIdAndUpdate(objectIdUserId, {
            $push: { threads: savedCommentThread._id }
        });

        revalidatePath(path);

        return savedCommentThread;
    } catch (error) {
        console.error('Error adding comment to thread:', error);
        throw error;
    }
}


export async function fetchUserThreads({
                                           userId,
                                           page = 1,
                                           limit = 10
                                       }: FetchUserThreadsParams): Promise<{
    threads: any[];
    totalPages: number;
    currentPage: number;
}> {
    try {
        await connectToDb();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        const skip = (page - 1) * limit;

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const threadsQuery = Thread.find({ author: userObjectId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'author',
                model: UserModel,
                select: '_id username name image'
            })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: UserModel,
                    select: '_id name username parentId image'
                }
            });

        const totalThreadsQuery = Thread.countDocuments({ author: userObjectId });


        const [threads, totalThreads] = await Promise.all([
            threadsQuery.exec(),
            totalThreadsQuery.exec()
        ]);

        const totalPages = Math.ceil(totalThreads / limit);


        const simplifiedThreads = threads.map(thread => toPlainObject(thread));

        return {
            threads: simplifiedThreads,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error fetching user threads:', error);
        throw new Error('Failed to fetch user threads');
    }
}


export async function searchThreads({
                                        searchQuery,
                                        authorFilter,
                                        sortOrder,
                                        page = 1,
                                        limit = 10
                                    }: SearchThreadsParams) {
    try {
        await connectToDb();

        const skip = (page - 1) * limit;

        if (!searchQuery && !authorFilter) {
            return { threads: [], totalPages: 0, currentPage: page };
        }

        const query: any = { parentId: { $in: [null, undefined] } };

        if (searchQuery) {
            query.text = new RegExp(searchQuery, 'i');
        }

        if (authorFilter) {
            const matchingAuthors = await UserModel.find({
                $or: [
                    { name: new RegExp(authorFilter, 'i') },
                    { username: new RegExp(authorFilter, 'i') }
                ]
            }).select('_id');

            if (matchingAuthors.length > 0) {
                query.author = { $in: matchingAuthors.map(author => author._id) };
            } else {
                return { threads: [], totalPages: 0, currentPage: page };
            }
        }

        const [threads, totalThreads] = await Promise.all([
            Thread.find(query)
                .sort({ createdAt: sortOrder === 'latest' ? -1 : 1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'author',
                    model: UserModel,
                    select: '_id name username image'
                })
                .populate({
                    path: 'children',
                    populate: {
                        path: 'author',
                        model: UserModel,
                        select: '_id name username image'
                    }
                })
                .lean(),
            Thread.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalThreads / limit);

        return {
            threads,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        console.error('Error searching threads:', error);
        throw new Error('Failed to search threads');
    }
}

