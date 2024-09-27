import { fetchThreadById } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";
import { getUserByCustomId } from "@/lib/actions/user.actions";

interface Author {
    _id: string;
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

export default async function ThreadPage({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const userInfo = await getUserByCustomId(user.id);
    if (!userInfo) redirect("/onboarding");

    const thread = await fetchThreadById(params.id) as Thread | null;
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
                isComment={false}
            />

            <div className="mt-7 w-full max-w-3xl">
                <Comment
                    threadId={thread._id}
                    currentUserImg={userInfo.image}
                    currentUserId={userInfo._id.toString()}
                />
            </div>

            {thread.children.length > 0 && (
                <div className="w-full max-w-3xl mt-10">
                    <h2 className="text-xl font-semibold text-light-1 mb-4">Replies</h2>
                    {thread.children.map((childThread) => (
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
                            isComment={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}