export const EXCLUED_PATHS = ['/', '/login', '/forgot-password', '/sign-up', '/reset-password'];

export const accessibleRoutes = {
    "end-user": ["/dashboard"],
    "admin": ["/dashboard", "/user-management","/assistant","/file-management"],
    "editor": ["/dashboard"],
    "super-admin":["/dashboard", "/user-management","/assistant","/file-management"],
    "super-editor":["/dashboard", "/user-management","/assistant"],
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

export const COMPANY_CONFIG = [
    {
      id: "1",
      podcastTitle: "The Contact Center Perspectives Podcast",
      logo: "/logo_content_stratigies.png"
    },
    {
      id: "2", 
      podcastTitle: "Testing Titles",
      logo: "/nextjs-icon-svgrepo-com.svg"
    },
    {
      id: "3",
      podcastTitle: "Testing Title",
      logo: "/nextjs-icon-svgrepo-com (1).svg"
    },
    {
      id: "4",
      podcastTitle: "Go Beyond the Connection Podcast",
      logo: "/nextjs-icon-svgrepo-com (1).svg"
    },
    {
      id: "5",
      podcastTitle: "Go Beyond the Connection Podcast",
      logo: "/nextjs-icon-svgrepo-com (1).svg"
    }
  ];
  
  export const getCompanyConfig = (companyId) => {
    return COMPANY_CONFIG.find(c => c.id === companyId) || COMPANY_CONFIG[0];
  };

