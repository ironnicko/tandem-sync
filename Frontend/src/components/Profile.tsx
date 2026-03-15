"use client";

import { useAuth } from "@/stores/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProfileProps {
  className: string;
}

export const Profile = ({ className }: ProfileProps) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = () => setMenuOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  const contextMenu = () => {
    return (
      <div className="absolute top-14 bg-white shadow-lg rounded-lg border w-35 z-50">
        <ul className="flex flex-col">
          <li
            onClick={() => router.push("/myRides")}
            className="px-2 py-2 hover:bg-gray-100 cursor-pointer"
          >
            My Rides
          </li>

          <li
            onClick={() => {
              router.replace("/signin");
              logout();
            }}
            className="px-2 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
          >
            Logout
          </li>
        </ul>
      </div>
    );
  };

  return (
    <div className={className}>
      <motion.div
        className="relative w-12 h-12"
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1, 1.1, 1],
        }}
        transition={{
          duration: 2.6,
          times: [0, 0.75, 0.9, 1],
          ease: "easeOut",
        }}
      >
        {/* SVG progress ring */}
        <svg className="absolute inset-0 w-12 h-12 -rotate-90">
          {/* white base ring */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="white"
            strokeWidth="3"
            fill="transparent"
          />

          {/* animated fill */}
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            stroke="black"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
            }}
          />
        </svg>

        {/* Avatar */}
        <div className="absolute inset-[4px] rounded-full overflow-hidden bg-white cursor-pointer">
          <Image
            src={user?.image ? user.image : "/user.svg"}
            alt="Profile"
            width={48}
            height={48}
            unoptimized
            className="object-cover"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
          />
        </div>
      </motion.div>

      {menuOpen && contextMenu()}
    </div>
  );
};
