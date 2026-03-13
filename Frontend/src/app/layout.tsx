import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "./globals.css";
import { Suspense } from "react";
import { Loader } from "lucide-react";
import ClientWrappers from "@/components/ClientWrappers";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "TandemSync",
    description: "Sync your rides and communicate effortlessly.",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "TandemSync",
    },
};

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <script
                defer
                src="https://static.cloudflareinsights.com/beacon.min.js"
            ></script>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ToastContainer
                    draggable
                    draggablePercent={50}
                ></ToastContainer>
                <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white text-center">
                    <ClientWrappers>
                        <Suspense
                            fallback={<Loader className="animate-spin" />}
                        >
                            {children}
                        </Suspense>
                    </ClientWrappers>
                </main>
            </body>
        </html>
    );
}
