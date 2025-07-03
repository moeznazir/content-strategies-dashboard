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
    const [showAccountSettings, setShowAccountSettings] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);

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
            const email = localStorage.getItem("email");

            if (storedRole) {
                setUserRoles(storedRole.trim());
                setCurrentEmail(email || '');

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

    useEffect(() => {
        if (companies.length > 0 && ["super-admin", "super-editor"].includes(userRoles)) {
            const storedCompanyId = localStorage.getItem("company_id");
            if (storedCompanyId) {
                setSelectedCompany(storedCompanyId);
            }
        }
        setAvatarUrl(localStorage.getItem("avatar_url"))
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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateUserEmail = async () => {
        if (!newEmail) return;

        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;

            // localStorage.setItem("email", newEmail);
            setShowEmailChangeModal(true);
            // setCurrentEmail(newEmail);

        } catch (error) {
            ShowCustomToast(error.message, 'error', 3000);
        }
    };

    const updateUserPassword = async () => {

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            ShowCustomToast("Password updated successfully", 'success', 2000);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            ShowCustomToast(error.message, 'error', 3000);
        }
    };

    const uploadAvatar = async () => {
        if (!avatarFile) return;

        try {
            setIsUpdating(true);
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload the avatar
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }

            });
            localStorage.setItem("avatar_url", publicUrl);
            setAvatarUrl(publicUrl)
            if (updateError) throw updateError;

            ShowCustomToast("Avatar updated successfully", 'success', 2500);
            setAvatarPreview(publicUrl);
        } catch (error) {
            ShowCustomToast(error.message, 'error', 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAccountSettingsSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsUpdating(true);
            let shouldLogoutLater = false;
            let passwordUpdated = false;

            if (newPassword !== confirmPassword) {
                ShowCustomToast("New passwords don't match", 'error', 2000);
                return;
            }
            if (currentPassword == null || currentPassword == '' || !currentPassword) {
                ShowCustomToast("Please enter current password", 'info', 2000);
                return;
            }

            // Update email if changed
            if (newEmail && newEmail !== currentEmail) {
                await updateUserEmail();
            }

            // Update password if provided
            if (newPassword && currentPassword) {
                // Validate password length first
                if (newPassword.length < 6) {
                    throw new Error("Password must be at least 6 characters");
                }

                await updateUserPassword();
                passwordUpdated = true;
                shouldLogoutLater = true;
            }

            // Update avatar if selected
            if (avatarFile) {
                await uploadAvatar();
            }


            // Only schedule logout if password was successfully updated
            if (passwordUpdated && shouldLogoutLater) {
                setTimeout(() => {
                    ShowCustomToast("Session expired. Please login again.", 'info', 3000);
                    handleLogout();
                }, 5000); // 5 seconds
            }

        } catch (error) {
            // Clear any pending logout if error occurs
            // clearTimeout(logoutTimer);
            ShowCustomToast(error.message, 'error', 3000);
        } finally {
            setIsUpdating(false);
        }
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
                    <div className="fixed inset-0 bg-white/10 flex items-center justify-center z-50"
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

                {/* Account Settings Modal */}
                {showAccountSettings && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-xl font-bold" style={{ color: appColors.textColor }}>Account Settings</h2>
                                <div
                                    onClick={() => {
                                        setShowAccountSettings(false);
                                        setAvatarFile(null);
                                        setAvatarPreview('');
                                        setNewEmail('');
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="text-gray-500 cursor-pointer hover:text-gray-700"
                                >
                                    ✕
                                </div>
                            </div>

                            <form onSubmit={handleAccountSettingsSubmit}>
                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium" style={{ color: appColors.textColor }}>
                                        Profile Picture
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                                                {avatarUrl ? (
                                                    <img src={avatarPreview ? avatarPreview : localStorage.getItem('avatar_url')} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        {storedEmail ? storedEmail.charAt(0).toUpperCase() : '👤'}
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                id="avatar"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="avatar"
                                                className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1 cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </label>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Click to upload a new profile picture</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium" style={{ color: appColors.textColor }}>
                                        Current Email
                                    </label>
                                    <input
                                        type="email"
                                        value={currentEmail}
                                        disabled
                                        className="w-full p-2 border rounded"
                                        style={{ color: appColors.textColor, borderColor: appColors.borderColor, backgroundColor: appColors.primaryColor }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium" style={{ color: appColors.textColor }}>
                                        New Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        style={{ color: appColors.textColor, borderColor: appColors.borderColor, backgroundColor: appColors.primaryColor }}
                                        placeholder="Enter new email"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium" style={{ color: appColors.textColor }}>
                                        Current Password (required for password change)
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        style={{ color: appColors.textColor, borderColor: appColors.borderColor, backgroundColor: appColors.primaryColor }}
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium" style={{ color: appColors.textColor }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        style={{ color: appColors.textColor, borderColor: appColors.borderColor, backgroundColor: appColors.primaryColor }}
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block mb-2 text-sm font-medium" style={{ color: appColors.textColor }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        style={{ color: appColors.textColor, borderColor: appColors.borderColor, backgroundColor: appColors.primaryColor }}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <CustomButton
                                        type="button"
                                        onClick={() => {
                                            setShowAccountSettings(false);
                                            setAvatarFile(null);
                                            setAvatarPreview('');
                                            setNewEmail('');
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                        style={{ color: appColors.textColor, borderColor: appColors.borderColor }}
                                    >
                                        Cancel
                                    </CustomButton>
                                    <CustomButton
                                        type="submit"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Updating...' : 'Save Changes'}
                                    </CustomButton>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showEmailChangeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" >
                        <div className="rounded-lg shadow-xl max-w-md w-full p-6" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4 border-b ">
                                <h3 className="text-lg font-semibold">Email Change Requested</h3>
                                <div
                                    onClick={() => setShowEmailChangeModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p>You'll need to confirm this change from BOTH emails:</p>
                                <ol className="list-decimal pl-5 space-y-2">
                                    <li>Check your <span className="font-semibold">{currentEmail}</span> inbox first</li>
                                    <li>Then check <span className="font-semibold">{newEmail}</span></li>
                                </ol>
                                <p className="text-blue-600 text-sm">
                                    Both confirmations are required within 24 hours.
                                </p>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <CustomButton
                                    onClick={() => setShowEmailChangeModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    I Understand
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
                                    className="cursor-pointer flex items-center justify-center h-10 w-10 rounded-full bg-white text-black shadow-md overflow-hidden border border-gray-300"
                                    aria-label="User Menu"
                                >
                                    {avatarUrl ? (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={avatarUrl}
                                                alt="User Avatar"
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={() => setAvatarUrl(null)}
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-bold">
                                            {storedEmail ? storedEmail.charAt(0).toUpperCase() : '👤'}
                                        </span>
                                    )}
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
                                                <div
                                                    onClick={() => {
                                                        setShowCompanySelect(true);
                                                        setIsOpen(false);
                                                        fetchCompanies();
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-white whitespace-nowrap hover:bg-white/10"
                                                >
                                                    Change Company
                                                </div>
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
                                        <div
                                            onClick={() => {
                                                setShowAccountSettings(true);
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-white whitespace-nowrap hover:bg-white/10"
                                        >
                                            Account Settings
                                        </div>
                                        <div
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-white hover:bg-white/10"
                                        >
                                            Logout
                                        </div>
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
                                <span
                                    onClick={() => {
                                        setShowAccountSettings(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="block cursor-pointer px-4 py-2 font-medium text-gray-500"
                                >
                                    Account Settings
                                </span>
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