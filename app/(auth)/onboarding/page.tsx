import { currentUser } from "@clerk/nextjs/server";
import { getUserByCustomId } from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";
import dynamic from 'next/dynamic';


const AccountProfile = dynamic(() => import('@/components/forms/AccountProfile'), {
    ssr: false,
    loading: () => <p className="text-light-1">Loading profile...</p>
});


async function Page() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const userInfo = await getUserByCustomId(user.id);

    if (userInfo.onboarded) {
        redirect("/");
    }


    const userData = {
        id: user?.id,
        objectId: userInfo._id,
        username: userInfo?.username || user?.username,
        name: userInfo?.name || user?.firstName || "name",
        bio: userInfo?.bio || "",
        image: userInfo?.image || user?.imageUrl
    }

    return(
        <div className="min-h-screen bg-dark-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full space-y-8">
                <div>
                    <h1 className="head-text text-center text-4xl font-extrabold text-light-1">Welcome to Threads</h1>
                    <p className="mt-3 text-center text-xl text-light-2">Complete your profile to get started</p>
                </div>
                <div className="mt-10 bg-dark-2 p-8 shadow-lg rounded-lg">
                    <AccountProfile
                        user={userData}
                        btnTitle="Let's Go!"
                    />
                </div>
            </div>
        </div>
    );
}

export default Page;

