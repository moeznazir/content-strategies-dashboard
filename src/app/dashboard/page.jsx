"use client";

import React, { useEffect, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import Image from "next/image";
import DraggableTable from "../customComponents/DraaggableTable";

const Dashboard = () => {
  const [loginUserEmail, setLoginUserEmail] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    videoType: "",
    classifications: "",
    themes: "",
    objections: "",
    validations: "",
    insights: "",
  });

  const columns = [
    { label: "Avatar", id: "avatar" },
    { label: "Video Title", id: "title" },
    { label: "Likes", id: "likes" },
    { label: "Comments", id: "comments" },
    { label: "Main Comment", id: "mainComment" },
    { label: "Video Description", id: "description" },
    { label: "Transcript", id: "transcript" },
    { label: "Actions", id: "action" },
  ];

  const videoData = [
    {
      avatar: "/avatar1.png",
      title: "Customer Self-Actualization: Key to",
      likes: 2,
      comments: 3,
      mainComment: "In this video, Sri discusses three takeaways",
      description: "Sri discusses emotional marketing through stories",
      transcript: "[00:00:00] Step 1...",
    },
    {
      avatar: "/avatar2.png",
      title: "Leveraging BPO Partnerships for...",
      likes: 1,
      comments: 2,
      mainComment: "Karla discusses the strategic advantages...",
      description: "Karla explores benefits of BPO partners...",
      transcript: "[00:00:00] Step 2...",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email") || "";
      setLoginUserEmail(email);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#ffffff] py-0 relative">
      {/* Header */}
      <div className="bg-[#32503e] text-white py-3 px-6  flex justify-between items-center">

        <div className="flex items-center space-x-2 pb-2">
          {/* <Image src="/logo.png" alt="Logo" width={40} height={40} /> */}
          <h1 className="text-[2rem] font-bold">The Contact Center Perspectives Podcast</h1>
        </div>
        <div className="flex justify-end space-x-2">
          <button className="bg-[#c7b740] text-black px-6 py-2 rounded hover:bg-[#b3a233]">
          {loginUserEmail ? loginUserEmail : "Loading..."}

          </button>
        </div>
      </div>

      {/* Search & Buttons Section */}
      <div className="bg-[#32503e] text-white py-3 px-6 mt-[-10px]  flex justify-between items-center">
        {/* Search Bar */}
        <div className="w-full md:w-1/3 space-x-2 pb-2">
          <div className="flex items-center bg-white text-black rounded px-3 py-2 w-full">
            <HiOutlineSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Enter search text here..."
              className="bg-transparent outline-none ml-2 flex-1"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 pb-2">
          {["Search By Time", "Share Search Link", "Clear Search", "Add Record"].map((text, i) => (
            <button
              key={i}
              className="bg-[#c7b740] text-black px-3 py-2 rounded hover:bg-[#b3a233]"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Section */}
      <div className="w-full py-4 px-6 mt-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {["Video Type", "Classifications", "Themes/Triggers", "Objections", "Validations", "Insights"].map((filter, index) => (
            <select
              key={index}
              className="bg-[#32503e] text-white px-4 py-2 rounded w-full"
              onChange={(e) => setSelectedFilters({ ...selectedFilters, [filter]: e.target.value })}
            >
              <option>{filter}</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
          ))}
        </div>
      </div>

      {/* Video Table */}
      <div className="overflow-x-auto p-4 py-2 px-6">
        <div className="min-h-screen bg-white border border-[#C0C0C0] shadow-lg">
          <DraggableTable columns={columns} data={videoData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
