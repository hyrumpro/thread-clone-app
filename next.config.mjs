/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "example.com", // Remove this if you don't need it
            "uploadthing.com",
            "utfs.io", // For uploadthing
            "img.clerk.com", // For Clerk
            "images.clerk.dev", // For Clerk
            "lh3.googleusercontent.com", // For Google
            "placehold.co", // If you're using placeholder images
        ],
    },
    reactStrictMode: true,
};

export default nextConfig;
