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
import MultiSelectDropdown from "../customComponents/FiltersMultiSelect";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const ITEMS_PER_PAGE = 20;
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [themesRank, setThemesRank] = useState([]);


  const columns = [
    { label: "Avatar", id: "Avatar" },
    { label: "Name", id: "Guest" },
    { label: "Video Title", id: "Video Title" },
    // { label: "Ranking", id: "ranking" },
    // { label: "Ranking Justification", id: "Ranking Justification" },
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
    { label: "Themes", id: "Themes" },
    { label: "Validations", id: "Validations" },
    { label: "Objections", id: "Objections" },
    { label: "Challenges", id: "Challenges" },
    { label: "Video Type", id: "Video Type" },
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
    "Themes",
    "Validations",
    "Challenges",
    "Video Type"
  ];

  const dashboardCrudDetails = [
    { label: "Video ID", key: "Video_ID", placeholder: "Enter Video ID" },
    { label: "Avatar", key: "Avatar", placeholder: "Upload Avatar", type: "image" },
    { label: "Video Title", key: "Video Title", placeholder: "Enter Video Title" },
    { label: "Themes", key: "Themes", placeholder: "Select Themes", type: "multiselect" },
    { label: "Validations", key: "Validations", placeholder: "Select Validations", type: "multiselect" },
    { label: "Objections", key: "Objections", placeholder: "Select Objections", type: "multiselect" },
    { label: "Challenges", key: "Challenges", placeholder: "Select Challenges", type: "multiselect" },
    // { label: "Ranking", key: "ranking", placeholder: "Enter Ranking (1-10)", type: "ranking" },
    // { label: "Ranking justification", key: "Ranking Justification", placeholder: "Enter Ranking Justification" },
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
    { label: "Tags", key: "Tags", placeholder: "Select Tags", type: "multiselect" },
    { label: "Mentions", key: "Mentions", placeholder: "Select Mention", type: "select" },
    { label: "Client", key: "Client", placeholder: "Select Client", type: "select" },
    { label: "Employee", key: "Employee", placeholder: "Enter Employee" },
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
    "Themes": [],
    "Objections": [],
    "Validations": [],
    "Challenges": [],
    "Insights": []
  });

  const filterOptions = {
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
    "Themes": [
      { value: "Agent Trends & Impact", label: "Agent Trends & Impact" },
      { value: "BPO Services", label: "BPO Services" },
      { value: "Cost Center vs. Value Centers", label: "Cost Center vs. Value Centers" },
      { value: "Culture/Career Progression", label: "Culture/Career Progression" },
      { value: "Impact: Contact Center Insights", label: "Impact: Contact Center Insights" },
      { value: "Importance of the Agent", label: "Importance of the Agent" },
      { value: "Insights & Strategy Contributions", label: "Insights & Strategy Contributions" },
      { value: "KPI Trends", label: "KPI Trends" },
      { value: "Revenue & Growth", label: "Revenue & Growth" },
      { value: "The Role of AI", label: "The Role of AI" },
      { value: "Trigger: Expanding Markets", label: "Trigger: Expanding Markets" },
      { value: "The Role of Data", label: "The Role of Data" },
      { value: "CX as the New Competitive Advantage", label: "CX as the New Competitive Advantage" },
      { value: "Contact Center's Role in Driving Revenue & Growth", label: "Contact Center's Role in Driving Revenue & Growth" },
      { value: "Customer Experience (CX) as a Competitive Advantage", label: "Customer Experience (CX) as a Competitive Advantage" },
      { value: "Cost Center vs. Value Center Perceptions", label: "Cost Center vs. Value Center Perceptions" }
    ],
    "Objections": [
      { value: "Maintaining Quality", label: "Maintaining Quality" },
      { value: "BPO Value Perceptions", label: "BPO Value Perceptions" },
      { value: "Mitigating Risk", label: "Mitigating Risk" }
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
    "Challenges": [
      { value: "Misalignment Between Short-Term Targets and Long-Term Value", label: "Misalignment Between Short-Term Targets and Long-Term Value" },
      { value: "Underutilization of Voice-of-Customer Data", label: "Underutilization of Voice-of-Customer Data" },
      { value: "Lack of Empowerment and Budget Control for CX and Support Leaders", label: "Lack of Empowerment and Budget Control for CX and Support Leaders" },
      { value: "Inability to Deeply Understand and Adapt to the ICP", label: "Inability to Deeply Understand and Adapt to the ICP" },
      { value: "Cultural Bias Toward Viewing Support as a Cost Center", label: "Cultural Bias Toward Viewing Support as a Cost Center" },
      { value: "Conflicting Executive Priorities", label: "Conflicting Executive Priorities" },
      { value: "Tagging, Taxonomy, and Feedback Classification Challenges", label: "Tagging, Taxonomy, and Feedback Classification Challenges" },
      { value: "Generational Workforce Gaps", label: "Generational Workforce Gaps" },
      { value: "Tool Overload and AI Misalignment", label: "Tool Overload and AI Misalignment" },
      { value: "Organizational Dysfunction and Scaling Expertise", label: "Organizational Dysfunction and Scaling Expertise" },
    ],
    "Insights": [
      { value: "Insight 1", label: "Insight 1" },
      { value: "Insight 2", label: "Insight 2" },
    ],
  };

  const [filterOptionsWithCounts, setFilterOptionsWithCounts] = useState(filterOptions);
  const [filterCounts, setFilterCounts] = useState({});

  const totalPages = useMemo(() => Math.ceil(totalRecords / ITEMS_PER_PAGE), [totalRecords]);

  const fetchUsers = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const fromDateISO = fromDate ? new Date(fromDate).toISOString() : null;
      const toDateISO = toDate ? new Date(toDate).toISOString() : null;

      const { data, error } = await supabase.rpc('combined_search', {
        search_term: searchText.trim() || null,
        video_types_json: selectedFilters["Video Type"]?.length ? selectedFilters["Video Type"] : null,
        themes_json: selectedFilters["Themes"]?.length ? selectedFilters["Themes"] : null,
        objections_json: selectedFilters["Objections"]?.length ? selectedFilters["Objections"] : null,
        validations_json: selectedFilters["Validations"]?.length ? selectedFilters["Validations"] : null,
        classifications_json: selectedFilters["Classifications"]?.length ? selectedFilters["Classifications"] : null,
        challenges_json: selectedFilters["Challenges"]?.length ? selectedFilters["Challenges"] : null,
        from_date: fromDateISO ? fromDateISO : null,
        to_date: toDateISO ? toDateISO : null,
        current_user_id: localStorage.getItem('current_user_id'),
        current_company_id: localStorage.getItem('company_id'),
        page_num: page,
        page_size: ITEMS_PER_PAGE
      });

      if (error) throw error;

      // Ensure data is properly formatted before setting state
      const formattedData = data.map(item => {
        // Convert any object fields to strings if needed
        const formattedItem = { ...item };
        // Helper function to format array data consistently
        const formatArrayField = (fieldValue) => {
          if (!fieldValue) return '';

          try {
            // Parse if it's JSON string
            const items = typeof fieldValue === 'string'
              ? JSON.parse(fieldValue)
              : fieldValue;

            // Convert to display format
            if (Array.isArray(items)) {
              return items.map(item => {
                // If it's an object, extract just the name property
                if (item && typeof item === 'object') {
                  return item.challenge || item.challenges || item.Challenges || item.validation || item.objection || item.theme || '';
                }
                // Otherwise use as-is (string)
                return item;
              }).filter(Boolean).join(', ');
            }
            return '';
          } catch (e) {
            console.log('Error formatting field:', e);
            return ''; // Fallback
          }
        };

        // Apply formatting to all three fields
        if (formattedItem.Themes) {
          formattedItem.Themes = formatArrayField(formattedItem.Themes);
        }

        if (formattedItem.Validations) {
          formattedItem.Validations = formatArrayField(formattedItem.Validations);
        }

        if (formattedItem.Objections) {
          formattedItem.Objections = formatArrayField(formattedItem.Objections);
        }
        if (formattedItem.Challenges) {
          formattedItem.Challenges = formatArrayField(formattedItem.Challenges);
        }
        // Handle other array fields
        arrayFields.forEach(field => {
          if (field !== 'Themes' && field !== 'Objections' && field !== 'Validations' && field !== 'Challenges'  && formattedItem[field]) {
            if (typeof formattedItem[field] === 'string') {
              formattedItem[field] = formattedItem[field]
                .split(',')
                .map(v => v.trim())
                .filter(v => v && v.toLowerCase() !== 'nan' && v !== '[]');
            }
          }
        });


        return formattedItem;
      });

      console.log("formattedData", formattedData);
      console.log("datattat", data);
      setThemesRank(data);
      if (isLoadMore) {
        setUsers(prev => [...prev, ...formattedData]);
        setFilteredUsers(prev => [...prev, ...formattedData]);
      } else {
        setUsers(formattedData || []);
        setFilteredUsers(formattedData || []);
      }

      setTotalRecords(data[0]?.total_count || 0);

    } catch (err) {
      console.log("Fetch error:", {
        message: err.message,
        details: err.details,
      });
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
        setIsSearchActive(false);
      }
    }
  }, [selectedFilters, isSearchActive, fromDate, toDate, searchText]);

  useEffect(() => {
    // Reset to first page when search/filter changes
    setCurrentPage(1);
    fetchUsers(1, false);
  }, [selectedFilters, searchText, fromDate, toDate]);

  const loadMoreData = async () => {
    if (!loadingMore && users.length < totalRecords) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchUsers(nextPage, true);
    }
  };

  const fetchAllFilterCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_filter_counts', {
        current_user_id: localStorage.getItem('current_user_id')
      });

      if (error) {
        console.log("Error fetching filter counts:", error);
        return;
      }

      // Initialize counts object
      const counts = {
        "Video Type": {},
        "Classifications": {},
        "Themes": {},
        "Objections": {},
        "Validations": {},
        "Challenges": {},
        "Insights": {}
      };

      // Process the counts data
      data.forEach(({ category, value, count, avg_ranking }) => {
        if (counts[category]) {
          counts[category][value] = {
            count,
            avg_ranking: ['Themes', 'Objections', 'Validations','Challenges'].includes(category) ? avg_ranking : null
          };
        }
      });

      setFilterCounts(counts);

      // Update the filter options with counts
      const updatedOptions = { ...filterOptions };
      for (const filterType in updatedOptions) {
        updatedOptions[filterType] = updatedOptions[filterType].map(option => {
          const countData = counts[filterType]?.[option.value] || { count: 0 };
          return {
            ...option,
            count: countData.count,
            avg_ranking: ['Themes', 'Objections', 'Validations','Challenges'].includes(filterType) ? countData.avg_ranking : null

          };
        });
      }


      setFilterOptionsWithCounts(updatedOptions);
    } catch (err) {
      console.log("Error calculating filter counts:", err);
    }
  }, []);

  useEffect(() => {
    fetchAllFilterCounts();
  }, [fetchAllFilterCounts, users]);

  const handleFilterSelect = (filterType, values) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
    setIsSearchActive(true);
    setCurrentPage(1);
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

  const handleDeleteClick = async (Id) => {
    Alert.show('Delete Confirmation', 'Are you sure you want to delete this record?', [
      {
        text: 'Yes',
        primary: true,
        onPress: async () => {
          try {
            const response = await supabase
              .from("content_details")
              .delete()
              .eq("id", Id);

            if (response.error) {
              throw new Error(response.error.message);
            }
            const { count, error: countError } = await supabase
              .from("content_details")
              .select("*", { count: "exact", head: true });

            if (countError) throw countError;
            setTotalRecords(count || 0);

            if ((currentPage - 1) * ITEMS_PER_PAGE >= count) {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
            }

            const { data, error } = await supabase
              .from("content_details")
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

  const handleDateSearch = async () => {
    setDateSearchApplied(true);
    setIsSearchActive(true);
    setCurrentPage(1);
    setShowDateModal(false);
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

  const clearSearch = async () => {
    setSearchText("");
    setSelectedFilters({
      "Video Type": [],
      "Classifications": [],
      "Themes": [],
      "Objections": [],
      "Validations": [],
      "Challenges": [],
      "Insights": []
    });
    setFromDate("");
    setToDate("");
    setDateSearchApplied(false);
    setCurrentPage(1);
    setOpenDropdown(false);
    setLoadingMore(false);
  };

  return (
    <div className="overflow-x-hidden py-0 p-4 relative">
      {/* Search & divs Section */}
      <div className="py-3 px-6 mt-[-10px] flex justify-between items-center">
        {/* Search Bar */}
        <div className="p-0 w-full">
          {/* Search Bar Section */}
          <div className="mx-auto -mt-2">
            <h1 className="text-2xl font-bold mt-6 mb-4">The Contact Center Perspectives Podcast</h1>

            {/* Search Bar with Clear Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Left-aligned search group */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Search Input - Wider */}
                <div className="relative flex-grow" style={{ minWidth: '470px' }}>
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-white/10 placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search episodes keywords..."
                  />
                </div>

                {/* Clear Search Button - only visible when there's something to clear */}
                {(searchText || dateSearchApplied || Object.values(selectedFilters).some(arr => arr.length > 0)) && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 whitespace-nowrap transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                    Clear Search
                  </button>
                )}
              </div>

              {/* Right-aligned action buttons */}
              <div className="flex gap-2">
                {["Search By Date", "Share Search Link", "Add Record"].map((text, i) => {
                  const getIcon = (label) => {
                    switch (label) {
                      case "Search By Date": return <FaClock className="w-4 h-4" />;
                      case "Share Search Link": return <FaLink className="w-3 h-3" />;
                      case "Add Record": return <FaPlus className="w-3 h-3" />;
                      default: return null;
                    }
                  };
                  const isAddRecord = text === "Add Record";
                  const isSearchByDate = text === "Search By Date";
                  return (
                    <button
                      key={i}
                      className={`px-4 py-2 text-sm ${isAddRecord ? "bg-[#3a86ff] hover:bg-[#2f6fcb]" :
                        isSearchByDate && dateSearchApplied ? "bg-white/20 hover:bg-white/20" : "bg-white/10 hover:bg-white/20"
                        } transform -translate-y-[1px] rounded-full flex items-center gap-2 cursor-pointer `}
                      onClick={() => {
                        if (text === "Add Record") setShowCreateDashboardModal(true);
                        else if (text === "Search By Date") setShowDateModal(true);
                      }}
                    >
                      {getIcon(text)}
                      {text}
                    </button>
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
        <aside className="flex flex-col gap-2 w-full md:w-64 px-6">
          {Object.keys(filterOptionsWithCounts).map((field) => {
            const displayField = field === 'Themes' ? 'Themes' : field;
            return (
              <MultiSelectDropdown
                key={field}
                field={field}
                label={`Search By ${displayField}`}
                options={filterOptionsWithCounts[field]}
                selectedValues={selectedFilters[field] || []}
                onSelect={(values) => {
                  handleFilterSelect(field, values);
                }}
                isOpen={openDropdown === field}
                onToggle={() =>
                  setOpenDropdown(openDropdown === field ? null : field)
                }
                exclusiveSelections={selectedFilters}
              />
            );
          })}

          {/* Logo and Text */}
          <div className="mt-6 flex items-center gap-3 py-4 fixed bottom-0">
            <img
              src="/ai-navigator-logo.gif"
              alt="Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-sm font-semibold text-gray-700">
              Content Strategies
            </span>
          </div>
        </aside>

        <div className="hidden md:block max-h-full overflow-y-hidden w-px bg-gray-600 mx-4 ml-6 -mt-6"></div>

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
              hasMoreRecords={users.length < totalRecords}
              onLoadMore={loadMoreData}
              loadingMore={loadingMore}
              alignRecord={false}
              themesRank={themesRank}
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
          themesRank={themesRank}
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