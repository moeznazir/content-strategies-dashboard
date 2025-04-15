"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaChevronLeft, FaChevronRight, FaUser, FaClock, FaLink, FaTimes, FaPlus } from "react-icons/fa";
import CustomCrudForm from "../customComponents/CustomCrud";
import Alert from "../customComponents/Alert";
import SearchByDateModal from "../customComponents/SearchByDateModal";
import CustomInput from "../customComponents/CustomInput";
import { debounce } from "@/lib/utils";
import MultiSelectDropdown from "../customComponents/CustomMultiSeect";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 100;
const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateSearchApplied, setDateSearchApplied] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showEditDashboardModal, setShowEditDashboardModal] = useState(false);
  const [currentEditingDashboard, setCurrentEditingDashboard] = useState(null);
  const [showCreateDashboardModal, setShowCreateDashboardModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const columns = [
    { label: "Avatar", id: "Avatar" },
    { label: "Name", id: "Guest" },
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
    { label: "Episode #", id: "Episode_Number" },
    { label: "Episode Title", id: "Episode Title" },
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
    { label: "Public vs. Private", id: "Public_vs_Private" },
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
  const dashboardCrudDetails = [
    { label: "Video ID", key: "Video ID", placeholder: "Enter Video ID" },
    { label: "Avatar", key: "Avatar", placeholder: "Upload Avatar", type: "image" },
    { label: "Video Title", key: "Video Title", placeholder: "Enter Video Title" },
    { label: "Text comments for the rating (OPTIONAL input from the user)", key: "Text comments for the rating (OPTIONAL input from the user)", placeholder: "Enter Comments", type: "textarea" },
    { label: "Video Description", key: "Video Description", placeholder: "Enter Video Description" },
    { label: "Transcript", key: "Transcript", placeholder: "Enter Transcript" },
    { label: "Quote", key: "Quote", placeholder: "Enter Quote" },
    { label: "Guest", key: "Guest", placeholder: "Enter Guest Name" },
    { label: "Guest Title", key: "Guest Title", placeholder: "Enter Guest Title" },
    { label: "Guest Company", key: "Guest Company", placeholder: "Enter Guest Company" },
    { label: "Guest Industry", key: "Guest Industry", placeholder: "Select Guest Industry", type: "multiselect" },
    { label: "Episode Title", key: "Episode Title", placeholder: "Enter Episode Title" },
    { label: "Episode #", key: "Episode_Number", placeholder: "Enter Episode Number", type: "number" },
    { label: "Video Type", key: "Video Type", placeholder: "Select Video Type", type: "multiselect" },
    { label: "Public vs. Private", key: "Public_vs_Private", placeholder: "Select Visibility", type: "select" },
    { label: "Video Length", key: "Video Length", placeholder: "Enter Video Length" },
    { label: "Themes/Triggers", key: "Themes/Triggers", placeholder: "Select Themes/Triggers", type: "multiselect" },
    { label: "Tags", key: "Tags", placeholder: "Select Tags", type: "multiselect" },
    { label: "Mentions", key: "Mentions", placeholder: "Select Mention", type: "select" },
    { label: "Client", key: "Client", placeholder: "Select Client", type: "select" },
    { label: "Employee", key: "Employee", placeholder: "Enter Employee" },
    { label: "Validations", key: "Validations", placeholder: "Select Validations", type: "multiselect" },
    { label: "Objections", key: "Objections", placeholder: "Select Objections", type: "multiselect" },
    { label: "YouTube Link", key: "YouTube Link", placeholder: "Enter YouTube Link", type: "url" },
    { label: "Podbook Link", key: "Podbook Link", placeholder: "Enter Podbook Link", type: "url" },
    { label: "Article - Extended Media", key: "Article - Extended Media", placeholder: "Enter Article Link", type: "url" },
    { label: "YouTube Short - Extended Media", key: "YouTube Short - Extended Media", placeholder: "Enter YouTube Short Link", type: "url" },
    { label: "LinkedIn Video - Extended Media", key: "LinkedIn Video - Extended Media", placeholder: "Enter LinkedIn Video Link", type: "url" },
    { label: "Quote Card - Extended Media", key: "Quote Card - Extended Media", placeholder: "Enter Quote Card Link", type: "url" },
    { label: "Private Link - Post-Podcast 1", key: "Private Link - Post-Podcast 1", placeholder: "Enter Private Link 1", type: "url" },
    { label: "Private Link - Post-Podcast 2", key: "Private Link - Post-Podcast 2", placeholder: "Enter Private Link 2", type: "url" },
    { label: "Date Recorded", key: "Date Recorded", placeholder: "Select Date", type: "date" },
    { label: "Blog Post 1,2 & 3", key: "Blog Post 1,2 & 3", placeholder: "Enter Blog Posts" },
  ];

  const [selectedFilters, setSelectedFilters] = useState({
    "Video Type": [],
    "Classifications": [],
    "Themes/Triggers": [],
    "Objections": [],
    "Validations": [],
    "Insights": []
  });
  const filteredOptions = {
    "Video Type": [
      { value: "Summary Video", label: "Summary Video", count: 0 },
      { value: "Full Episode", label: "Full Episode", count: 0 },
      { value: "Case Study", label: "Case Study", count: 0 },
      { value: "ICP Advice", label: "ICP Advice", count: 0 },
      { value: "Post-Podcast", label: "Post-Podcast", count: 0 },
      { value: "Guest Introduction", label: "Guest Introduction", count: 0 },
      { value: "Sales Insights", label: "Sales Insights", count: 0 },
      { value: "Challenge Questions", label: "Challenge Questions", count: 0 },
      { value: "My Liked", label: "My Liked", count: 0 },
      { value: "All Liked", label: "All Liked", count: 0 },
    ],
    "Classifications": [
      { value: "Mentioned", label: "Mentioned", count: 0 },
      { value: "Client", label: "Client", count: 0 },
      { value: "Employee", label: "Employee", count: 0 },
      { value: "Public", label: "Public", count: 0 },
      { value: "Private", label: "Private", count: 0 },
    ],
    "Themes/Triggers": [
      { "value": "Agent Trends & Impact", "label": "Agent Trends & Impact" },
      { "value": "BPO Services", "label": "BPO Services" },
      { "value": "Cost Center vs. Value Centers", "label": "Cost Center vs. Value Centers" },
      { "value": "Culture/Career Progression", "label": "Culture/Career Progression" },
      { "value": "Impact: Contact Center Insights", "label": "Impact: Contact Center Insights" },
      { "value": "Importance of the Agent", "label": "Importance of the Agent" },
      { "value": "Insights & Strategy Contributions", "label": "Insights & Strategy Contributions" },
      { "value": "KPI Trends", "label": "KPI Trends" },
      { "value": "Revenue & Growth", "label": "Revenue & Growth" },
      { "value": "The Role of AI", "label": "The Role of AI" },
      { "value": "Trigger: Expanding Markets", "label": "Trigger: Expanding Markets" },
      { "value": "The Role of Data", "label": "The Role of Data" },
      { "value": "CX as the New Competitive Advantage", "label": "CX as the New Competitive Advantage" },
      { "value": "Contact Center’s Role in Driving Revenue & Growth", "label": "Contact Center’s Role in Driving Revenue & Growth" },
      { "value": "Customer Experience (CX) as a Competitive Advantage", "label": "Customer Experience (CX) as a Competitive Advantage" },
      { "value": "Cost Center vs. Value Center Perceptions", "label": "Cost Center vs. Value Center Perceptions" }
    ],
    "Objections": [
      { "value": "Maintaining Quality", "label": "Maintaining Quality" },
      { "value": "BPO Value Perceptions", "label": "BPO Value Perceptions" },
      { "value": "Mitigating Risk", "label": "Mitigating Risk" }
    ],
    "Validations": [
      { value: "Cross-Department Integration", label: "Cross-Department Integration" },
      { value: "Impact on Revenue & Growth", label: "Impact on Revenue & Growth" },
      { value: "Insights influencing Company Growth", label: "Insights Influencing Company Growth" },
      { value: "Agent Turnover Impact", label: "Agent Turnover Impact" },
      { value: "BPO Success Strategies", label: "BPO Success Strategies" },
      { value: "Contact Centers as Growth Drivers", label: "Contact Centers as Growth Drivers" },
      { value: "Role as Consultant/Partner", label: "Role as Consultant/Partner" },
      { value: "Importance of the Agent", label: "Importance of the Agent" },
      { value: "The Importance of Culture", label: "The Importance of Culture" },
      { value: "Agent Quality Trends", label: "Agent Quality Trends" },
      { value: "Are Agents Here To Stay?", label: "Are Agents Here To Stay?" },

    ],
    "Insights": [
      { value: "Insight 1", label: "Insight 1" },
      { value: "Insight 2", label: "Insight 2" },
    ],
  };
  const [filteredOptionsWithCounts, setFilteredOptionsWithCounts] = useState(filteredOptions);

  const totalPages = useMemo(() => Math.ceil(totalRecords / ITEMS_PER_PAGE), [totalRecords]);
  const [filterCounts, setFilterCounts] = useState({
    "Video Type": {},
    "Classifications": {},
    "Themes/Triggers": {},
    "Objections": {},
    "Validations": {},
    "Insights": {}
  });


  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const fromDateISO = fromDate ? new Date(fromDate).toISOString() : null;
      const toDateISO = toDate ? new Date(toDate).toISOString() : null;

      const { data, error } = await supabase.rpc('combined_search', {
        search_term: searchText.trim() || null,
        video_types_json: selectedFilters["Video Type"]?.length ? selectedFilters["Video Type"] : null,
        themes_json: selectedFilters["Themes/Triggers"]?.length ? selectedFilters["Themes/Triggers"] : null,
        objections_json: selectedFilters["Objections"]?.length ? selectedFilters["Objections"] : null,
        validations_json: selectedFilters["Validations"]?.length ? selectedFilters["Validations"] : null,
        classifications_json: selectedFilters["Classifications"]?.length ? selectedFilters["Classifications"] : null,
        from_date: fromDateISO ? fromDateISO : null,
        to_date: toDateISO ? toDateISO : null,
        current_user_id: localStorage.getItem('current_user_id'),
        page_num: currentPage,
        page_size: ITEMS_PER_PAGE
      });

      if (error) throw error;

      // The RPC should return both data and total_count
      setUsers(data || []);
      setFilteredUsers(data || []);
      setTotalRecords(data[0]?.total_count || 0);

    } catch (err) {
      console.error("Fetch error:", {
        message: err.message,
        details: err.details,
      });
    } finally {
      setLoading(false);
      setIsSearchActive(false);
    }
  }, [currentPage, selectedFilters, isSearchActive, fromDate, toDate, searchText]);
  useEffect(() => {
    fetchUsers();
    // getAllUsers();
  }, [currentPage, totalPages, isSearchActive, selectedFilters]);


  const fetchAllFilterCounts = useCallback(async () => {
    try {

      const { data, error } = await supabase.rpc('get_filter_counts', {
        current_user_id: localStorage.getItem('current_user_id')
      });

      if (error) {
        console.error("Error fetching filter counts:", error);
        return;
      }
      const counts = {
        "Video Type": {},
        "Classifications": {},
        "Themes/Triggers": {},
        "Objections": {},
        "Validations": {}
      };

      // Assuming the RPC returns an array of {category, value, count}
      data.forEach(({ category, value, count }) => {
        if (counts[category]) {
          counts[category][value] = count;
        }
      });

      setFilterCounts(counts);
    } catch (err) {
      console.error("Error calculating filter counts:", err);
    }
  }, []);

  useEffect(() => {
    const updatedOptions = { ...filteredOptions };
    for (const filterType in filteredOptions) {
      updatedOptions[filterType] = filteredOptions[filterType].map(option => ({
        ...option,
        count: filterCounts[filterType]?.[option.value] || 0
      }));
    }
    setFilteredOptionsWithCounts(updatedOptions);
  }, [filterCounts]);

  useEffect(() => {
    fetchAllFilterCounts();
  }, [fetchAllFilterCounts, users]);
  const handleFilterSelect = (filterType, values) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
    setIsSearchActive(true);
    setCurrentPage(1); // Always reset to first page when filters change
  };

  const handleCreateDashboardSubmit = () => {
    setShowCreateDashboardModal(false);
  };

  const handleEditDashboardSubmit = () => {
    setShowEditDashboardModal(false);
  };
  const handleEditClick = (fund) => {
    setCurrentEditingDashboard(fund);
    setShowEditDashboardModal(true);
  };
  // Function to handle Delete Record
  const handleDeleteClick = async (Id) => {
    Alert.show('Delete Confirmation', 'Are you sure you want to delete this record?', [
      {
        text: 'Yes',
        primary: true,
        onPress: async () => {
          try {
            const response = await supabase
              .from("users_record")
              .delete()
              .eq("id", Id);

            if (response.error) {
              throw new Error(response.error.message);
            }
            const { count, error: countError } = await supabase
              .from("users_record")
              .select("*", { count: "exact", head: true });

            if (countError) throw countError;
            setTotalRecords(count || 0);

            if ((currentPage - 1) * ITEMS_PER_PAGE >= count) {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
            }

            const { data, error } = await supabase
              .from("users_record")
              .select("*")
              .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1)
              .order('id_order', { ascending: false });

            if (error) {
              throw error;
            }

            setUsers(data);

            Alert.show('Success', 'Record deleted successfully.', [
              {
                text: 'OK',
                primary: true,
                onPress: () => {
                  console.log('Record deleted and user clicked OK.');
                },
              },
            ]);
            fetchUsers();
          } catch (err) {
            Alert.show('Error', `Failed to delete the record: ${err.message}`);
          }
        },
      },
      {
        text: 'No',
        primary: false,
      },
    ]);
  };

  // Function to handle date filtering
  const handleDateSearch = async () => {
    setDateSearchApplied(true);
    setIsSearchActive(true);
    setCurrentPage(1);
    setShowDateModal(false)
    fetchUsers();
  };
  const debouncedSearch = useMemo(() =>
    debounce((searchValue) => {
      setSearchText(searchValue);
      setIsSearchActive(true);
      setCurrentPage(1);
    }, 500),
    []
  );


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearSearch = async () => {
    setSearchText("");
    setSelectedFilters({
      "Video Type": [],
      "Classifications": [],
      "Themes/Triggers": [],
      "Objections": [],
      "Validations": [],
      "Insights": []
    });
    setFromDate("");
    setToDate("");
    setDateSearchApplied(false);
    setCurrentPage(1);
    setOpenDropdown(false)
    fetchUsers();
  };


  return (
    <div className="overflow-x-hidden py-0 p-4 relative">
      {/* Search & divs Section */}
      <div className="py-3 px-6 mt-[-10px] flex justify-between items-center">
        {/* Search Bar */}
        <div className=" p-0 w-full">
          <div className="mx-auto -mt-2">
            <h1 className="text-2xl font-bold mt-6 mb-4">The Contact Center Perspectives Podcast</h1>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:cursor-pointer">
              <div className="relative flex-grow max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineSearch className="text-gray-400" />
                </div>
                <CustomInput
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  // onKeyPress={(e) => e.key === 'Enter' && handleGeneralSearch()}
                  className="block w-[70%] pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white/10  placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search episodes keywords..."
                />
              </div>
              <div className="flex gap-2 flex-wrap transform -translate-y-[1px] ">
                {["Search By Date", "Share Search Link", "Clear Search", "Add Record"].map((text, i) => {
                  const getIcon = (label) => {
                    switch (label) {
                      case "Search By Date":
                        return <FaClock className="w-4 h-4" />;
                      case "Share Search Link":
                        return <FaLink />;
                      case "Clear Search":
                        return <FaTimes />;
                      case "Add Record":
                        return <FaPlus />;
                      default:
                        return null;
                    }
                  };
                  const isAddRecord = text === "Add Record";
                  const isSearchByDate = text === "Search By Date";
                  return (
                    <div
                      key={i}
                      className={`px-4 py-2 text-sm ${isAddRecord ? "bg-[#3a86ff] hover:bg-[#2f6fcb]" :
                        isSearchByDate && dateSearchApplied ? "bg-white/20 hover:bg-white/20" : "bg-white/10 hover:bg-white/20"
                        } transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer `}
                      onClick={() => {
                        if (text === "Add Record") {
                          setShowCreateDashboardModal(true);
                        } else if (text === "Search By Date") {
                          setShowDateModal(true);
                        } else if (text === "Clear Search") {
                          clearSearch();
                        }
                      }}
                    >
                      {getIcon(text)}
                      {text}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>

      </div>
      <hr className="border-gray-500 mb-6 mt-[10px] -mx-12" />
      {/* Filter Section */}
      <div className="flex">
        <aside className=" flex  flex-col gap-2 w-full md:w-64 px-6">
          {Object.keys(filteredOptionsWithCounts).map((field) => (
            <MultiSelectDropdown
              key={field}
              label={`Search By ${field}`}
              options={filteredOptionsWithCounts[field]}
              selectedValues={selectedFilters[field] || []}
              onSelect={(values) => {
                handleFilterSelect(field, values);
              }}
              isOpen={openDropdown === field}
              onToggle={() =>
                setOpenDropdown(openDropdown === field ? null : field)
              }
            />
          ))}
        </aside>
        <div className="hidden md:block h-[585px] overflow-y-hidden w-px bg-gray-600 mx-4 ml-6 -mt-6"></div>
        {/* Table */}
        <main className="flex-1 px-6 overflow-x-auto">
          <div className="overflow-x-auto">
            <DraggableTable
              columns={columns}
              data={filteredUsers.length > 0 ? filteredUsers : users}
              arrayFields={arrayFields}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              showActions={true}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 px-4 py-2 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <span className="text-[#6c757d] text-sm font-sm flex items-center gap-1">
                Showing
                <span className="text-sm text-[#6c757d]">{currentPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE + 1}</span> -
                <span className="text-sm text-[#6c757d]">{Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)}</span>
                of
                <span className="text-sm text-[#6c757d]">{totalRecords}</span>
              </span>
              <div>
                <nav className="relative z-0 inline-flex gap-2 rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-white/10'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <FaChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <div
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-3 py-0 border rounded text-sm font-medium ${currentPage === page ? 'z-10 bg-[#3a86ff] border-gray-300 ' : 'bg-white/10  border-gray-300 text-gray-500 hover:bg-gray-200 cursor-pointer'}`}
                      >
                        {page}
                      </div>
                    );
                  })}

                  <div
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 bg-white/10 cursor-not-allowed' : 'text-gray-500 hover:bg-white/10 cursor-pointer'}`}
                  >
                    <span className="sr-only ">Next</span>
                    <FaChevronRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Dashboard Crud Modal */}
      {(showCreateDashboardModal || showEditDashboardModal) && (
        <CustomCrudForm
          isEditMode={showEditDashboardModal}
          entityData={showEditDashboardModal ? currentEditingDashboard : {}}
          onClose={() => {
            setShowCreateDashboardModal(false);
            setShowEditDashboardModal(false);
          }}
          onSubmit={showEditDashboardModal ? handleEditDashboardSubmit : handleCreateDashboardSubmit}
          displayFields={dashboardCrudDetails}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          setUsers={setUsers}
          setTotalRecords={setTotalRecords}
          setCurrentPage={setCurrentPage}
          fetchUsers={fetchUsers}
        />
      )}
      {/* Search By Date Modal */}
      {showDateModal && (
        <SearchByDateModal
          toDate={toDate}
          fromDate={fromDate}
          setToDate={setToDate}
          setFromDate={setFromDate}
          setShowDateModal={setShowDateModal}
          handleDateSearch={handleDateSearch}
        />
      )}

    </div>

  );
};

export default Dashboard;

