import ProfileHeader from "@/components/shared/ProfileHeader";
import { getUserByCustomId } from "@/lib/actions/user.actions";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { profileTabs } from "@/constants";
import ThreadsTabs from "@/components/shared/ThreadTab";

export default async function ProfilePage() {
    const { userId } = auth();
    if (!userId) return redirect("/sign-in");

    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    try {
        const userInfo = await getUserByCustomId(userId);
        if (!userInfo) {
            throw new Error("User not found");
        }


        return (
            <section className="relative bg-dark-1 w-full p-6">
                <ProfileHeader
                    accountID={userInfo._id}
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
                                            {userInfo?.threads?.length}
                                        </p>
                                    )}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="threads">
                            <ThreadsTabs
                                currentUserId={userId}
                                accountId={userInfo._id.toString()}
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
            <div className="flex justify-center items-center h-full text-light-1">
                Error loading profile. Please try again later.
            </div>
        );
    }
}
