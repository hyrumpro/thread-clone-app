"use server";

import { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import UserModel from "../models/user.model";

import { connectToDb } from "../mongoose";

export async function createCommunity(
    externalId: string,
    name: string,
    username: string,
    image: string,
    bio: string,
    createdById: string // Change the parameter name to reflect it's an id
) {
    try {
        await connectToDb();

        // Find the user with the provided unique id
        const user = await UserModel.findOne({ id: createdById });

        if (!user) {
            throw new Error("User not found"); // Handle the case if the user with the id is not found
        }

        const newCommunity = new Community({
            externalId,
            name,
            username,
            image,
            bio,
            createdBy: user._id, // Use the mongoose ID of the user
        });

        const createdCommunity = await newCommunity.save();

        // Update User model
        user.communities.push(createdCommunity._id);
        await user.save();

        return createdCommunity;
    } catch (error) {
        // Handle any errors
        console.error("Error creating community:", error);
        throw error;
    }
}

export async function fetchCommunityDetails(externalId: string) {
    try {
        await connectToDb();

        const communityDetails = await Community.findOne({ externalId }).populate([
            "createdBy",
            {
                path: "members",
                model: UserModel,
                select: "name username image _id id",
            },
        ]);

        return communityDetails;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching community details:", error);
        throw error;
    }
}

export async function fetchCommunityPosts(externalId: string) {
    try {
        await connectToDb();

        const communityPosts = await Community.findById(externalId).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "author",
                    model: UserModel,
                    select: "name image id", // Select the "name" and "_id" fields from the "User" model
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: UserModel,
                        select: "image _id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });

        return communityPosts;
    } catch (error) {
        // Handle any errors
        console.error("Error fetching community posts:", error);
        throw error;
    }
}

export async function fetchCommunities({
                                           searchString = "",
                                           pageNumber = 1,
                                           pageSize = 20,
                                           sortBy = "desc",
                                       }: {
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        await connectToDb();

        // Calculate the number of communities to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");

        // Create an initial query object to filter communities.
        const query: FilterQuery<typeof Community> = {};

        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // Define the sort options for the fetched communities based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        // Create a query to fetch the communities based on the search and sort criteria.
        const communitiesQuery = Community.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .populate("members");

        // Count the total number of communities that match the search criteria (without pagination).
        const totalCommunitiesCount = await Community.countDocuments(query);

        const communities = await communitiesQuery.exec();

        // Check if there are more communities beyond the current page.
        const isNext = totalCommunitiesCount > skipAmount + communities.length;

        return { communities, isNext };
    } catch (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
}

export async function addMemberToCommunity(
    communityId: string,
    memberId: string
) {
    try {
        await connectToDb();


        const community = await Community.findOne({ externalId: communityId });

        if (!community) {
            throw new Error("Community not found");
        }


        const user = await UserModel.findOne({ id: memberId });

        if (!user) {
            throw new Error("User not found");
        }


        if (community.members.includes(user._id)) {
            throw new Error("User is already a member of the community");
        }


        community.members.push(user._id);
        await community.save();


        user.communities.push(community._id);
        await user.save();

        return community;
    } catch (error) {
        // Handle any errors
        console.error("Error adding member to community:", error);
        throw error;
    }
}

export async function removeUserFromCommunity(
    userId: string,
    communityId: string
) {
    try {
        await connectToDb();

        const userIdObject = await UserModel.findOne({ id: userId }, { _id: 1 });
        const communityIdObject = await Community.findOne(
            { externalId: communityId }
        );

        if (!userIdObject) {
            throw new Error("User not found");
        }

        if (!communityIdObject) {
            throw new Error("Community not found");
        }

        // Remove the user's _id from the members array in the community
        await Community.updateOne(
            { _id: communityIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // Remove the community's _id from the communities array in the user
        await UserModel.updateOne(
            { _id: userIdObject._id },
            { $pull: { communities: communityIdObject._id } }
        );

        return { success: true };
    } catch (error) {
        // Handle any errors
        console.error("Error removing user from community:", error);
        throw error;
    }
}

export async function updateCommunityInfo(
    communityId: string,
    name: string,
    username: string,
    image: string
) {
    try {
        await connectToDb();

        const updatedCommunity = await Community.findOneAndUpdate(
            { externalId: communityId },
            { name, username, image }
        );

        if (!updatedCommunity) {
            throw new Error("Community not found");
        }

        return updatedCommunity;
    } catch (error) {
        // Handle any errors
        console.error("Error updating community information:", error);
        throw error;
    }
}

export async function deleteCommunity(communityId: string) {
    try {
        await connectToDb();

        // Find the community by its ID and delete it
        const deletedCommunity = await Community.findOneAndDelete({
            externalId: communityId,
        });

        if (!deletedCommunity) {
            throw new Error("Community not found");
        }

        // Delete all threads associated with the community
        await Thread.deleteMany({ community: communityId });

        // Find all users who are part of the community
        const communityUsers = await UserModel.find({ communities: communityId });

        // Remove the community from the 'communities' array for each user
        const updateUserPromises = communityUsers.map((user) => {
            user.communities.pull(communityId);
            return user.save();
        });

        await Promise.all(updateUserPromises);

        return deletedCommunity;
    } catch (error) {
        console.error("Error deleting community: ", error);
        throw error;
    }
}