'use client';
import { getAllContext, sendChats } from '@/lib/services/chatServices';
import { appColors } from '@/lib/theme';
import React, { useEffect, useState, useRef } from 'react';
import { ShowCustomToast } from '../customComponents/CustomToastify';
import PromptLibraryModal from '../customComponents/PromptLibraryModal';
import ContextModal from '../customComponents/ContextModal';

const Assistant = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedDocTitles, setSelectedDocTitles] = useState([]);
    const [selectedPromptTitle, setSelectedPromptTitle] = useState('');
    const [isPersistentOpen, setIsPersistentOpen] = useState(false);
    const [isCustomerVoiceOpen, setIsCustomerVoiceOpen] = useState(false);
    const [optimizedQuery, setOptimizedQuery] = useState('');
    const [selectedAddOn, setSelectedAddOn] = useState(null);
    const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
    const [showAddonsDropdown, setShowAddonsDropdown] = useState(false);
    const [isPromptMode, setIsPromptMode] = useState(true);
    const [chatHistory, setChatHistory] = useState([]);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showOptimizationModal, setShowOptimizationModal] = useState(false);
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [hoveredTab, setHoveredTab] = useState(null);


    const chatContainerRef = useRef(null);
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    // Load chat history from localStorage on component mount
    useEffect(() => {
        const savedChats = localStorage.getItem('chatHistory');
        if (savedChats) {
            setChatHistory(JSON.parse(savedChats));
        }
    }, []);

    const tabs = [
        { id: 'uplode', label: '+' },
        { id: 'context', label: 'Context' },
        { id: 'library', label: `Library` },
        { id: 'business', label: 'Optimization' },
        { id: 'addons', label: '+ Add-Ons' },
    ];

    // Tab hover messages
    const tabMessages = {
        context: [
            "Add relevant documents to improve response quality",
            "Context helps the AI understand your business better",
            "Select documents that match your query topic"
        ],
        library: [
            "Choose from pre-built prompts for common tasks",
            "Templates help you get started quickly",
            "Save time with our curated prompt library"
        ],
        business: [
            "Optimize your query for better results",
            "Get suggestions to improve your prompt",
            "Professionalize your query with one click"
        ],
        addons: [
            "Add specific parameters to refine your results",
            "Customize the AI's output with add-ons",
            "Fine-tune the response with additional context"
        ],
        uplode: [
            "Upload new documents to expand your knowledge base",
            "Add fresh content for the AI to reference",
            "Keep your context up-to-date with new files"
        ]
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const userId = localStorage.getItem('current_user_id');
                const companyId = localStorage.getItem('company_id');
                const limit = 20;

                const response = await getAllContext(userId, companyId, limit);
                const docs = response?.documents ?? response?.data?.documents;
                const extractedPrompts = response?.prompts ?? response?.data?.prompts;

                if (Array.isArray(docs)) {
                    setDocuments(docs);
                } else {
                    console.log('Unexpected response structure:', response);
                    setDocuments([]);
                }
                if (Array.isArray(extractedPrompts)) {
                    setPrompts(extractedPrompts);
                }
            } catch (error) {
                console.log('Failed to fetch context:', error);
                setDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);

        if (tabId === 'context') {
            setShowContextModal(true);
            setHasSearched(true)
        } else if (tabId === 'business') {
            if (!searchQuery.trim()) {
                ShowCustomToast('Please enter a query first', 'info', 2000);
                return;
            }
            generateOptimizedQuery(searchQuery);
            setShowOptimizationModal(true);
            setHasSearched(true)
        } else if (tabId === 'addons') {
            setShowAddonsModal(true);
            setHasSearched(true)
        } else if (tabId === 'library') {
            setActiveTab('library');
            setShowLibraryDropdown(!showLibraryDropdown);
            setHasSearched(true)
            setShowAddonsDropdown(false);
            setSelectedAddOn(null);
        }

    };

    const handleDocSelect = (docId, docTitle) => {
        setSelectedDocs(prev => {
            if (prev.includes(docId)) {
                return prev.filter(id => id !== docId);
            } else {
                return [...prev, docId];
            }
        });

        setSelectedDocTitles(prev => {
            if (prev.some(doc => doc.id === docId)) {
                return prev.filter(doc => doc.id !== docId);
            } else {
                return [...prev, { id: docId, title: docTitle }];
            }
        });
    };

    const handlePromptSelect = (e) => {
        const selectedPrompt = prompts.find(p => p.name === e.target.value);
        if (selectedPrompt) {
            setSelectedPromptId(selectedPrompt.prompt_id);
            setSelectedPromptTitle(selectedPrompt.name);
        } else {
            setSelectedPromptId(null);
            setSelectedPromptTitle('');
        }
    };

    const generateOptimizedQuery = (query) => {
        if (!query.trim()) {
            setOptimizedQuery('');
            return;
        }

        const optimized = `${query}\n\n` +
            `1. More specific target audience\n` +
            `2. Clear structure with sections\n` +
            `3. Actionable recommendations\n` +
            `4. Professional tone for business context`;

        setOptimizedQuery(optimized);
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setHasSearched(true);

            const userId = localStorage.getItem('current_user_id');
            const companyId = localStorage.getItem('company_id');

            const response = await sendChats(
                userId,
                companyId,
                'msg123',
                selectedDocs,
                selectedPromptId,
                searchQuery,
                'msg123'
            );

            setApiResponse(response);

            // Update chat history
            const newChat = {
                userMessage: searchQuery,
                aiResponse: response.data.response,
                timestamp: new Date().toISOString()
            };

            const updatedHistory = [...chatHistory, newChat];
            setChatHistory(updatedHistory);
            localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
            setSearchQuery('');
        } catch (error) {
            ShowCustomToast('Something went wrong, Please try again', 'info', 2000);
            console.log('Error sending chat:', error);
        } finally {
            setIsLoading(false);
        }
    };




    // Group documents by layer
    const persistentDocuments = documents.filter(doc => doc?.tags?.includes('layer_1'));
    const customerVoiceDocuments = documents.filter(doc => doc?.tags?.includes('layer_2'));

    // Check if submit should be enabled
    const isSubmitEnabled = searchQuery.trim() || selectedDocs.length > 0 || selectedPromptId;

    return (
        <div
            className="w-full flex flex-col items-center"
            style={{
                backgroundColor: appColors.primaryColor,
                minHeight: '90%'
            }}
        >

            <div className={`w-full flex-1 flex flex-col ${hasSearched ? 'justify-end' : 'justify-center'} items-center`}>
                {/* Chat history container with scroll */}
                <div
                    ref={chatContainerRef}
                    className="w-full max-w-4xl mb-4 mt-4 overflow-y-auto no-scrollbar"
                    style={{ maxHeight: '65vh' }}>
                    {chatHistory.length > 0 ? (
                        chatHistory.map((chat, index) => (
                            <div key={index} className="w-full space-y-4 mb-6">
                                {/* User message - aligned to right */}
                                <div className="flex justify-end">
                                    <div className="bg-white/10 text-white rounded-lg px-4 py-2 max-w-3xl break-words overflow-hidden">
                                        <pre className="whitespace-pre-wrap font-sans text-wrap break-all">
                                            {chat.userMessage}
                                        </pre>
                                    </div>
                                </div>

                                {/* AI response - aligned to left */}
                                <div className="flex justify-start">
                                    <div className="text-white rounded-lg px-4 py-2 max-w-3xl w-full break-words overflow-hidden">
                                        <pre className="whitespace-pre-wrap font-sans text-wrap break-all">
                                            {chat.aiResponse}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <h1 className="text-2xl font-bold" style={{ color: appColors.textColor }}>
                                What can I help with?
                            </h1>
                        </div>
                    )}
                </div>

                {/* Input area - fixed at bottom */}
                <div className="w-full max-w-4xl sticky  bottom-4 bg-transparent pt-4">
                    {selectedDocTitles.length > 0 || selectedPromptTitle ? (
                        <div className="flex gap-2 mb-2 overflow-x-auto whitespace-nowrap max-w-full pr-4 no-scrollbar">
                            {selectedPromptTitle && (
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex items-center">
                                    {selectedPromptTitle}
                                    <button
                                        onClick={() => {
                                            setSelectedPromptId(null);
                                            setSelectedPromptTitle('');
                                            setSearchQuery('');
                                        }}
                                        className="ml-1 text-blue-100 hover:text-white"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {selectedDocTitles.map((doc, index) => (
                                <span
                                    key={index}
                                    className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full flex items-center"
                                >
                                    {doc.title}
                                    <button
                                        onClick={() => handleDocSelect(doc.id, doc.title)}
                                        className="ml-1 text-blue-100 hover:text-white"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : null}

                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Ask anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pt-3 pb-3 p-4 pr-36 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ backgroundColor: appColors.primaryColor }}
                            onKeyDown={(e) => e.key === 'Enter' && isSubmitEnabled && handleSubmit()}
                        />

                        {/* Toggle Switch */}
                        <div className="absolute right-14 top-3.5 group cursor-pointer" onClick={() => setIsPromptMode((prev) => !prev)}>
                            <div
                                className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${isPromptMode ? 'bg-blue-600' : 'bg-gray-500'}`}
                            >
                                <div
                                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isPromptMode ? 'translate-x-4' : 'translate-x-0'}`}
                                ></div>
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Randomness
                            </div>
                        </div>
                        <div className="relative group">
                            {/* Tooltip */}
                            {!searchQuery && (
                                <div className="absolute  -top-0 -right-14 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Please input text
                                </div>
                            )}
                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !isSubmitEnabled || !searchQuery}
                                className="absolute right-2 -top-[43px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs with hover tooltips */}
                <div className="flex mt-4 flex-wrap justify-center gap-2">
                    {tabs.map((tab) => (
                        <div
                            key={tab.id}
                            className="relative"
                            onMouseEnter={() => setHoveredTab(tab.id)}
                            onMouseLeave={() => setHoveredTab(null)}
                        >
                            {/* Tab button */}
                            <button
                                onClick={() => handleTabClick(tab.id)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-white hover:bg-white/10'
                                    }`}
                            >
                                {tab.label}
                            </button>

                            {/* Tooltip/modal */}
                            {hoveredTab === tab.id && tabMessages[tab.id] && (
                                <div className="absolute left-1/3 bottom-12 transform translate-x-1/10 mt-0.5 w-64 z-10">
                                    {/* Tooltip box with no margin gap */}
                                    <div
                                        className="bg-[#3b3b5b] text-white text-sm p-3 rounded-lg shadow-lg "
                                    >
                                        <p className="mb-2">
                                            {tabMessages[tab.id][Math.floor(Math.random() * tabMessages[tab.id].length)]}
                                        </p>
                                        <a
                                            href="#"
                                            className="text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center justify-end"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleTabClick(tab.id);
                                            }}
                                        >
                                            Learn More →
                                        </a>
                                    </div>
                                    {/* Tooltip arrow */}
                                    <div className="absolute -bottom-[9px] left-6 w-6 h-6 transform rotate-45 bg-[#3b3b5b] z-0"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Context Modal */}
                <ContextModal
                    showContextModal={showContextModal}
                    setShowContextModal={setShowContextModal}
                />
                {/* Library Modal */}
                < PromptLibraryModal
                    showLibraryDropdown={showLibraryDropdown}
                    setShowLibraryDropdown={setShowLibraryDropdown}
                />
                {/* Optimization Modal */}
                {showOptimizationModal && (
                    <div className="fixed inset-0  flex items-center justify-center bg-gray-600 bg-opacity-50 z-50" >
                        <div className=" border rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4 ">
                                <h2 className="text-xl font-bold -mt-4 ">Prompt Optimization</h2>
                                <button
                                    onClick={() => setShowOptimizationModal(false)}
                                    className="text-white -mt-4 hover:text-gray-300 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <hr className='-mx-6 -mt-2' />

                            <div className="mb-4">
                                <h3 className="text-sm font-medium mb-1 mt-4">Original Query:</h3>
                                <div className="bg-white/5 p-3 rounded-lg mb-3 text-sm">
                                    <p>{searchQuery}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm font-medium mb-1">Optimized Query:</h3>
                                <textarea
                                    value={optimizedQuery}
                                    onChange={(e) => setOptimizedQuery(e.target.value)}
                                    className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px]"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                    onClick={() => {
                                        setOptimizedQuery(searchQuery);
                                        setShowOptimizationModal(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    onClick={() => {
                                        setSearchQuery(optimizedQuery);
                                        setShowOptimizationModal(false);
                                    }}
                                >
                                    Use Optimized Query
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add-Ons Modal */}
                {showAddonsDropdown && (
                    <div className="ml-[42%] mb-4 w-[220px] !mt-[-8px] text-left text-white overflow-hidden rounded-md border border-white/20 bg-[rgba(255,255,255,0.05)]">
                        <div className="flex flex-col divide-y divide-white/10">
                            {['Industry', 'Audience', 'Tone', 'Objective', `Dos & Don'ts`].map((label, idx) => (
                                <div
                                    key={idx}
                                    className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm text-white transition-colors"
                                    onClick={() => {
                                        setSelectedAddOn(label);
                                        setShowAddonsDropdown(false);
                                    }}                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* Add-Ons Modal Details */}
                {showAddonsModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="bg-[#2b2b4b] border rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold -mt-2">Optional Add-Ons</h2>
                                <button
                                    onClick={() => setShowAddonsModal(false)}
                                    className="text-white -mt-3 hover:text-gray-300 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <hr className='-mx-6 -mt-2' />
                            <div className="space-y-6 mt-4">
                                {/* Industry */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Industry:</label>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {['Technology', 'Healthcare', 'Finance', 'Retail', 'Other'].map((item) => (
                                            <label key={item} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    value={item.toLowerCase()}
                                                    className="w-5 h-5"
                                                />
                                                <span>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom industry..."
                                        className="w-full px-4 py-2 text-white bg-[#3b3b5b] border border-white/20 rounded-md"
                                    />
                                </div>

                                {/* Audience */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience:</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-3">
                                        {[
                                            'C-Suite', 'Sales', 'Marketing', 'IT', 'Operations',
                                            'Finance', 'Customer Support', 'Prospect', 'Customer', 'Thought Leader'
                                        ].map((aud) => (
                                            <label key={aud} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    value={aud.toLowerCase().replace(/ /g, '-')}
                                                    className="w-5 h-5"
                                                />
                                                <span>{aud}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience..."
                                        className="w-full px-4 py-2 bg-[#3b3b5b] border border-white/20 text-white rounded-md"
                                    />
                                </div>

                                {/* Tone */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Tone:</label>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {['Professional', 'Casual', 'Friendly', 'Formal', 'Technical'].map((tone) => (
                                            <label key={tone} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    value={tone.toLowerCase()}
                                                    className="w-5 h-5"
                                                />
                                                <span>{tone}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Objective */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Objective:</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your objective..."
                                        className="w-full px-4 py-2 bg-[#3b3b5b] border border-white/20 text-white rounded-md"
                                    />
                                </div>

                                {/* Dos & Don'ts */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Dos & Don'ts:</label>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-2">Dos</h4>
                                            <textarea
                                                placeholder="Enter dos..."
                                                className="w-full px-4 py-2 bg-[#3b3b5b] text-white border border-white/20 rounded-md h-32"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Don'ts</h4>
                                            <textarea
                                                placeholder="Enter don'ts..."
                                                className="w-full px-4 py-2 bg-[#3b3b5b] text-white border border-white/20 rounded-md h-32"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddonsModal(false)}
                                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // You can add form save logic here
                                        setShowAddonsModal(false);
                                    }}
                                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Apply Add-Ons
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Left Footer */}
            <div className="fixed bottom-0 left-0 flex items-center gap-3 py-4 px-6">
                <img
                    src="/ai-navigator-logo.png"
                    alt="Logo"
                    className="w-30 h-6 object-contain"
                />
            </div>
        </div>
    );
};

export default Assistant;