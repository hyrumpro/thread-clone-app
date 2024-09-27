
import { getUserByCustomId } from "@/lib/actions/user.actions";
import { fetchUserThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import ThreadCard from "@/components/cards/ThreadCard";

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    const userInfo = await getUserByCustomId(params.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const threads = await fetchUserThreads(params.id);

    return (
        <section className="relative">
            <div className="flex flex-col items-center justify-center">
                <Image
                    src={userInfo.image}
                    alt="profile picture"
                    width={100}
                    height={100}
                    className="rounded-full"
                />
                <h1 className="head-text mt-4">{userInfo.name}</h1>
                <p className="text-base-regular text-light-2">@{userInfo.username}</p>
                <p className="text-base-regular text-light-2 mt-2 max-w-lg text-center">{userInfo.bio}</p>
            </div>

            <div className="mt-8">
                <h2 className="text-left text-heading3-bold text-light-1">Threads</h2>
                <div className="mt-5 flex flex-col gap-5">
                    {threads.map((thread: any) => (
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
                    ))}
                </div>
            </div>
        </section>
    );
}