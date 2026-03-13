import { useAuth } from "@/stores/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

    const contextMenu = () => {
        return (
            <div className="absolute top-14 bg-white shadow-lg rounded-lg border w-35 z-50">
                <ul className="flex flex-col">
                    <li
                        onClick={() => {
                            router.push("/myRides");
                        }}
                        className="px-2 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                        My Rides
                    </li>
                    {/* <li
                onClick={() => {
                    router.push("/dashboard/settings");
                    setMenuOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                Settings
                </li> */}
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
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer">
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

            {/* Dropdown Menu anchored under profile */}
            {menuOpen && contextMenu()}
        </div>
    );
};
