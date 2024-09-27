"use client";

import { useState } from "react";
import { z } from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { CommentValidation } from "@/lib/validations/thread";
import { addCommentToThread } from "@/lib/actions/thread.actions";

interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
}

function Comment({ threadId, currentUserImg, currentUserId }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            content: "",
            accountId: currentUserId
        },
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        console.log("Submitting comment:", values);
        setIsSubmitting(true);
        try {
            await addCommentToThread({
                threadId,
                commentText: values.content,
                userId: JSON.parse(currentUserId),
                path: pathname,
            });

            console.log("Comment added successfully");
            form.reset();
            router.refresh();
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Image
                                    src={currentUserImg}
                                    alt='current_user'
                                    width={48}
                                    height={48}
                                    className='rounded-full object-cover'
                                />
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input
                                    type='text'
                                    {...field}
                                    placeholder='Comment...'
                                    className='no-focus text-light-1 outline-none'
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormMessage />

                <Button
                    type='submit'
                    className='comment-form_btn'
                    disabled={isSubmitting || !form.formState.isValid}
                >
                    {isSubmitting ? 'Replying...' : 'Reply'}
                </Button>
            </form>
        </Form>
    );
}

export default Comment;