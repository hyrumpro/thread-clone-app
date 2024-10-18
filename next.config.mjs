/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "example.com", // Remove this
            "uploadthing.com",
            "utfs.io",
            "img.clerk.com",
            "images.clerk.dev",
            "lh3.googleusercontent.com",
        ],
    },
    reactStrictMode: true,
};

export default nextConfig;
