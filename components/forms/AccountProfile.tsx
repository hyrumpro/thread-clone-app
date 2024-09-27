"use client";
import React, { useState, useCallback, useTransition } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserValidation } from "@/lib/validations/user";
import { useCustomUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";
import { findAndUpdateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from 'next/navigation';

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}


const Image = dynamic(() => import('next/image'), { ssr: false });

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}

const AccountProfile: React.FC<Props> = ({ user, btnTitle }) => {
    const [files, setFiles] = useState<File[]>([]);
    const { handleUpload, isUploading } = useCustomUploadThing();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();

    const form = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            profile_photo: user.image || "",
            name: user.name || "",
            username: user.username || "",
            bio: user.bio || "",
        },
    });

    const handleImage = useCallback((
        e: React.ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string) => void
    ) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles([file]);

            if (!file.type.includes("image")) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";
                fieldChange(imageDataUrl);
            };

            fileReader.readAsDataURL(file);
        }
    }, []);

    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        const blob = values.profile_photo;

        const hasImageChanged = isBase64Image(blob);
        let imgUrl = user.image;

        if (hasImageChanged) {
            const uploadedImgUrl = await handleUpload(files);
            if (uploadedImgUrl) {
                imgUrl = uploadedImgUrl;
            }
        }

        startTransition(async () => {
            try {
                await findAndUpdateUser({
                    userId: user.id,
                    username: values.username,
                    name: values.name,
                    bio: values.bio,
                    image: imgUrl,
                    path: pathname
                });
                if(pathname === "/profile/edit") {
                    router.back()
                } else {
                    router.push("/")
                }
            } catch (error) {
                console.error("Error updating user:", error);
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="profile_photo"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-center gap-4">
                            <FormLabel htmlFor="profile_photo" className="account-form_image-label group cursor-pointer relative overflow-hidden">
                                {field.value ? (
                                    <Image
                                        src={field.value}
                                        alt="profile photo"
                                        width={96}
                                        height={96}
                                        className="rounded-full object-cover transition-all group-hover:opacity-80"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-24 h-24 bg-dark-4 rounded-full text-light-2 text-2xl font-bold transition-all group-hover:bg-dark-3">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                    <span className="text-light-1 text-sm">Change Photo</span>
                                </div>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImage(e, field.onChange)}
                                    id="profile_photo"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-light-2">Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your name" className="account-form_input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-light-2">Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Your username" className="account-form_input" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-light-2">Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us about yourself"
                                    className="account-form_input resize-none"
                                    {...field}
                                    rows={4}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full bg-primary-500 hover:bg-primary-500/90 text-light-1 transition-all"
                    disabled={isUploading}
                >
                    {isPending || isUploading ? "Updating..." : btnTitle}
                </Button>
            </form>
        </Form>
    );
};

export default AccountProfile;