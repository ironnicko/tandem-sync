import type { NextConfig } from "next";
import withPWA from "next-pwa";

export const nextConfig: NextConfig = {
    reactStrictMode: true,

    images: {
        domains: [
            "lh3.googleusercontent.com",
            "lh4.googleusercontent.com",
            "lh5.googleusercontent.com",
        ],

        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
    },
};

// export default withPWA({
//     ...nextConfig,
//     dest: "public",
//     register: true,
//     skipWaiting: true,
//     disable: process.env.NODE_ENV === "development",
// });
