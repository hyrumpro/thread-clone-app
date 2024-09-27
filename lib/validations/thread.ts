import * as z from "zod";

export const ThreadValidation = z.object({
    content: z.string().min(10, "Content must be at least 10 characters long").max(1000, "Content must be less than 1000 characters"),
    accountId: z.string()
});


export const CommentValidation = z.object({
    content: z.string().min(10, "Content must be at least 10 characters long").max(1000, "Content must be less than 1000 characters"),
    accountId: z.string()
});