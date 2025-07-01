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
import DynamicBranding from "./DynamicLabelAndLogo";
import { createClient } from '@supabase/supabase-js';
import { appColors } from "@/lib/theme";
import CustomButton from "./CustomButton";

const NavigationMenu = () => {
    const [selectedItem, setSelectedItem] = useState();
    const [userRoles, setUserRoles] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [showCompanySelect, setShowCompanySelect] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isHoveringCompany, setIsHoveringCompany] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient(
        process.env.NEXT_PUBLIC_API_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const storedEmail = localStorage.getItem("email");
    const isExcludedPath =
        pathname.endsWith("/") ||
        pathname.endsWith("/login") ||
        pathname.endsWith("/forgot-password") ||
        pathname.endsWith("/reset-password") ||
        pathname.endsWith("/sign-up");

    const menuItems = [
        { name: "PrivateGPT", href: "/assistant", allowedRoles: ["end-user", "editor", "admin", "super-admin", "super-editor"] },
        { name: "VoC", href: "/voice-of-customer", allowedRoles: ["end-user", "admin", "editor", "super-admin", "super-editor"], hideForCompanyId: 6 },
        { name: "VoB", href: "/voice-of-business", allowedRoles: ["end-user", "admin", "editor", "super-admin", "super-editor"], hideForCompanyId: 6 },
        { name: "VoM", href: "/voice-of-market", allowedRoles: ["end-user", "admin", "editor", "super-admin", "super-editor"], hideForCompanyId: 6 },
        { name: "AI-Navigator Users", href: "/ai-navigator-users", allowedRoles: ["super-admin"] },
        { name: "User Management", href: "/user-management", allowedRoles: ["admin", "editor", "super-admin", "super-editor"] },

    ];

    const fetchCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('id, company_name')
                .order('company_name', { ascending: true });

            if (error) throw error;

            setCompanies(data || []);
        } catch (error) {
            console.log("Error fetching companies:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const storedRole = localStorage.getItem("system_roles");
            const storedCompanyId = localStorage.getItem("company_id");


            if (storedRole) {
                setUserRoles(storedRole.trim());

                // If user is super-admin or super-editor, fetch companies
                if (["super-admin", "super-editor"].includes(storedRole.trim())) {
                    await fetchCompanies();

                    // Only show select if no company is selected
                    if (!storedCompanyId) {
                        setShowCompanySelect(true);
                    }
                }
            }
        };

        // Reset all state when path changes to login (new session starting)
        if (pathname === '/login') {
            setSelectedItem(null);
            setUserRoles(null);
            setIsMobileMenuOpen(false);
            setIsOpen(false);
            setCompanies([]);
            setShowCompanySelect(false);
            setSelectedCompany(null);
        } else {
            fetchData();
        }
    }, [pathname]);

    // Add this useEffect to handle when companies are loaded
    useEffect(() => {
        if (companies.length > 0 && ["super-admin", "super-editor"].includes(userRoles)) {
            const storedCompanyId = localStorage.getItem("company_id");
            if (storedCompanyId) {
                setSelectedCompany(storedCompanyId);
            }
        }
    }, [companies, userRoles]);

    const handleCompanySelect = (companyId) => {
        localStorage.removeItem("company_id");
        localStorage.setItem("company_id", companyId);
        setSelectedCompany(companyId);
        setShowCompanySelect(false);
        window.location.reload();
    };

    const user = {
        role: userRoles,
    };

    const shouldShowDashboard = !isExcludedPath;

    useEffect(() => {
        if (!userRoles) return;

        if (!isExcludedPath) {
            const isRouteAccessible = accessibleRoutes[userRoles]?.includes(pathname);
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
                                router.push('/voice-of-customer');
                            },
                        },
                    ]
                );
            }
        }
    }, [userRoles, pathname]);

    useEffect(() => {
        const currentItem = menuItems.find(item => item.href === pathname)?.name;
        setSelectedItem(currentItem);
    }, [userRoles, pathname, menuItems]);

    const handleItemClick = (item) => {
        if (selectedItem !== item) {
            setSelectedItem(item);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setSelectedItem(null);
        setUserRoles(null);
        setIsMobileMenuOpen(false);
        setIsOpen(false);
        setCompanies([]);
        setShowCompanySelect(false);
        setSelectedCompany(null);

        router.push('/login');
        ShowCustomToast("Logout successfully", 'success', 2000);
    };

    const filteredMenuItems = menuItems.filter(item => {
        const companyId = localStorage.getItem("company_id");
        if (item.hideForCompanyId && companyId == item.hideForCompanyId) {
            return false;
        }
        return item?.allowedRoles?.includes(user?.role);
    });

    return (
        shouldShowDashboard && (
            <>
                {/* Company Selection Modal for Super Admin */}
                {showCompanySelect && (
                    <div className="fixed inset-0  bg-white/10 flex items-center justify-center z-50"
                        style={{ color: appColors.textHeadingColor, border: appColors.borderColor }}>
                        <div className="bg-white p-6 rounded-lg shadow-lg mt-20 ml-10 max-w-md w-full" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4 -mt-2 border-b pb-2">
                                <h2 className="text-xl font-bold" style={{ color: appColors.textColor }}>Select Company</h2>
                                <button
                                    onClick={() => {
                                        setShowCompanySelect(false);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="mb-4" style={{ color: appColors.textColor }}>You need to select a company to continue</p>

                            <select
                                className="w-full p-2 border border-gray-300 rounded mb-4"
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                value={selectedCompany || ""}
                                style={{ color: appColors.textColor, borderColor: appColors.borderColor, backgroundColor: appColors.primaryColor }}
                            >
                                <option value=" ">Select a company</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.company_name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end space-x-2">
                                <CustomButton
                                    onClick={() => {
                                        setShowCompanySelect(false);
                                    }}
                                    style={{ color: appColors.textColor, borderColor: appColors.borderColor }}
                                >
                                    Cancel
                                </CustomButton>
                                <CustomButton
                                    onClick={() => handleCompanySelect(selectedCompany)}
                                    disabled={!selectedCompany}
                                >
                                    Confirm
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                )}

                <header className="shadow-md py-2 border-b border-gray-400 relative">
                    <div className="container-fluid mx-auto flex justify-between items-center px-10">
                        {/* Left Section: Logo and Menu */}
                        <div className="flex items-center space-x-8">
                            {/* Logo */}
                            <div className="text-xl font-bold">
                                <DynamicBranding showLogo={true} showTitle={false} />
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
                                className="hidden md:flex space-x-4"
                            >
                                {filteredMenuItems.map((item) => (
                                    <ToggleGroupItem
                                        key={item.name}
                                        value={item.name}
                                        asChild
                                        className={clsx(
                                            "px-0 py-2 rounded-lg font-medium",
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

                        {/* User and Company Info */}
                        <div className="flex items-center space-x-4">
                            {/* User Icon */}
                            <div className="relative cursor-pointer">
                                <div
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="cursor-pointer flex px-3 items-center border rounded-full h-10 w-10 justify-center transition-colors duration-200 bg-white text-black bold shadow-md"
                                    aria-label="User Menu"
                                >
                                    {storedEmail ? storedEmail.charAt(0).toUpperCase() : '👤'}
                                </div>


                                {/* Dropdown Menu */}
                                {isOpen && (
                                    <div
                                        className="absolute right-0 mt-2 border border-gray-500 shadow-lg bg-[#2B2B4B] rounded-md z-50 min-w-[180px]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Selected Company Info */}
                                        {["super-admin", "super-editor"].includes(userRoles) && localStorage.getItem("company_id") && (
                                            <div className="px-4 py-2 border-b border-gray-700 whitespace-nowrap ">
                                                <p className="text-xs text-white">Selected Company:   {companies.find(c => c.id == localStorage.getItem("company_id"))?.company_name || "Loading..."}</p>

                                            </div>
                                        )}
                                        {["super-admin", "super-editor"].includes(userRoles) && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setShowCompanySelect(true);
                                                        setIsOpen(false);
                                                        fetchCompanies();
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-white whitespace-nowrap hover:bg-white/10"
                                                >
                                                    Change Company
                                                </button>
                                                <Link href="/category">
                                                    <span
                                                        onClick={() => setIsOpen(false)}
                                                        className="block w-full px-4 py-2 text-left text-white whitespace-nowrap hover:bg-white/10"
                                                    >
                                                        Category Management
                                                    </span>
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-white hover:bg-white/10"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
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
                                {filteredMenuItems.map((item) => (
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
                                {["super-admin", "super-editor"].includes(userRoles) && (
                                    <Link href="/category">
                                        <span
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="block cursor-pointer px-4 py-2 font-medium text-gray-500"
                                        >
                                            Category Management
                                        </span>
                                    </Link>
                                )}
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