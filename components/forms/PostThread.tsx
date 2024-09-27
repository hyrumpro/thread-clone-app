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


const ThreadSchema = z.object({
    content: z.string().min(10, "Content must be at least 10 characters long").max(1000, "Content must be less than 1000 characters"),
    accountId: z.string()
});

function PostThread({ userId }: { userId: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof ThreadSchema>>({
        resolver: zodResolver(ThreadSchema),
        defaultValues: {
            content: "",
            accountId: userId
        },
    });

    const onSubmit = async (values: z.infer<typeof ThreadSchema>) => {
        setIsSubmitting(true);
        try {
            await createThread({
                text: values.content,
                author: values.accountId,
                communityId: null,
                path: pathname
            });
            router.push('/');
        } catch (error) {
            console.error("Error creating thread:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-3xl mx-auto bg-dark-2 px-4 py-10 rounded-xl">
            <h1 className="head-text mb-10">Create a New Thread</h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-light-2">Content</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="What's on your mind?"
                                        className="account-form_input min-h-[150px] resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="bg-primary-500 hover:bg-primary-500/90 text-light-1 transition-all"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating..." : "Create Thread"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export default PostThread;