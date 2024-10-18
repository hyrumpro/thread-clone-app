import ProfileHeader from "@/components/shared/ProfileHeader";
import { getUserByCustomId } from "@/lib/actions/user.actions";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { profileTabs } from "@/constants";
import ThreadsTabs from "@/components/shared/ThreadTab";

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const { userId } = auth();
    if (!userId) return redirect("/sign-in");

    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    try {
        const userInfo = await getUserByCustomId(params.id);

        if (!userInfo || Object.keys(userInfo).length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-dark-1 text-light-1">
                    <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
                    <p className="text-xl text-light-2">The profile you re looking for doesnt exist or has been removed.</p>
                    <a href="/" className="mt-8 px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                        Return to Home
                    </a>
                </div>
            );
        }

        return (
            <section className="relative bg-dark-1 w-full p-6">
                <ProfileHeader
                    accountID={params.id}
                    authUserId={userId}
                    name={userInfo.name}
                    username={userInfo.username}
                    imgUrl={userInfo.image}
                    bio={userInfo.bio}
                />

                <div className="mt-12 px-4">
                    <Tabs defaultValue="threads" className="w-full">
                        <TabsList className="tab">
                            {profileTabs.map((tab) => (
                                <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                    <Image
                                        src={tab.icon}
                                        width={24}
                                        height={24}
                                        alt={tab.label}
                                        className="object-contain"
                                    />
                                    <p className="max-sm:hidden">{tab.label}</p>

                                    {tab.label === "Threads" && (
                                        <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                                            {userInfo?.threads?.length || 0}
                                        </p>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <TabsContent value="threads">
                            <ThreadsTabs
                                currentUserId={userId}
                                accountId={params.id}
                                accountType="User"
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        );
    } catch (error) {
        console.error("Error loading profile:", error);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-dark-1 text-light-1">
                <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
                <p className="text-xl text-light-2">We are having trouble loading this profile. Please try again later.</p>
                <a href="/" className="mt-8 px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                    Return to Home
                </a>
            </div>
        );
    }
}