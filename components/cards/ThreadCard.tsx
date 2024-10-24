import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';

interface Author {
    _id: string;
    name: string;
    username: string;
    image: string;
}

interface Community {
    _id: string;
    id: string;
    name: string;
    image: string;
}

interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: Author;
    community: Community | null;
    createdAt: string;
    comments: {
        author: {
            image: string;
        };
    }[];
    isComment?: boolean;
}

const ThreadCard = ({
                        id,
                        currentUserId,
                        parentId,
                        content,
                        author,
                        community,
                        createdAt,
                        comments,
                        isComment
                    }: Props) => {
    const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

    return (
        <article className={`p-7 rounded-xl ${isComment ? "px-0 xs:px-7" : "bg-dark-2 p7"} mb-4 w-full max-w-3xl mx-auto flex-col`}>
            <div className="flex items-start justify-between">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <Link href={`/profile/${author._id}`} className="relative h-11 w-11">
                            <Image
                                src={author.image}
                                alt={author.name}
                                fill
                                className="cursor-pointer rounded-full"
                            />
                        </Link>
                        <div className="thread-card_bar"/>
                    </div>
                    <div className="flex w-full flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <Link href={`/profile/${author._id}`} className="w-fit">
                                        <h4 className="cursor-pointer text-base-semibold text-light-1">
                                            {author.name}
                                        </h4>
                                    </Link>
                                    <p className="text-subtle-medium text-gray-1">
                                        @{author.username}
                                    </p>
                                    <span className="text-subtle-medium text-gray-1">
                                        • {formattedDate}
                                    </span>
                                </div>
                            </div>

                            {community && (
                                <Link
                                    href={`/communities/${community.id}`}
                                    className="flex items-center gap-2 mt-2 sm:mt-0 px-3 py-1.5 rounded-full bg-dark-3 hover:bg-dark-4 transition-colors"
                                >
                                    <Image
                                        src={community.image}
                                        alt={community.name}
                                        width={14}
                                        height={14}
                                        className="rounded-full"
                                    />
                                    <span className="text-subtle-medium text-gray-1 max-w-[100px] truncate">
                                        {community.name}
                                    </span>
                                </Link>
                            )}
                        </div>

                        <p className="mt-2 text-light-2 text-small-regular">{content}</p>

                        <div className="mt-5 flex flex-col gap-3">
                            <div className="flex gap-3.5">
                                <button
                                    className="hover:bg-dark-4 p-2 rounded-full transition-colors"
                                    aria-label="Like thread"
                                >
                                    <Image
                                        src="/assets/heart-gray.svg"
                                        alt="heart"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                    />
                                </button>
                                <Link
                                    href={`/thread/${id}`}
                                    className="hover:bg-dark-4 p-2 rounded-full transition-colors"
                                >
                                    <Image
                                        src="/assets/reply.svg"
                                        alt="reply"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                    />
                                </Link>
                                <button
                                    className="hover:bg-dark-4 p-2 rounded-full transition-colors"
                                    aria-label="Repost thread"
                                >
                                    <Image
                                        src="/assets/repost.svg"
                                        alt="repost"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                    />
                                </button>
                                <button
                                    className="hover:bg-dark-4 p-2 rounded-full transition-colors"
                                    aria-label="Share thread"
                                >
                                    <Image
                                        src="/assets/share.svg"
                                        alt="share"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                    />
                                </button>
                            </div>

                            {comments.length > 0 && (
                                <Link
                                    href={`/thread/${id}`}
                                    className="flex items-center gap-2 text-gray-1"
                                >
                                    <div className="flex -space-x-2">
                                        {comments.slice(0, 2).map((comment, index) => (
                                            <Image
                                                key={index}
                                                src={comment.author.image}
                                                alt="commenter"
                                                width={16}
                                                height={16}
                                                className="rounded-full border-2 border-dark-1"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-subtle-medium text-gray-1">
                                        {comments.length} repl{comments.length === 1 ? 'y' : 'ies'}
                                    </p>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ThreadCard;




