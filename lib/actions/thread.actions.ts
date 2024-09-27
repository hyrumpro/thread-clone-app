"use server";

import { connectToDb } from "@/lib/mongoose";
import Thread from "@/lib/models/thread.model";
import UserModel from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

interface Params {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}

interface FetchThreadsParams {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
    page: number;
    limit: number;
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


function toPlainObject(doc: any): any {
    const obj = doc.toObject ? doc.toObject() : doc;
    Object.keys(obj).forEach(key => {
        if (obj[key] instanceof mongoose.Types.ObjectId) {
            obj[key] = obj[key].toString();
        } else if (Array.isArray(obj[key])) {
            obj[key] = obj[key].map(toPlainObject);
        } else if (obj[key] instanceof Object) {
            obj[key] = toPlainObject(obj[key]);
        }
    });
    return obj;
}

export async function createThread({ text, author, communityId, path }: Params) {

    try {
        await connectToDb();

        const createdThread = await Thread.create({
            text,
            author,
            community: communityId
        });

        await UserModel.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        });

        revalidatePath(path);

    } catch (error) {
        console.error('Error creating thread:', error);
        throw new Error('Failed to create thread');
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

        // Convert threads to plain objects
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
