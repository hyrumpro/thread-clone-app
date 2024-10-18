import { fetchUserThreads } from "@/lib/actions/thread.actions";
import ThreadCard from "@/components/cards/ThreadCard";

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

interface Thread {
    _id: string;
    text: string;
    author: {
        _id: string;
        name: string;
        image: string;
    };
    parentId: string | null;
    community: any | null;
    createdAt: string;
    children: any[];
}

const ThreadsTabs = async ({ currentUserId, accountId, accountType }: Props) => {
    let threads: Thread[] = [];

    try {
        const fetchedThreads = await fetchUserThreads({ userId: accountId });
        threads = fetchedThreads.threads;
    } catch (error) {
        console.error("Error fetching user threads:", error);
    }

    return (
        <section className="mt-9 flex flex-col gap-10">
            {threads.length > 0 ? (
                threads.map((thread) => (
                    <ThreadCard
                        key={thread._id}
                        id={thread._id}
                        currentUserId={currentUserId}
                        parentId={thread.parentId}
                        content={thread.text}
                        author={{
                            _id: thread.author._id,
                            username: thread.author.name,
                            image: thread.author.image
                        }}
                        community={thread.community || null}
                        createdAt={thread.createdAt}
                        comments={thread.children || []}
                    />
                ))
            ) : (
                <p className="text-base-regular text-light-3">No threads found.</p>
            )}
        </section>
    );
};

export default ThreadsTabs;