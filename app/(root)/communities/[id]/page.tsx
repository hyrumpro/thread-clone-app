import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { communityTabs } from "@/constants";
import ThreadsTab from "@/components/shared/ThreadTab";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { Button } from "@/components/ui/button";
import { OrganizationProfile } from '@clerk/nextjs'

async function CommunityDetails({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    const communityDetails = await fetchCommunityDetails(params.id);
    if (!communityDetails) return redirect("/communities");

    const communityPosts = await fetchCommunityPosts(params.id);

    // Check if user is a member
    const isMember = communityDetails.members.some(
        (member: any) => member.id === user.id
    );

    const handleMembershipModal = async () => {

        try {
            if (isMember) {
                return <OrganizationProfile />
            } else {
                return <OrganizationProfile />
            }
        } catch (error) {
            console.error("Error handling membership:", error);
        }
    };

    return (
        <section className="flex flex-col gap-10 bg-dark-1 w-full">
            <div className="relative">
                {/* Community Banner */}
                <div className="h-48 w-full bg-dark-3 relative overflow-hidden">
                    {communityDetails.banner && (
                        <Image
                            src={communityDetails.banner}
                            alt="community banner"
                            fill
                            className="object-cover"
                        />
                    )}
                </div>

                {/* Community Info */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12">
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 bg-dark-2 p-6 rounded-xl shadow-lg">
                        {/* Community Avatar */}
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                            <Image
                                src={communityDetails.image}
                                alt={communityDetails.name}
                                fill
                                className="rounded-full border-4 border-dark-1 object-cover"
                            />
                        </div>

                        {/* Community Details */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-light-1">
                                        {communityDetails.name}
                                    </h1>
                                    <p className="text-light-3">@{communityDetails.username}</p>
                                </div>

                                <form action={handleMembershipModal}>
                                    <Button
                                        className={`px-8 ${
                                            isMember
                                                ? "bg-dark-4 hover:bg-dark-4/80"
                                                : "bg-primary-500 hover:bg-primary-500/80"
                                        }`}
                                    >
                                        {isMember ? "Joined" : "Join Community"}
                                    </Button>
                                </form>
                            </div>

                            {/* Stats & Bio */}
                            <div className="mt-4 space-y-4">
                                <p className="text-light-2">{communityDetails.bio}</p>
                                <div className="flex gap-8 text-light-2">
                                    <div>
                                        <span className="text-light-1 font-semibold">
                                            {communityDetails.members.length}
                                        </span>{" "}
                                        members
                                    </div>
                                    <div>
                                        <span className="text-light-1 font-semibold">
                                            {communityPosts.threads?.length || 0}
                                        </span>{" "}
                                        threads
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6">
                <Tabs defaultValue="threads" className="w-full">
                    <TabsList className="tab">
                        {communityTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                                <p className="max-sm:hidden">{tab.label}</p>

                                {tab.label === "Threads" && (
                                    <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                                        {communityPosts.threads?.length || 0}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="threads" className="w-full text-light-1">
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={communityDetails._id}
                            accountType="Community"
                        />
                    </TabsContent>

                    <TabsContent value="members" className="w-full text-light-1">
                        <section className="mt-9 flex flex-col gap-10">
                            {communityDetails.members.map((member: any) => (
                                <div key={member.id} className="flex items-center gap-4">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-base-semibold text-light-1">
                                            {member.name}
                                        </h4>
                                        <p className="text-small-medium text-gray-1">
                                            @{member.username}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </TabsContent>

                    <TabsContent value="requests" className="w-full text-light-1">
                        <section className="mt-9 flex flex-col gap-10">
                            {/* Add request handling if needed */}
                            <p className="no-result">No join requests pending</p>
                        </section>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}

export default CommunityDetails;