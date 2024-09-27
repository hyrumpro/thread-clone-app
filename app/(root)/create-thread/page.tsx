import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByCustomId } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";

async function Page() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userInfo = await getUserByCustomId(user.id);

    if (!userInfo?.onboarded) {
        redirect("/onboarding");
    }

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
            <h1 className="head-text text-left w-full">Create a New Thread</h1>
            <p className="mt-3 text-base-regular text-light-2 w-full mb-10">
                Share your thoughts with the community.
            </p>

            <PostThread userId={userInfo._id} />
        </div>
    );
}

export default Page;