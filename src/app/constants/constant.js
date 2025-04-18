export const EXCLUED_PATHS = ['/', '/login', '/forgot-password', '/sign-up', '/reset-password'];

export const accessibleRoutes = {
    "end-user": ["/dashboard"],
    "admin": ["/dashboard", "/user-management"],
    "editor": ["/dashboard"]
};

export const getRandomColor = () => {
    const colors = [
        "bg-red-100 text-red-700",
        "bg-green-100 text-green-700",
        "bg-blue-100 text-blue-700",
        "bg-yellow-100 text-yellow-700",
        "bg-purple-100 text-purple-700",
        "bg-pink-100 text-pink-700",
        "bg-indigo-100 text-indigo-700",
        "bg-gray-100 text-gray-700"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

