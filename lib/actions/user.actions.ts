"use server";

import UserModel from '../models/user.model';
import { connectToDb } from '../mongoose';
import { revalidatePath } from "next/cache";

interface IUserPlainObject {
    id: string;
    username: string;
    name: string;
    bio?: string;
    image?: string;
    onboarded: boolean;
    path: string;
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
    await connectToDb();

    try {
        const user = await UserModel.findOne({ id: id });
        if (!user) {
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

