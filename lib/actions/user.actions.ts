"use server";

import UserModel from '../models/user.model';
import { connectToDb } from '../mongoose';
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import Thread from "@/lib/models/thread.model";

interface IUserPlainObject {
    id: string;
    username: string;
    name: string;
    bio?: string;
    image?: string;
    onboarded: boolean;
    path: string;
}


interface Activity {
    type: 'reply';
    threadId: string;
    replierName: string;
    replierUsername: string;
    replierImage: string;
    replyContent: string;
    createdAt: Date;
}




export async function findAndUpdateUser({
                                            userId,
                                            username,
                                            name,
                                            bio,
                                            image,
                                            path
                                        }: {
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string
}): Promise<Record<string, IUserPlainObject>> {
    try {
        await connectToDb();

        const updateData = {
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true
        };

        console.log(`Attempting to update user with ID: ${userId}`);
        const updatedUser = await UserModel.findOneAndUpdate(
            { id: userId },
            { $set: updateData },
            { new: true, runValidators: true, upsert: true }
        );

        if (!updatedUser) {
            console.error(`User with ID: ${userId} not found`);
            throw new Error('User not found');
        }

        if (path === "profile/edit") {
            revalidatePath(path);
        }

        console.log(`User with ID: ${userId} successfully updated`);

        return updatedUser.toObject();
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Could not update user');
    }
}






/**
 * Get a user by ID
 * @param id - The ID of the user to retrieve
 */
/**
 * Get a user by custom ID
 * @param id - The custom ID of the user to retrieve
 */
export async function getUserByCustomId(id: string) {
    try {
        await connectToDb();

        let user;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await UserModel.findOne({ _id: id });
        } else {
            user = await UserModel.findOne({ id: id });
        }

        if (!user) {
            console.log(`No user found with ID: ${id}`);
            return [];
        }

        return user.toObject();
    } catch (error) {
        console.error('Error retrieving user:', error);
        throw error;
    }
}


/**
 * Delete a user by ID
 * @param id - The ID of the user to delete
 */
export async function deleteUser(id: string) {
    await connectToDb();

    try {
        const result = await UserModel.findByIdAndDelete(id);
        if (!result) {
            throw new Error('User not found');
        }
        return result;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}


export async function fetchUserActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    try {
        await connectToDb();

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID');
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);


        const userThreads = await Thread.find({ author: userObjectId }).select('_id');


        const replies = await Thread.find({
            parentId: { $in: userThreads.map(thread => thread._id) }
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate({
                path: 'author',
                model: UserModel,
                select: 'name username image'
            })
            .populate({
                path: 'parentId',
                model: Thread,
                select: '_id'
            })
            .lean();

        const activities: Activity[] = replies.map(reply => ({
            type: 'reply',
            threadId: reply.parentId._id.toString(),
            replierName: reply.author.name,
            replierUsername: reply.author.username,
            replierImage: reply.author.image,
            replyContent: reply.text,
            createdAt: reply.createdAt
        }));

        return activities;

    } catch (error) {
        console.error('Error fetching user activities:', error);
        throw new Error('Failed to fetch user activities');
    }
}

