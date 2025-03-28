"use client";

import React, { useEffect, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaChevronLeft, FaChevronRight, FaUser } from "react-icons/fa";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 6;
const Dashboard = () => {
  const [loginUserEmail, setLoginUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    videoType: "",
    classifications: "",
    themes: "",
    objections: "",
    validations: "",
    insights: "",
  });

  const columns = [
    { label: "Avatar", id: "Avatar" },
    { label: "Video Title", id: "Video Title" },
    { label: "Likes", id: "Likes" },
    { label: "Comments", id: "Comments" },
    { label: "Main Comment", id: "Text comments for the rating (OPTIONAL input from the user)" },
    { label: "Video Description", id: "Video Description" },
    { label: "Transcript", id: "Transcript" },
    { label: "Article - Extended Media", id: "Article - Extended Media" },
    { label: "Blog Post 1,2 & 3", id: "Blog Post 1,2 & 3" },
    { label: "Client", id: "Client" },
    { label: "Date Recorded", id: "Date Recorded" },
    { label: "Employee", id: "Employee" },
    { label: "Episode #", id: "Episode #" },
    { label: "Episode Title", id: "Episode Title" },
    { label: "Guest", id: "Guest" },
    { label: "Guest Company", id: "Guest Company" },
    { label: "Guest Industry", id: "Guest Industry" },
    { label: "Tags", id: "Tags" },
    { label: "Themes/Triggers", id: "Themes/Triggers" },
    { label: "Video Type", id: "Video Type" },
    { label: "Validations", id: "Validations" },
    { label: "Objections", id: "Objections" },
    { label: "Guest Title", id: "Guest Title" },
    { label: "LinkedIn Video - Extended Media", id: "LinkedIn Video - Extended Media" },
    { label: "Mentions", id: "Mentions" },
    { label: "Podbook Link", id: "Podbook Link" },
    { label: "Private Link - Post-Podcast 1", id: "Private Link - Post-Podcast 1" },
    { label: "Private Link - Post-Podcast 2", id: "Private Link - Post-Podcast 2" },
    { label: "Public vs. Private", id: "Public vs. Private" },
    { label: "Quote", id: "Quote" },
    { label: "Quote Card - Extended Media", id: "Quote Card - Extended Media" },
    { label: "Actions", id: "action" },
  ];
  const arrayFields = [
    "Guest Industry",
    "Objections",
    "Tags",
    "Themes/Triggers",
    "Validations",
    "Video Type"
  ];

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch total count of records
        const { count, error: countError } = await supabase
          .from("users_record")
          .select("*", { count: "exact", head: true });

        if (countError) throw countError;
        setTotalRecords(count || 0);

        // Calculate pagination
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        // Fetch paginated data
        const { data, error } = await supabase
          .from("users_record")
          .select("*")
          .range(start, end);

        if (error) throw error;

        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);
  console.log("dataaa",users);
  const guestNames = users.map(user => user.Guest);

console.log(guestNames);
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email") || "";
      setLoginUserEmail(email);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#ffffff] py-0 relative">
      <div className="bg-[#32503e] text-white py-3 px-6  flex justify-between items-center">
        <div className="flex items-center space-x-2 pb-2">
          <h1 className="text-[2rem] font-bold">The Contact Center Perspectives Podcast</h1>
        </div>
        <div className="flex justify-end space-x-2">
          <button className="bg-[#c7b740] text-black px-6 py-2 rounded hover:bg-[#b3a233] flex items-center space-x-2">
            <FaUser className="text-[#32503e]" />
            <span>{loginUserEmail ? loginUserEmail : "Loading..."}</span>
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

      {/* Table */}
      <div className="overflow-x-auto p-4 py-2 px-6">
        <div className="overflow-x-auto shadow-md rounded-lg">
          <DraggableTable
            columns={columns}
            data={users}
            arrayFields={arrayFields}
            loading={loading}
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center bg-white p-3 rounded-b-lg border border-gray-300 gap-4">
          {/* Previous Icon */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`text-gray-700 ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "hover:text-blue-600"}`}
          >
            <FaChevronLeft size={18} />
          </button>

          {/* Page Indicator */}
          <span className="text-black font-semibold flex items-center gap-1">
            Showing
            <span className="text-[#c7b740] font-bold">{currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE + 1}</span> -
            <span className="text-[#c7b740] font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)}</span>
            of
            <span className="text-[#c7b740] font-bold">{totalRecords}</span>
          </span>

          {/* Next Icon */}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`text-gray-700 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : "hover:text-blue-600"}`}
          >
            <FaChevronRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
