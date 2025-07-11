import { appColors } from '@/lib/theme';
import { useState, useEffect } from 'react';

const ContextModal = ({ showContextModal, setShowContextModal }) => {
    // State for Context Modals
    const [contentTypeOpen, setContentTypeOpen] = useState(true);
    const [challengesOpen, setChallengesOpen] = useState(true);
    const [selectedContentTypes, setSelectedContentTypes] = useState([]);
    const [selectedChallenges, setSelectedChallenges] = useState([]);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [searchMethod, setSearchMethod] = useState('ai'); // 'ai' or 'manual'
    const [hasSearchedAISearch, setHasSearchedAISearch] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const isSubmitEnabled = searchQuery.trim()

    // Dummy data for manual search
    const contentTypes = [
        { id: 'summary', name: 'Summary Video', },
        { id: 'full', name: 'Full Episode', },
        { id: 'highlights', name: 'Highlights Video', },
        { id: 'case', name: 'Case Study', },
        { id: 'advice', name: 'ICP Advice', },
        { id: 'post', name: 'Post-Podcast Video', },
        { id: 'intro', name: 'Guest Introduction', }
    ];

    const challenges = [
        { id: 'ch1', name: 'Customer Retention' },
        { id: 'ch2', name: 'Agent Productivity' },
        { id: 'ch3', name: 'Cost Reduction' },
        { id: 'ch4', name: 'Technology Integration' }
    ];

    const contactDocuments = [
        { id: 'doc1', title: 'POV: Contact Centers as an Investable Value Engine' },
        { id: 'doc2', title: 'We Know That We Need to Know What We Don\'t Know' },
        { id: 'doc3', title: 'Contact Center Agents\' Perspective on AI' },

    ];

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

    const handleDocumentSelect = (docId) => {
        setSelectedDocuments(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    // Dynamic title for results
    const getResultsTitle = () => {
        if (selectedContentTypes.length > 0 || selectedChallenges.length > 0) {
            return "Filtered Documents";
        }
        return "Context Documents";
    };

    // Filtered documents based on selections
    const [filteredDocuments, setFilteredDocuments] = useState(contactDocuments);

    useEffect(() => {
        let results = contactDocuments;

        if (selectedContentTypes.length > 0) {
            results = results?.filter(doc =>
                selectedContentTypes?.includes(doc.contentTypeId)
            );
        }

        if (selectedChallenges.length > 0) {
            results = results.filter(doc =>
                doc.challenges?.some(ch => selectedChallenges.includes(ch))
            );
        }

        // Only update state if results actually changed
        if (JSON.stringify(results) !== JSON.stringify(filteredDocuments)) {
            setFilteredDocuments(results);
        }
    }, [selectedContentTypes, selectedChallenges, contactDocuments]);
    const handleSubmitAISearch = () => {
        if (!searchQuery || isLoading) return;
        setHasSearchedAISearch(true); // simulate response
        // Simulate fake search results
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
    return (
        <>
            {showContextModal && (
                <div className="fixed inset-0  flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                    <div className=" border  w-[800px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl text-white px-6 py-5 relative font-sans" style={{ backgroundColor: appColors.primaryColor }}>

                        {/* Step Indicator */}
                        <div className="flex flex-col items-center mb-2 -mt-2">
                            {/* Step circles + line */}
                            <div className="flex items-center justify-center space-x-4">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2  ${searchMethod === 'ai' ? 'bg-blue-500 text-white border-blue-300' : 'bg-blue-500 text-white border-blue-300'}`}
                                    >
                                        1
                                    </div>
                                </div>

                                {/* Connecting line */}
                                {/* <div
                                    className={`w-12 h-[1px] ${searchMethod === 'manual' ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}
                                ></div> */}

                                {/* Step 2 */}
                                {/* <div className="flex flex-col items-center">
                                    <div
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold border-2  ${searchMethod === 'manual' ? 'bg-blue-500 text-white border-blue-300' : 'bg-white text-black border-gray-400'}`}
                                    >
                                        2
                                    </div>
                                </div> */}
                            </div>

                            {/* Step labels */}
                            <div className="flex justify-center w-40 text-xs font-semibold text-white">
                                {[1].map((step) => (
                                    <span key={step} className="text-center text-[10px] ">Step {step}</span>
                                ))}
                            </div>
                        </div>


                        {/* Divider */}
                        <div className="border-t  my-2 -mx-6"></div>

                        {/* Title */}
                        <h2 className="text-xl font-semibold text-center mb-3 ">Context</h2>
                        <div className="border-t  my-2 -mx-6"></div>

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
                        <div className=" flex justify-center">
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
                                                    style={{ backgroundColor: appColors.primaryColor }}
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
                                            <div className=" border border-white/20 rounded-md overflow-hidden">
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
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Challenges Filter */}
                                            <div className=" border border-white/20 rounded-md overflow-hidden">
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
                                        <div className="w-2/3  rounded-md border border overflow-hidden p-2">
                                            <div className="border border-white/20 rounded-md">
                                                <div className="p-2 border-b border-white/20 ">
                                                    <div className="text-blue-300 font-medium text-xs">
                                                        {getResultsTitle()} ({filteredDocuments.length} documents)
                                                    </div>
                                                </div>
                                                <div className=" h-[270px] max-h-[calc(80vh-100px)] overflow-y-auto ">
                                                    {filteredDocuments.length > 0 ? (
                                                        filteredDocuments.map((doc) => (
                                                            <div key={doc.id} className="flex items-center  p-2 mx-2 my-1 bg-[#3b3b5b] border hover:bg-white/10 border-white/20 rounded-md cursor-pointer">
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
                        {/* Footer */}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="px-4 py-1 bg-white/10 text-[13px] hover:bg-white/20 rounded-lg transition-colors"
                                onClick={() => setShowContextModal(false)}
                            >
                                Cancel
                            </button>
                            <button className="bg-blue-600 hover:bg-blue-700 text-[13px] text-white px-4 py-1 rounded-md">
                                Use Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ContextModal;