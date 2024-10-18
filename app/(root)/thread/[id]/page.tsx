import { fetchThreadById } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";
import { getUserByCustomId } from "@/lib/actions/user.actions";

interface Author {
    _id: string;
    id?: string;
    name: string;
    image: string;
    username: string;
}

interface Thread {
    _id: string;
    text: string;
    author: Author;
    community: null | any;
    children: Thread[];
    createdAt: string;
    parentId?: string | null;  
    __v: number;
}

export default async function ThreadPage({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const userInfo = await getUserByCustomId(user.id);

    const threadData = await fetchThreadById({ threadId: params.id });
    if (!threadData) redirect("/");


    const thread = threadData as unknown as Thread;
    console.log(thread);


    const transformedAuthor = {
        _id: thread.author._id,
        image: thread.author.image,
        username: thread.author.name
    };

    return (
        <div className="flex flex-col p-8 w-full">
            <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={user.id}
                parentId={thread.parentId || null}
                content={thread.text}
                author={transformedAuthor}
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
                    {thread.children.map((childThread: Thread) => (
                        <ThreadCard
                            key={childThread._id}
                            id={childThread._id}
                            currentUserId={user.id}
                            parentId={childThread.parentId || null}
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