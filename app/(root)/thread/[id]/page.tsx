import { fetchThreadById } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";
import {getUserByCustomId} from "@/lib/actions/user.actions";

export default async function ThreadPage({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const userInfo = await getUserByCustomId(user.id);

    const thread = await fetchThreadById({ threadId: params.id });
    if (!thread) redirect("/");

    return (
        <div className="flex flex-col p-8 w-full">
            <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={user.id}
                parentId={thread.parentId}
                content={thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
            />

            <div className="mt-7 w-full max-w-3xl">
                <Comment
                    threadId={thread._id}
                    currentUserImg={userInfo.image}
                    currentUserId={JSON.stringify(userInfo._id)}
                />
            </div>

            {thread.children && thread.children.length > 0 && (
                <div className="w-full max-w-3xl mt-10">
                    <h2 className="text-xl font-semibold text-light-1 mb-4">Replies</h2>
                    {thread.children.map((childThread: any) => (
                        <ThreadCard
                            key={childThread._id}
                            id={childThread._id}
                            currentUserId={user.id}
                            parentId={childThread.parentId}
                            content={childThread.text}
                            author={childThread.author}
                            community={childThread.community}
                            createdAt={childThread.createdAt}
                            comments={childThread.children}
                            isComment
                        />
                    ))}
                </div>
            )}
        </div>
    );
}