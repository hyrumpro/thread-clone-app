"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { usePathname, useRouter } from 'next/navigation';
import { createThread } from "@/lib/actions/thread.actions";
import { useOrganization } from "@clerk/nextjs";

const ThreadSchema = z.object({
    content: z.string()
        .min(10, "Content must be at least 10 characters long")
        .max(1000, "Content must be less than 1000 characters"),
    accountId: z.string()
});

function PostThread({ userId }: { userId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const { organization, isLoaded } = useOrganization();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof ThreadSchema>>({
        resolver: zodResolver(ThreadSchema),
        defaultValues: {
            content: "",
            accountId: userId
        },
    });

    const onSubmit = async (values: z.infer<typeof ThreadSchema>) => {
        setIsSubmitting(true);
        setError(null);
        console.log(organization);

        try {
            const communityId = organization ? organization.id : null;

            await createThread({
                text: values.content,
                author: values.accountId,
                communityId: communityId,
                path: pathname
            });

            if (communityId) {
                router.push(`/communities/${communityId}`);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error("Error creating thread:", error);
            setError("Failed to create thread. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center w-full h-52">
                <div className="animate-pulse text-light-3">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto bg-dark-2 px-4 py-10 rounded-xl">
            <h1 className="head-text mb-6">Create a New Thread</h1>

            {organization && (
                <div className="flex items-center gap-2 bg-dark-3 px-4 py-2 rounded-lg mb-6">
                    <img
                        src={organization.imageUrl}
                        alt={organization.name}
                        className="w-6 h-6 rounded-full"
                    />
                    <p className="text-light-2 text-sm">
                        Posting in {organization.name}
                    </p>
                </div>
            )}


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-light-2">
                                    {organization ? "Share with your community" : "What's on your mind?"}
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={
                                            organization
                                                ? `Share something with ${organization.name}...`
                                                : "Share your thoughts..."
                                        }
                                        className="account-form_input min-h-[150px] resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="bg-primary-500 hover:bg-primary-500/90 text-light-1 transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Thread"}
                        </Button>

                        {organization && (
                            <p className="text-light-3 text-xs text-center">
                                This thread will be visible to all members of {organization.name}
                            </p>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default PostThread;