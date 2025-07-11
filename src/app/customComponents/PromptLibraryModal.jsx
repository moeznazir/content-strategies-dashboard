import { useState, useEffect } from 'react';
import { ShowCustomToast } from './CustomToastify';
import { appColors } from '@/lib/theme';

const PromptLibraryModal = ({ showLibraryDropdown, setShowLibraryDropdown }) => {
    // Department and Template Data

    const departmentTypes = [
        { id: 'marketing', name: 'Marketing' },
        { id: 'sales', name: 'Sales' },
        { id: 'customersuccess', name: 'Customer Success' },
        { id: 'financial', name: 'Financial' },
        { id: 'product', name: 'Product' },
        { id: 'operations', name: 'Operations' }
    ];

    const templateLibraries = {
        marketing: [
            { id: 'article', name: 'Article Writing' },
            { id: 'email', name: 'Email' },
            { id: 'socialpost', name: 'Social posts' },
            { id: 'casestudy', name: 'Case Studies' }
        ],
        sales: [
            { id: 'test', name: 'Test Writing' },
            { id: 'email', name: 'Email' },
            { id: 'socialpost', name: 'Social posts' },
            { id: 'casestudy', name: 'Case Studies' }
        ],
        customersuccess: [
            { id: 'test', name: 'Test Success Writing' },
            { id: 'email', name: 'Email' },
            { id: 'socialpost', name: 'Social posts' },
            { id: 'casestudy', name: 'Case Studies' }
        ]
    };

    const contactLibraryDocuments = [
        { id: 'doc1', title: 'POV: Contact Centers as an Investable Value Engine' },
        { id: 'doc2', title: 'We Know That We Need to Know What We Don\'t Know' },
        { id: 'doc3', title: 'Contact Center Agents\' Perspective on AI' },
    ];

    // State for Library Modals
    const [departmentTypeOpen, setDepartmentTypeOpen] = useState(true);
    const [templateOpen, setTemplateOpen] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [selectedLibraryDocuments, setSelectedLibraryDocuments] = useState([]);
    const [showManageLibraryModal, setShowManageLibraryModal] = useState(false);
    const [newDepartment, setNewDepartment] = useState('');
    const [newTemplate, setNewTemplate] = useState('');
    const [showInfo, setShowInfo] = useState(true);

    // New state for multi-step flow
    const [currentStep, setCurrentStep] = useState(1);
    const [searchMethod, setSearchMethod] = useState('ai');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(true);
    const [hasSearchedAISearch, setHasSearchedAISearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(true);
    const [contentTypeOpen, setContentTypeOpen] = useState(true);
    const [challengesOpen, setChallengesOpen] = useState(true);
    const [selectedContentTypes, setSelectedContentTypes] = useState([]);
    const [selectedChallenges, setSelectedChallenges] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        company: '',
        title: '',
        linkedin: '',
        notes: ''
    });

    // Sample data for filters
    const contentTypes = [
        { id: 'type1', name: 'Articles', count: 12 },
        { id: 'type2', name: 'Case Studies', count: 5 },
        { id: 'type3', name: 'Whitepapers', count: 3 }
    ];

    const challenges = [
        { id: 'challenge1', name: 'Customer Support' },
        { id: 'challenge2', name: 'Sales Enablement' },
        { id: 'challenge3', name: 'Product Adoption' }
    ];

    // Handler functions
    const handleDepartmentSelect = (deptId) => {
        setSelectedDepartment(deptId);
        setSelectedTemplate(''); // Reset template when department changes
    };

    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
    };

    const handleDocumentSelect = (docId) => {
        setSelectedLibraryDocuments(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const handleAddToLibrary = () => {
        // Here you would typically save to your database/state management
        console.log('Adding to library:', { newDepartment, newTemplate });
        setShowManageLibraryModal(false);
        setNewDepartment('');
        setNewTemplate('');
    };

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmitAISearch = () => {
        // Simulate search
        setIsLoading(true);
        setTimeout(() => {
            setSearchResults([
                { doc_id: 'ai1', title: 'AI Search Result 1' },
                { doc_id: 'ai2', title: 'AI Search Result 2' },
                { doc_id: 'ai3', title: 'AI Search Result 3' }
            ]);
            setHasSearchedAISearch(true);
            setIsLoading(false);
        }, 1000);
    };

    const handleDocSelect = (docId, title) => {
        // Handle document selection
    };

    const handleContentTypeChange = (typeId) => {
        setSelectedContentTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(id => id !== typeId)
                : [...prev, typeId]
        );
    };

    const handleChallengeChange = (challengeId) => {
        setSelectedChallenges(prev =>
            prev.includes(challengeId)
                ? prev.filter(id => id !== challengeId)
                : [...prev, challengeId]
        );
    };

    const getResultsTitle = () => {
        if (selectedContentTypes.length > 0 || selectedChallenges.length > 0) {
            return 'Filtered Documents';
        }
        return 'All Documents';
    };
    // Handler for guest info changes
    const handleGuestInfoChange = (field, value) => {
        setGuestInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        // Filter documents based on selected filters
        const filtered = contactLibraryDocuments.filter(doc => {
            // In a real app, you would have more complex filtering logic
            return true;
        });
        setFilteredDocuments(filtered);
    }, [selectedContentTypes, selectedChallenges]);
    const steps = [1, 2, 3];

    return (
        <div className="relative ml-[5%] mb-4  w-[220px]">
            {showLibraryDropdown && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50" >
                    {/* Main Library Modal */}
                    <div className=" border w-[800px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl text-white px-6 py-5 relative font-sans" style={{ backgroundColor: appColors.primaryColor }}>
                        {/* Step Indicator */}
                        <div className="flex justify-center -mt-2 items-center text-white">
                            {steps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center relative">
                                    {/* Step Circle + Connector */}
                                    <div className="flex items-center">
                                        {/* Left connector (except for first step) */}
                                        {idx !== 0 && (
                                            <div className="w-8 h-[2px] bg-blue-500"></div>
                                        )}

                                        {/* Circle */}
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold ${step < currentStep
                                                ? 'bg-blue-500 border-white'
                                                : step === currentStep
                                                    ? 'bg-blue-600 border-white'
                                                    : 'bg-blue-500 border-white opacity-50'
                                                }`}
                                        >
                                            {step}
                                        </div>

                                        {/* Right connector (except for last step) */}
                                        {idx !== steps.length - 1 && (
                                            <div className="w-6 h-[2px] bg-blue-500"></div>
                                        )}
                                    </div>

                                    {/* Step label - perfectly centered */}
                                    <div className="mt-1 text-xs text-[10px]  font-medium">
                                        Step {step}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="border-t my-2 -mx-6"></div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-center mb-3">
                            {currentStep === 1 ? 'Prompt Library' : currentStep === 2 ? 'Prompt Library' : 'Prompt Library'}
                        </h2>
                        <div className="border-t my-2 -mx-6"></div>

                        {/* Selected Template Display */}
                        <div className="w-full !mr-4 ml-4 mt-4 mb-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium leading-relaxed border p-2 py-1 rounded-md">
                                    <span className="font-semibold text-[15px]">Selected Template: </span>
                                    <span className='text-[12px]'>
                                        {selectedTemplate ?
                                            templateLibraries[selectedDepartment]?.find(t => t.id === selectedTemplate)?.name :
                                            'None selected'}
                                    </span>
                                </label>
                            </div>
                        </div>
                        {/* Step 1 Content - Template Selection */}
                        {currentStep === 1 && (
                            <>
                                {/* Filter and Content Area */}
                                <div className="flex justify-center">
                                    <div className="w-full mr-4 ml-4">
                                        <div className="flex gap-4 mt-4">
                                            {/* Left Filters */}
                                            <div className="w-1/3 space-y-3 border rounded-md p-2">
                                                {/* Department Filter */}
                                                <div className=" border border-white/20 rounded-md overflow-hidden">
                                                    <button
                                                        className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                        onClick={() => setDepartmentTypeOpen(!departmentTypeOpen)}
                                                    >
                                                        <span>Department</span>
                                                        <span>{departmentTypeOpen ? '▼' : '▶'}</span>
                                                    </button>
                                                    {departmentTypeOpen && (
                                                        <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20">
                                                            {departmentTypes.map((dept) => (
                                                                <label key={dept.id} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="department"
                                                                        className="mr-2 h-3 w-3 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        checked={selectedDepartment === dept.id}
                                                                        onChange={() => handleDepartmentSelect(dept.id)}
                                                                    />
                                                                    {dept.name}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Template Filter (only shows if department selected) */}
                                                {selectedDepartment && (
                                                    <div className="border border-white/20 rounded-md overflow-hidden">
                                                        <button
                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                            onClick={() => setTemplateOpen(!templateOpen)}
                                                        >
                                                            <span>Templates</span>
                                                            <span>{templateOpen ? '▼' : '▶'}</span>
                                                        </button>
                                                        {templateOpen && (
                                                            <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20">
                                                                {templateLibraries[selectedDepartment]?.map((template) => (
                                                                    <label key={template.id} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            name="template"
                                                                            className="mr-2 h-3 w-3 rounded-full border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            checked={selectedTemplate === template.id}
                                                                            onChange={() => handleTemplateSelect(template.id)}
                                                                        />
                                                                        {template.name}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Results - Only show when template is selected */}
                                            <div className="w-2/3 rounded-md border border overflow-hidden p-2">
                                                <div className="border border-white/20 rounded-md">
                                                    <div className="p-2 border-b border-white/20">
                                                        <div className="text-blue-300 font-medium text-xs">
                                                            Documents{selectedTemplate && ` (${contactLibraryDocuments.length})`}
                                                        </div>
                                                    </div>
                                                    <div className="h-[270px] max-h-[calc(80vh-100px)] overflow-y-auto">
                                                        {selectedTemplate && (
                                                            <>
                                                                {contactLibraryDocuments.map((doc) => (
                                                                    <div key={doc.id} className="flex items-center bg-[#2b2b4b] p-2 mx-2 my-1 bg-[#3b3b5b] border hover:bg-white/10 border-white/20 rounded-md cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            checked={selectedLibraryDocuments.includes(doc.id)}
                                                                            onChange={() => handleDocumentSelect(doc.id)}
                                                                        />
                                                                        <span className="text-xs">{doc.title}</span>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2 Content - Selected Template Review */}
                        {currentStep === 2 && (
                            <div className="p-4">
                                <div className=" p-6 rounded-lg border border-white/20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Guest Name */}
                                        <div>
                                            <label className="block text-gray-300 text-sm mb-1">Guest Name</label>
                                            <input
                                                type="text"
                                                value={guestInfo.name}
                                                onChange={(e) => handleGuestInfoChange('name', e.target.value)}
                                                className="w-full bg-[#2b2b4b]  border border-white/20 rounded-md p-2 text-sm text-white"
                                                placeholder="Enter guest name"
                                            />
                                        </div>

                                        {/* Guest Title */}
                                        <div>
                                            <label className="block text-gray-300 text-sm mb-1">Guest Title</label>
                                            <input
                                                type="text"
                                                value={guestInfo.title}
                                                onChange={(e) => handleGuestInfoChange('title', e.target.value)}
                                                className="w-full bg-[#2b2b4b] border border-white/20 rounded-md p-2 text-sm text-white"
                                                placeholder="Enter guest title"
                                            />
                                        </div>

                                        {/* Guest Company */}
                                        <div>
                                            <label className="block text-gray-300 text-sm mb-1">Guest Company</label>
                                            <input
                                                type="text"
                                                value={guestInfo.company}
                                                onChange={(e) => handleGuestInfoChange('company', e.target.value)}
                                                className="w-full bg-[#2b2b4b] border border-white/20 rounded-md p-2 text-sm text-white"
                                                placeholder="Enter company name"
                                            />
                                        </div>

                                        {/* Guest LinkedIn */}
                                        <div>
                                            <label className="block text-gray-300 text-sm mb-1">Guest LinkedIn</label>
                                            <input
                                                type="text"
                                                value={guestInfo.linkedin}
                                                onChange={(e) => handleGuestInfoChange('linkedin', e.target.value)}
                                                className="w-full bg-[#2b2b4b] border border-white/20 rounded-md p-2 text-sm text-white"
                                                placeholder="Enter LinkedIn URL"
                                            />
                                        </div>

                                        {/* Additional Notes (Full Width) */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-300 text-sm mb-1">Additional Notes</label>
                                            <textarea
                                                value={guestInfo.notes}
                                                onChange={(e) => handleGuestInfoChange('notes', e.target.value)}
                                                className="w-full bg-[#2b2b4b] border border-white/20 rounded-md p-2 text-sm text-white h-24 resize-none"
                                                placeholder="Enter any additional notes"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        )}


                        {/* Step 3 Content - Context */}
                        {currentStep === 3 && (
                            <>
                                {/* Source Document and Toggle */}
                                <div className="mr-4 ml-4">
                                    <div className="relative mb-4 min-h-[10px]">
                                        {/* Toggle Button - Top Right */}
                                        <div className="absolute top-[10px] right-0 flex items-center space-x-2 z-10">
                                            <span className="text-xs text-gray-400">{showInfo ? "Hide" : "Show"}</span>
                                            <button
                                                onClick={() => setShowInfo(!showInfo)}
                                                className="focus:outline-none"
                                                aria-label={showInfo ? "Hide options" : "Show options"}
                                            >
                                                <div
                                                    className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${showInfo ? 'bg-blue-600' : 'bg-gray-500'
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${showInfo ? 'translate-x-4' : 'translate-x-0'
                                                            }`}
                                                    ></div>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Content */}
                                        {showInfo && (
                                            <div className="pt-2"> {/* Increased padding to account for toggle */}
                                                <label className="text-sm font-medium leading-relaxed relative">
                                                    <span className="font-semibold">Source Document:</span>{" "}
                                                    <span className="text-[12px]">
                                                        Please select a search method for desired document:
                                                    </span>
                                                    <span className="text-blue-400 text-[12px] cursor-pointer ml-2 relative group">
                                                        Learn more about Search Type
                                                        {/* Tooltip */}
                                                        <div className="absolute left-1/3 top-6 transform -translate-x-1/4 w-[290px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="bg-[#3b3b5b] text-white text-[11px] p-3 rounded-lg shadow-lg">
                                                                <p className="mb-1 mt-0">
                                                                    <strong>AI Search:</strong> Output will come from Agents
                                                                </p>
                                                                <p>
                                                                    <strong>Manual Search:</strong> Output will come from database
                                                                </p>
                                                            </div>
                                                            <div className="absolute -top-[5px] left-6 w-5 h-5 transform rotate-45 bg-[#3b3b5b] z-0" />
                                                        </div>
                                                    </span>
                                                </label>

                                                <div className="mt-3 flex items-center gap-6">
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={searchMethod === 'ai'}
                                                            onChange={() => setSearchMethod('ai')}
                                                        />
                                                        AI Search
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={searchMethod === 'manual'}
                                                            onChange={() => setSearchMethod('manual')}
                                                        />
                                                        Manual Search
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="w-full mr-4 ml-4">
                                        {/* STEP 1 - AI Search */}
                                        {searchMethod === 'ai' && (
                                            <div className="mt-6">
                                                <h3 className="text-lg text-center font-semibold mb-2">Search and select a Resource</h3>

                                                {/* INPUT FIELD */}
                                                <div className="flex items-center gap-2">
                                                    <div className="relative w-full">
                                                        <input
                                                            type="text"
                                                            placeholder="Ask anything"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="w-full pt-3 pb-3 h-[45px] p-4 pr-36 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            style={{ backgroundColor: '#2b2b4b' }}
                                                            onKeyDown={(e) => e.key === 'Enter' && isSubmitEnabled && handleSubmitAISearch()}
                                                        />
                                                        <div className="relative group">
                                                            {!searchQuery && (
                                                                <div className="absolute -top-0 -right-14 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                    Please input text
                                                                </div>
                                                            )}
                                                            <button
                                                                onClick={handleSubmitAISearch}
                                                                disabled={isLoading || !isSubmitEnabled || !searchQuery}
                                                                className="absolute right-2 -top-[40.5px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
                                                            >
                                                                {isLoading ? (
                                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                                                    </svg>
                                                                ) : (
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        className="w-5 h-5"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Documents */}
                                                {hasSearchedAISearch && (
                                                    <div>
                                                        <div
                                                            className="flex items-center mb-2 mt-4 ml-4 cursor-pointer"
                                                            onClick={() => setIsSearchResultsOpen(!isSearchResultsOpen)}
                                                        >
                                                            <span className="text-blue-700 text-sm">{isSearchResultsOpen ? '▼' : '▶'}</span>
                                                            <h3 className="font-medium ml-2 text-sm text-blue-400">Search Results</h3>
                                                            <span className="ml-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                                                {searchResults.length} docs
                                                            </span>
                                                        </div>

                                                        {isSearchResultsOpen && (
                                                            <div className="max-h-[170px] overflow-y-auto ml-4 mr-4 grid grid-cols-1 gap-1.5 ">
                                                                {searchResults.map((doc) => (
                                                                    <div
                                                                        key={doc.doc_id}
                                                                        className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-md cursor-pointer"
                                                                        onClick={() => handleDocSelect(doc.doc_id, doc.title)}
                                                                    >
                                                                        <svg width="20" height="20" viewBox="0 0 48 48">
                                                                            <g transform="translate(10, 10)" fill="orange" fillOpacity="0.8">
                                                                                <rect y="0" width="34" height="4" rx="1" />
                                                                                <rect y="6" width="34" height="4" rx="1" />
                                                                                <rect y="12" width="34" height="4" rx="1" />
                                                                                <rect y="18" width="34" height="4" rx="1" />
                                                                                <rect y="24" width="34" height="4" rx="1" />
                                                                            </g>
                                                                        </svg>
                                                                        <span className="text-xs text-white/90">{doc.title}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* STEP 2 - MANUAL SEARCH */}
                                        {searchMethod === 'manual' && (
                                            <div className="flex gap-4 mt-4">
                                                {/* Left Filters - Collapsible Sections */}
                                                <div className="w-1/3 space-y-3 border rounded-md p-2">
                                                    {/* Content Type Filter */}
                                                    <div className="bg-[#2b2b4b] border border-white/20 rounded-md overflow-hidden">
                                                        <button
                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                            onClick={() => setContentTypeOpen(!contentTypeOpen)}
                                                        >
                                                            <span>Filter By Content Type</span>
                                                            <span>{contentTypeOpen ? '▼' : '▶'}</span>
                                                        </button>
                                                        {contentTypeOpen && (
                                                            <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20">
                                                                {contentTypes.map((type) => (
                                                                    <label key={type.id} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            checked={selectedContentTypes.includes(type.id)}
                                                                            onChange={() => handleContentTypeChange(type.id)}
                                                                        />
                                                                        <span className="flex-1">{type.name}</span>
                                                                        <span className="text-gray-400 text-xs">({type.count})</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Challenges Filter */}
                                                    <div className="bg-[#2b2b4b] border border-white/20 rounded-md overflow-hidden">
                                                        <button
                                                            className="flex justify-between items-center w-full p-2 text-left text-xs font-medium"
                                                            onClick={() => setChallengesOpen(!challengesOpen)}
                                                        >
                                                            <span>Filter By Challenges</span>
                                                            <span>{challengesOpen ? '▼' : '▶'}</span>
                                                        </button>
                                                        {challengesOpen && (
                                                            <div className="max-h-[120px] overflow-auto p-1 border-t border-white/20">
                                                                {challenges.map((challenge) => (
                                                                    <label key={challenge.id} className="flex items-center text-xs py-1 px-2 rounded hover:bg-white/10 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            checked={selectedChallenges.includes(challenge.id)}
                                                                            onChange={() => handleChallengeChange(challenge.id)}
                                                                        />
                                                                        {challenge.name}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Results - Dynamic based on filters */}
                                                <div className="w-2/3 bg-[#2b2b4b] rounded-md border border overflow-hidden p-2">
                                                    <div className="border border-white/20 rounded-md">
                                                        <div className="p-2 border-b border-white/20 ">
                                                            <div className="text-blue-300 font-medium text-xs">
                                                                {getResultsTitle()} ({filteredDocuments.length} documents)
                                                            </div>
                                                        </div>
                                                        <div className=" h-[270px] max-h-[calc(80vh-100px)] overflow-y-auto ">
                                                            {filteredDocuments.length > 0 ? (
                                                                filteredDocuments.map((doc) => (
                                                                    <div key={doc.id} className="flex items-center bg-[#2b2b4b] p-2 mx-2 my-1 bg-[#3b3b5b] border hover:bg-white/10 border-white/20 rounded-md cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="mr-2 h-3 w-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                            checked={selectedDocuments.includes(doc.id)}
                                                                            onChange={() => handleDocumentSelect(doc.id)}
                                                                        />
                                                                        <span className="text-xs">{doc.title}</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-center text-gray-400 text-xs p-4">No documents match your filters</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="px-4 py-1 bg-white/10 text-[13px] hover:bg-white/20 rounded-lg transition-colors"
                                onClick={() => setShowLibraryDropdown(false)}
                            >
                                Cancel
                            </button>

                            {currentStep > 1 && (
                                <button
                                    className="px-4 py-1 bg-gray-500 text-[13px] hover:bg-gray-600 rounded-lg transition-colors"
                                    onClick={handlePreviousStep}
                                >
                                    Previous
                                </button>
                            )}

                            {
                                currentStep < 3 ? (
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-[13px] text-white px-4 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={() => {
                                            if (currentStep === 1 && (!selectedDepartment || !selectedTemplate)) {
                                                ShowCustomToast('Select department and template', 'info', 2000);
                                                return;
                                            }
                                            handleNextStep();
                                        }}
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button className="bg-blue-600 hover:bg-blue-700 text-[13px] text-white px-4 py-1 rounded-md">
                                        Use Template
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Library Modal */}
            {showManageLibraryModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-[#2b2b4b] border w-[400px] rounded-lg shadow-2xl text-white px-6 py-5 ">
                        <h3 className="text-lg font-semibold mb-2 -mt-2">Add to Library</h3>
                        <hr className=' border-b -mx-6 mb-4 mt-2' />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#3b3b5b] border border-white/20 rounded-md p-2 text-sm"
                                    value={newDepartment}
                                    onChange={(e) => setNewDepartment(e.target.value)}
                                    placeholder="Enter department"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Template Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-[#3b3b5b] border border-white/20 rounded-md p-2 text-sm"
                                    value={newTemplate}
                                    onChange={(e) => setNewTemplate(e.target.value)}
                                    placeholder="Enter template name"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="px-4 py-1 bg-white/10 text-[13px] hover:bg-white/20 rounded-lg transition-colors"
                                onClick={() => setShowManageLibraryModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md"
                                onClick={handleAddToLibrary}
                                disabled={!newDepartment || !newTemplate}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptLibraryModal;