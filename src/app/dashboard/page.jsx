"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import DraggableTable from "../customComponents/DraaggableTable";
import { createClient } from '@supabase/supabase-js';
import { FaClock, FaLink, FaTimes, FaPlus } from "react-icons/fa";
import CustomCrudForm from "../customComponents/CustomCrud";
import Alert from "../customComponents/Alert";
import SearchByDateModal from "../customComponents/SearchByDateModal";
import CustomInput from "../customComponents/CustomInput";
import { debounce } from "@/lib/utils";
import MultiSelectDropdown from "../customComponents/FiltersMultiSelect";
import DynamicBranding from "../customComponents/DynamicLabelAndLogo";

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
    { label: "Guest", id: "Guest" },
    { label: "Content Type", id: "Video Type" },
    { label: "Likes", id: "Likes" },
    { label: "Comments", id: "Comments" },
    { label: "Guest Title", id: "Guest Title" },
    { label: "Guest Company", id: "Guest Company" },
    { label: "Guest Industry", id: "Guest Industry" },
    // { label: "Guest Role", id: "Guest Role" },
    { label: "Date Recorded", id: "Date Recorded" },
    { label: "Episode #", id: "Episode_Number" },
    { label: "Full Episode Title", id: "Episode Title" },

    { label: "Video Title", id: "Video Title" },
    { label: "Video Length", id: "Video Length" },
    // { label: "Videos", id: "Videos" },
    { label: "Video Link", id: "Videos Link", type: 'url' },
    { label: "Video Description", id: "Video Description" },
    { label: "Top Three Takeaways", id: "Text comments for the rating (OPTIONAL input from the user)" },
    { label: "Key Quote", id: "Quote" },
    { label: "Mentions", id: "Mentions" },
    { label: "Mentioned Quotes", id: "Mentioned_Quotes" },
    { label: "Case Study", id: "Case_Study", type: 'url' },
    { label: "Case Study Transcript", id: "Case_Study_Transcript" },
    { label: "Public vs. Private", id: "Public_vs_Private" },
    { label: "Discussion Guide", id: "Discussion Guide" },
    { label: "Transcript", id: "Transcript" },
    { label: "Client", id: "Client" },
    { label: "Employee", id: "Employee" },
    // { label: "Tags", id: "Tags" },
    { label: "Themes", id: "Themes" },
    { label: "Validations", id: "Validations" },
    { label: "Objections", id: "Objections" },
    { label: "Challenges", id: "Challenges" },
    { label: "Sales Insights", id: "Sales Insights" },
    { label: "Challenge Video", id: "Challenge Report_Unedited Video Link", type: 'url' },
    { label: "Challenge Transcript", id: "Challenge Report_Unedited Transcript Link" },
    { label: "Challenge Report", id: "Challenge Report_Summary" },
    { label: "Podcast Video (Unedited)", id: "Podcast Report_Unedited Video Link", type: 'url' },
    { label: "Podcast Transcript", id: "Podcast Report_Unedited Transcript Link" },
    { label: "Podcast Summary", id: "Podcast Report_Summary" },
    { label: "Post-Podcast Video", id: "Post-Podcast Report_Unedited Video Link", type: 'url' },
    { label: "Post-Podcast Transcript", id: "Post-Podcast Report_Unedited Transcript Link" },
    { label: "Post-Podcast Report", id: "Post-Podcast Report_Summary" },
    { label: "Podbook Link", id: "Podbook Link", type: 'url' },
    { label: "Article", id: "Article - Extended Media" },
    { label: "Article Text", id: "Article_Transcript" },
    { label: "Quote Card", id: "Quote Card - Extended Media", type: 'url' },
    { label: "YouTube Short", id: "YouTube Short - Extended Media", type: 'url' },
    { label: "YouTube Short Transcript", id: "YouTube_Short_Transcript" },
    { label: "LinkedIn Video", id: "LinkedIn Video - Extended Media", type: 'url' },
    { label: "LinkedIn Video Transcript", id: "LinkedIn_Video_Transcript" },
    { label: "Post-Podcast Insights", id: "Post_Podcast_Insights" },
    { label: "Actions", id: "action" },
  ];

  const arrayFields = [
    // "Guest Industry",
    "Objections",
    // "Tags",
    "Themes",
    "Validations",
    "Challenges",
    "Sales Insights",
    "Video Type"
  ];

  const dashboardCrudDetails = [
    { label: "Video ID", key: "Video_ID", placeholder: "Enter Video ID" },
    { label: "Guest", key: "Guest", placeholder: "Enter Guest Name" },
    { label: "Avatar", key: "Avatar", placeholder: "Upload Avatar", type: "image" },
    { label: "Guest Title", key: "Guest Title", placeholder: "Enter Guest Title" },
    { label: "Guest Company", key: "Guest Company", placeholder: "Enter Guest Company" },
    { label: "Guest Industry", key: "Guest Industry", placeholder: "Enter Guest Industry" },
    // { label: "Guest Role", key: "Guest Role", placeholder: "Enter Guest Role" },
    { label: "Date Recorded", key: "Date Recorded", placeholder: "Select Date", type: "date" },
    { label: "Episode #", key: "Episode_Number", placeholder: "Enter Episode Number", type: "number" },
    { label: "Full Episode Title", key: "Episode Title", placeholder: "Enter Episode Title" },
    { label: "Video Type", key: "Video Type", placeholder: "Select Video Type", type: "multiselect" },
    { label: "Video Title", key: "Video Title", placeholder: "Enter Video Title" },
    { label: "Video Length", key: "Video Length", placeholder: "Enter Video Length" },
    // { label: "Videos", key: "Videos", placeholder: "Select Videos" },
    { label: "Video Link", key: "Videos Link", placeholder: "Enter Video Link", type: 'url' },
    { label: "Video Description", key: "Video Description", placeholder: "Enter Video Description" },
    { label: "Top Three Takeaways", key: "Text comments for the rating (OPTIONAL input from the user)", placeholder: "Enter Comments", type: "textarea" },
    { label: "Key Quote", key: "Quote", placeholder: "Enter Quote" },
    { label: "Mentions", key: "Mentions", placeholder: "Select Mention", type: "select" },
    { label: "Mentioned Quotes", key: "Mentioned_Quotes", placeholder: "Enter Mentioned Quotes" },
    { label: "Public vs. Private", key: "Public_vs_Private", placeholder: "Select Visibility", type: "select" },
    { label: "Discussion Guide", key: "Discussion Guide", placeholder: "Enter Discussion Guide Link", type: "url" },
    { label: "Transcript", key: "Transcript", placeholder: "Enter Transcript" },
    { label: "Client", key: "Client", placeholder: "Select Client", type: "select" },
    { label: "Employee", key: "Employee", placeholder: "Enter Employee" },
    // { label: "Tags", key: "Tags", placeholder: "Select Tags", type: "multiselect" },
    { label: "Themes", key: "Themes", placeholder: "Select Themes", type: "multiselect" },
    { label: "Validations", key: "Validations", placeholder: "Select Validations", type: "multiselect" },
    { label: "Objections", key: "Objections", placeholder: "Select Objections", type: "multiselect" },
    { label: "Challenges", key: "Challenges", placeholder: "Select an ICP Challenge", type: "multiselect" },
    { label: "Sales Insights", key: "Sales Insights", placeholder: "Select Sales Insights", type: "multiselect" },
    { label: "Challenge Video", key: "Challenge Report_Unedited Video Link", type: "url" },
    { label: "Challenge Transcript", key: "Challenge Report_Unedited Transcript Link" },
    { label: "Challenge Report", key: "Challenge Report_Summary" },
    { label: "Podcast Video (Unedited)", key: "Podcast Report_Unedited Video Link", type: "url" },
    { label: "Podcast Transcript", key: "Podcast Report_Unedited Transcript Link" },
    { label: "Podcast Summary", key: "Podcast Report_Summary" },
    { label: "Post-Podcast Video", key: "Post-Podcast Report_Unedited Video Link", type: "url" },
    { label: "Post-Podcast Transcript", key: "Post-Podcast Report_Unedited Transcript Link" },
    { label: "Post-Podcast Report", key: "Post-Podcast Report_Summary" },
    { label: "Podbook Link", key: "Podbook Link", placeholder: "Enter Podbook Link", type: "url" },
    { label: "Article", key: "Article - Extended Media", placeholder: "Enter Article Link", type: "url" },
    { label: "Article Text", key: "Article_Transcript", placeholder: "Enter Article Transcript" },
    { label: "Quote Card", key: "Quote Card - Extended Media", placeholder: "Enter Quote Card" },
    { label: "YouTube Short", key: "YouTube Short - Extended Media", placeholder: "Enter YouTube Short Link ", type: "url" },
    { label: "YouTube Short Transcript", key: "YouTube_Short_Transcript", placeholder: "Enter YouTube Short Transcript " },
    { label: "LinkedIn Video", key: "LinkedIn Video - Extended Media", placeholder: "Enter LinkedIn Video Link ", type: "url" },
    { label: "LinkedIn Video Transcript", key: "LinkedIn_Video_Transcript", placeholder: "Enter LinkedIn Video Transcript" },
    { label: "Post Podcast Insights", key: "Post_Podcast_Insights", placeholder: "Select Post Podcast Insights" },
    { label: "Case Study", key: "Case_Study", placeholder: "Enter Case Study Link", type: 'url' },
    { label: "Case Study Transcript", key: "Case_Study_Transcript", placeholder: "Enter Case Study Transcript" },
  ];

  const [selectedFilters, setSelectedFilters] = useState({
    "Video Type": [],
    "Classifications": [],
    "Themes": [],
    "Objections": [],
    "Validations": [],
    "Challenges": [],
    "Sales Insights": []
  });

  const filterOptions = {
    "Video Type": [
      { value: "Summary Video", label: "Summary Video", count: 0 },
      { value: "Full Episode", label: "Full Episode", count: 0 },
      { value: "Highlights Video", label: "Highlights Video", count: 0 },
      { value: "Case Study", label: "Case Study", count: 0 },
      { value: "ICP Advice", label: "ICP Advice", count: 0 },
      { value: "Post-Podcast", label: "Post-Podcast", count: 0 },
      { value: "Guest Introduction", label: "Guest Introduction", count: 0 },
      { value: "Post Podcast Insights", label: "Post Podcast Insights", count: 0 },
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
      { value: "Positioning Contact Centers as Strategic Growth Drivers (Contact Center Industry)", label: "Positioning Contact Centers as Strategic Growth Drivers (Contact Center Industry)" },
      { value: "Transforming Contact Centers into Experience-Driven Hubs (Contact Center Industry)", label: "Transforming Contact Centers into Experience-Driven Hubs (Contact Center Industry)" },
      { value: "Harnessing AI to Elevate Customer Experience (Contact Center Industry)", label: "Harnessing AI to Elevate Customer Experience (Contact Center Industry)" },
      { value: "Retaining Talent to Reduce Turnover and Improve CX (Contact Center Industry)", label: "Retaining Talent to Reduce Turnover and Improve CX (Contact Center Industry)" },
      { value: "Building Culture and Brand Alignment Inside the Contact Center (Contact Center Industry)", label: "Building Culture and Brand Alignment Inside the Contact Center (Contact Center Industry)" },
      { value: "Treating BPOs as Strategic Growth Partners, Not Just Vendors  (BPO Partnership)", label: "Treating BPOs as Strategic Growth Partners, Not Just Vendors  (BPO Partnership)" },
      { value: "Reimagining Outsourcing for Customer-Centric Service (BPO Partnership)", label: "Reimagining Outsourcing for Customer-Centric Service (BPO Partnership)" },
      { value: "Embedding AI into BPO Operations for Smarter Support (BPO Partnership)", label: "Embedding AI into BPO Operations for Smarter Support (BPO Partnership)" },
      { value: "Aligning Outsourcing KPIs with Revenue and Innovation (BPO Partnership)", label: "Aligning Outsourcing KPIs with Revenue and Innovation (BPO Partnership)" },
      { value: "Joint Talent Management to Elevate BPO Service Quality (BPO Partnership)", label: "Joint Talent Management to Elevate BPO Service Quality (BPO Partnership)" },
      { value: "Redefining Contact Centers as Value Creation Engines (Podcast Guests)", label: "Redefining Contact Centers as Value Creation Engines (Podcast Guests)" },
      { value: "Shifting from Reactive to Proactive Customer Engagement (Podcast Guests)", label: "Shifting from Reactive to Proactive Customer Engagement (Podcast Guests)" },
      { value: "Customer Experience as the New Competitive Advantage (Podcast Guests)", label: "Customer Experience as the New Competitive Advantage (Podcast Guests)" },
      { value: "Linking Agent Experience Directly to Customer Loyalty (Podcast Guests)", label: "Linking Agent Experience Directly to Customer Loyalty (Podcast Guests)" },
      { value: "Using AI to Empower Agents, Not Replace Them (Podcast Guests)", label: "Using AI to Empower Agents, Not Replace Them (Podcast Guests)" },
    ],
    "Objections": [
      { value: "Cost vs. Value Perception", label: "Cost vs. Value Perception" },
      { value: "Brand Representation and Quality Control", label: "Brand Representation and Quality Control" },
      { value: "Fear of Losing Operational Control", label: "Fear of Losing Operational Control" },
      { value: "Integration and Ramp-Up Complexity", label: "Integration and Ramp-Up Complexity" },
      { value: "Lack of Industry-Specific Expertise", label: "Lack of Industry-Specific Expertise" },
      { value: "Technology Gaps and Legacy Limitations", label: "Technology Gaps and Legacy Limitations" },
      { value: "Transparency and Performance Accountabilitys", label: "Transparency and Performance Accountabilitys" },
      { value: "Previous Negative Outsourcing Experience", label: "Previous Negative Outsourcing Experience" },
      { value: "Internal Resistance to Change", label: "Internal Resistance to Change" },
    ],
    "Validations": [
      { value: "Transform Cost Centers into Strategic Experience Centers", label: "Transform Cost Centers into Strategic Experience Centers" },
      { value: "Every Interaction is a Revenue Opportunity", label: "Every Interaction is a Revenue Opportunity" },
      { value: "Operationalizing Revenue From Every Interaction", label: "Operationalizing Revenue From Every Interaction" },
      { value: "Customized AI Strategy Empowering Actionable Insights Through Tailored Technology", label: "Customized AI Strategy Empowering Actionable Insights Through Tailored Technology" },
      { value: "Seamless Integration as an Extension of Your Team", label: "Seamless Integration as an Extension of Your Team" },
      { value: "Proven Tangible Results and Measurable Success", label: "Proven Tangible Results and Measurable Success" },
      { value: "Empowering Executives to Become Strategic Business Partners", label: "Role as Consultant/Partner" },
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
    "Sales Insights": [
      { value: "Evolving Expectations of Data Security", label: "Evolving Expectations of Data Security" },
      { value: "Understanding Buyer Priorities in Scaling Operations", label: "Understanding Buyer Priorities in Scaling Operations" },
      { value: "Proven Experience and Service Quality", label: "Proven Experience and Service Quality" },
      { value: "Customer Experience as a Competitive Advantage", label: "Customer Experience as a Competitive Advantage" },
      { value: "Skepticism About Long-Term Partnership Viability", label: "Skepticism About Long-Term Partnership Viability" },
      { value: "Flexibility in Service and Partnership Models", label: "Flexibility in Service and Partnership Models" },
      { value: "Pressure to Reduce Time-to-Resolution", label: "Pressure to Reduce Time-to-Resolution" },
      { value: "Measuring and Leveraging CX as a Differentiator", label: "Measuring and Leveraging CX as a Differentiator" },
      { value: "Desire for Seamless Integration with Internal Systems", label: "Desire for Seamless Integration with Internal Systems" },
      { value: "Challenges in Scaling Customer Support Operations", label: "Challenges in Scaling Customer Support Operations" },
      { value: "AI for Operational Efficiency and Growth", label: "AI for Operational Efficiency and Growth" },
      { value: "Cultural and Values Alignment for Seamless Collaboration", label: "Cultural and Values Alignment for Seamless Collaboration" },
      { value: "Transitioning from Traditional Contact Centers to Experience Centers", label: "Transitioning from Traditional Contact Centers to Experience Centers" },
      { value: "Customer Experience as a Strategic Differentiator", label: "Customer Experience as a Strategic Differentiator" },
      { value: "Advanced Technology for Streamlined Operations", label: "Advanced Technology for Streamlined Operations" },
      { value: "Ability to Integrate into the Company’s Brand and Culture", label: "Ability to Integrate into the Company’s Brand and Culture" },
      { value: "Cost Sensitivity in Contract Negotiations", label: "Cost Sensitivity in Contract Negotiations" },
      { value: "Resistance to Outsourcing Critical Customer Functions", label: "Resistance to Outsourcing Critical Customer Functions" },
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
        sales_insights_json: selectedFilters["Sales Insights"]?.length ? selectedFilters["Sales Insights"] : null,
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
                  return item.challenge || item.challenges || item.Challenges || item.validation || item.objection || item.theme || item.insight || '';
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
        if (formattedItem["Sales Insights"]) {
          formattedItem["Sales Insights"] = formatArrayField(formattedItem["Sales Insights"]);
        }

        // Handle other array fields
        arrayFields.forEach(field => {
          if (
            field !== 'Themes' &&
            field !== 'Objections' &&
            field !== 'Validations' &&
            field !== 'Challenges' &&
            field !== 'Sales Insights' &&
            formattedItem[field]
          ) {
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
        "Sales Insights": {}
      };

      // Process the counts data
      data.forEach(({ category, value, count, avg_ranking }) => {
        if (counts[category]) {
          counts[category][value] = {
            count,
            avg_ranking: ['Themes', 'Objections', 'Validations', 'Challenges', 'Sales Insights'].includes(category) ? avg_ranking : null
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
            avg_ranking: ['Themes', 'Objections', 'Validations', 'Challenges', 'Sales Insights'].includes(filterType) ? countData.avg_ranking : null

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
      "Sales Insights": []
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
            {/* <h1 className="text-2xl font-bold mt-4 mb-2">The Contact Center Perspectives Podcast</h1> */}
            <DynamicBranding showLogo={false} showTitle={true} />
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
      {/* Selected Filters Section - Fixed and Scrollable */}
      {(searchText || dateSearchApplied || Object.values(selectedFilters).some(arr => arr.length > 0)) && (
        <div className="sticky top-0 z-10 max-w-[calc(100%-3rem)] ml-6 border rounded-full bg-white/10 py-2 px-8 mb-3">
          <div className="flex items-center w-full max-w-[calc(100vw-8rem)] mx-auto">
            <span className="text-gray-200 font-medium whitespace-nowrap mr-2 -ml-2">Applied Filters:</span>
            <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 no-scrollbar">
              {/* Search text filter */}
              {searchText && (
                <div className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                  <span className="text-white whitespace-nowrap">Search: "{searchText}"</span>
                  <button
                    onClick={() => setSearchText("")}
                    className="text-gray-300 hover:text-white"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Date filter */}
              {dateSearchApplied && (
                <div className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                  <span className="text-white text-sm whitespace-nowrap">
                    Date: {fromDate} to {toDate}
                  </span>
                  <button
                    onClick={() => {
                      setFromDate("");
                      setToDate("");
                      setDateSearchApplied(false);
                    }}
                    className="text-gray-300 hover:text-white"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Dynamic filters */}
              {Object.entries(selectedFilters).map(([filterType, values]) => {
                const displayFilter = filterType === 'Video Type' ? 'Content Type' : filterType;

                return values.length > 0 && (
                  <div key={filterType} className="flex-shrink-0 flex items-center gap-1 bg-[#1a1b41] rounded-full px-3 py-1">
                    <span className="text-white text-sm whitespace-nowrap capitalize">
                      {displayFilter}: {values.join(", ")}
                    </span>
                    <button
                      onClick={() => handleFilterSelect(filterType, [])}
                      className="text-gray-300 hover:text-white"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      )}
      <hr className="border-gray-500 mb-6 mt-[10px] -mx-12" />

      {/* Filter Section */}
      <div className="flex">
        <aside className="flex flex-col gap-2 w-full md:w-64 px-6">
          {Object.keys(filterOptionsWithCounts).map((field) => {
            const displayField = field === 'Video Type' ? 'Content Type' : field;
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
              src="/ai-navigator-logo.png"
              alt="Logo"
              className="w-30 h-6 object-contain"
            />

            {/* Text container: stacked vertically */}
            {/* <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-400">
                AI - Navigator
              </span>
              <span className="text-xs text-gray-500">
                Powered by Content Strategies
              </span>
            </div> */}
          </div>

        </aside>


        <div className="hidden md:block h-auto overflow-y-hidden w-px bg-gray-600 mx-4 ml-6 -mt-6"></div>
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
              loadingRecord={true}
            />
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-0 px-4 py-2 sm:px-6">
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