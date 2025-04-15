"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { HiMenu } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { EXCLUED_PATHS, accessibleRoutes } from "../constants/constant";
import Alert from "./Alert";
import { ShowCustomToast } from "./CustomToastify";
import { DivideIcon } from "lucide-react";

const NavigationMenu = () => {
    const [selectedItem, setSelectedItem] = useState();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const user = {
        role: "end-user",
    };
    const shouldShowDashboard = !EXCLUED_PATHS.includes(pathname);


    const menuItems = [
        { name: "Dashboard", href: "/dashboard", allowedRoles: ["user", "admin"] },
        { name: "User Management", href: "/user-management", allowedRoles: ["admin"] }
    ];

    useEffect(() => {
        if (!user || !user.role) return;
        if (EXCLUED_PATHS.includes(pathname)) return;

        const isRouteAccessible = accessibleRoutes[user.role]?.includes(pathname);

        if (!isRouteAccessible) {
            setAlertVisible(true);
            Alert.show(
                "Access Denied",
                "You are not authorized to access this page.",
                [
                    {
                        text: "OK",
                        primary: true,
                        onPress: () => {
                            if (user?.role === 'admin' || user?.role === 'user') {
                                router.push('/dashboard');
                            }
                        },
                    },
                ]
            );
        }
    }, [user?.role, router]);

    useEffect(() => {
        const currentItem = menuItems.find(item => item.href === pathname)?.name;
        setSelectedItem(currentItem);
    }, [pathname, menuItems]);


    const handleItemClick = (item) => {
        if (selectedItem !== item) {
            setSelectedItem(item);
        }
    };

    const handleLogout = () => {
        setTimeout(() => {
            localStorage.clear();
            router.push('/');
            ShowCustomToast("Logout successfully", 'success', 2000);
        }, 2000);
    };

    return (
        shouldShowDashboard && (
            <>
                <header className=" shadow-md py-2  relative">

                    <div className="container-fluid mx-auto flex justify-between items-center px-10">
                        {/* Left Section: Logo and Menu */}
                        <div className="flex items-center space-x-10">
                            {/* Logo */}
                            <div className="text-xl font-bold">
                                <Link href="/" >
                                    <Image
                                        width={150}
                                        height={150}
                                        src="/logo_content_stratigies.png"
                                        alt="Logo"
                                        className="h-12 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Navigation Menu */}
                            <ToggleGroup
                                type="single"
                                value={selectedItem}
                                onValueChange={(value) => {
                                    if (value) {
                                        handleItemClick(value);
                                    }
                                }}
                                className="hidden md:flex space-x-2"
                            >
                                {menuItems
                                    .filter((el) => el?.allowedRoles?.includes(user?.role))
                                    .map((item) => (
                                        <ToggleGroupItem
                                            key={item.name}
                                            value={item.name}
                                            asChild
                                            className={clsx(
                                                "px-4 py-2 rounded-lg font-medium",
                                                selectedItem === item.name
                                                    ? " font-bold underline underline-offset-4 decoration-[#3a86ff] decoration-2"
                                                    : "text-gray-400 hover:text-gray-200",
                                            )}
                                            style={{
                                                fontSize: "0.875rem",
                                            }}
                                        >
                                            <Link href={item.href}>{item.name}</Link>
                                        </ToggleGroupItem>
                                    ))}
                            </ToggleGroup>
                        </div>

                        {/* Logout Icon */}
                        {/* User Icon (Clickable) */}
                        <div className="relative cursor-pointer">
                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className="cursor-pointer flex px-3 items-center border rounded-full h-10 w-10 justify-center transition-colors duration-200 bg-white shadow-md"
                                aria-label="User Menu"
                            >
                                👤
                            </div>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div
                                    className="absolute w-[70px] right-0 mt-2 w-24 bg-white border border-gray-300 shadow-lg rounded-md z-50"
                                    onClick={(e) => e.stopPropagation()} 
                                >
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false); 
                                        }}
                                        className="w-full px-2 py-1 text-gray-700 hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>




                        {/* Hamburger Menu for Mobile */}
                        <div className="md:hidden">
                            <div
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="focus:outline-none"
                                aria-label="Toggle Menu"
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="mobile-menu"
                            >
                                <HiMenu size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div id="mobile-menu" className="md:hidden bg-white shadow-lg py-4">
                            <nav className="space-y-2 px-4">
                                {menuItems.filter((el) => el?.allowedRoles?.includes(user?.role)).map((item) => (
                                    <Link href={item.href} key={item.name}>
                                        <span
                                            onClick={() => {
                                                handleItemClick(item.name);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={clsx(
                                                'block cursor-pointer px-4 py-2 font-medium',
                                                selectedItem === item.name
                                                    ? 'bg-[#c7b740-100 text-black'
                                                    : 'text-gray-500'
                                            )}
                                        >
                                            {item.name}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}
                </header>
                <hr className="border-gray-500" />
            </>
        )
    );
};

export default NavigationMenu;

