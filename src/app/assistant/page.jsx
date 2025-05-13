'use client';
import { getAllContext, sendChats } from '@/lib/services/chatServices';
import { appColors } from '@/lib/theme';
import React, { useEffect, useState } from 'react';
import { ShowCustomToast } from '../customComponents/CustomToastify';

const Assistant = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedDocTitles, setSelectedDocTitles] = useState([]);
    const [selectedPromptTitle, setSelectedPromptTitle] = useState('');
    const [isPersistentOpen, setIsPersistentOpen] = useState(true);
    const [isCustomerVoiceOpen, setIsCustomerVoiceOpen] = useState(true);
    const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
    const [showAddonsDropdown, setShowAddonsDropdown] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(true);
    const [showOptimizationDropdown, setShowOptimizationDropdown] = useState(false);
    const [optimizedQuery, setOptimizedQuery] = useState('');
    const [selectedAddOn, setSelectedAddOn] = useState(null);
    const [isPromptMode, setIsPromptMode] = useState(true);

    const tabs = [
        { id: 'uplode', label: '+' },
        { id: 'context', label: 'Context' },
        { id: 'library', label: `Library` },
        { id: 'business', label: 'Optimization' },
        { id: 'addons', label: '+ Add-Ons' },
    ];

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
        if (tabId === 'context') {
            setActiveTab('context');
            setShowContextDropdown(!showContextDropdown);
            setShowLibraryDropdown(false);
            setShowOptimizationDropdown(false);
            setShowAddonsDropdown(false);
            setSelectedAddOn(null);
        } else if (tabId === 'library') {
            setActiveTab('library');
            setShowLibraryDropdown(!showLibraryDropdown);
            setShowContextDropdown(false);
            setShowOptimizationDropdown(false);
            setShowAddonsDropdown(false);
            setSelectedAddOn(null);
        } else if (tabId === 'business') {
            if (!searchQuery.trim()) {
                ShowCustomToast('Please enter a query first', 'info', 2000);
                return;
            }
            setActiveTab('business');
            setShowOptimizationDropdown(!showOptimizationDropdown);
            setShowContextDropdown(false);
            setShowLibraryDropdown(false);
            setShowAddonsDropdown(false);
            generateOptimizedQuery(searchQuery);
            setSelectedAddOn(null);
        } else if (tabId === 'addons') {
            setActiveTab('addons');
            setShowAddonsDropdown(!showAddonsDropdown);
            setShowContextDropdown(false);
            setShowLibraryDropdown(false);
            setShowOptimizationDropdown(false);
            setSelectedAddOn(null);
        } else {
            setActiveTab(tabId);
            setShowContextDropdown(false);
            setShowLibraryDropdown(false);
            setShowOptimizationDropdown(false);
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

        // Your actual optimization logic here
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
            setShowContextDropdown(false);

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
            className={`h-full w-full flex flex-col -mt-20 ${hasSearched ? 'justify-end' : 'justify-center'} items-center`}
            style={{ backgroundColor: appColors.primaryColor }}
        >
            <div className="w-full max-w-5xl flex flex-col items-center text-center space-y-6 px-4">
                {!apiResponse && (
                    <h1 className="text-2xl font-bold mt-20 mb-4" style={{ color: appColors.textColor }}>
                        What can I help with?
                    </h1>
                )}

                {apiResponse && (
                    <div
                        className="w-full max-w-4xl text-left text-white mb-6 -mt-8 p-6 rounded-xl bg-white/5 overflow-y-auto"
                        style={{
                            maxHeight: '20vh',
                            minWidth: '100%',
                            scrollbarWidth: 'thin',
                            scrollbarColor: `${appColors.textColor} transparent`
                        }}
                    >
                        <div className="response-content">
                            <p className="mb-4 text-lg">{apiResponse.data.response}</p>

                            {/* {apiResponse.data.sources && apiResponse.data.sources.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium mb-3 text-blue-300">Sources:</h3>
                                    <ul className="space-y-3">
                                        {apiResponse.data.sources.map((source, index) => (
                                            <li key={index} className="text-sm text-white/80 border-b border-white/10 pb-2">
                                                <span className="font-medium">{source.title}</span>
                                                <span className="ml-2 text-blue-300">(Relevance: {(source.relevance_score * 100).toFixed(1)}%)</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )} */}
                        </div>
                    </div>
                )}

                <div className="relative w-full max-w-3xl ">
                    <div className="flex items-center w-full ">
                        {(selectedDocTitles.length > 0 || selectedPromptTitle) && (
                            <div className="flex gap-2 mb-2 overflow-x-auto whitespace-nowrap max-w-full pr-4 absolute -top-8 left-0 no-scrollbar">
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
                        )}
                        <input
                            type="text"
                            placeholder="Ask anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-4 pr-36 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ backgroundColor: appColors.primaryColor }}
                            onKeyDown={(e) => e.key === 'Enter' && isSubmitEnabled && handleSubmit()}
                        />
                    </div>

                    {/* Prompt Template Select */}

                    {/* <div className="absolute right-28 top-3.5 -mt-[1px] w-40">
                        <select
                            onChange={handlePromptSelect}
                            value={selectedPromptTitle || ''}
                            className="w-full text-xs bg-white/10 text-white rounded-full px-2 py-2 focus:outline-none"
                        >
                            <option value="">Prompt Template</option>
                            {prompts.map((prompt) => (
                                <option key={prompt.prompt_id} value={prompt.name}>
                                    {prompt.name}
                                </option>
                            ))}
                        </select>
                    </div> */}


                    {/* Toggle Switch */}
                    <div className="absolute right-14 top-4 group cursor-pointer" onClick={() => setIsPromptMode((prev) => !prev)}>
                        <div
                            className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${isPromptMode ? 'bg-blue-600' : 'bg-gray-500'}`}
                        >
                            <div
                                className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isPromptMode ? 'translate-x-4' : 'translate-x-0'}`}
                            ></div>
                        </div>

                        {/* Tooltip on hover */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Randomness
                        </div>
                    </div>

                    {/* Submit Button */}

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !isSubmitEnabled}
                        className="absolute right-2 top-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50"
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

                <div className="flex flex-wrap justify-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center ${(tab.id === 'context' && showContextDropdown) ||
                                (tab.id === 'library' && showLibraryDropdown) ||
                                (tab.id === 'business' && showOptimizationDropdown) ||
                                (tab.id === 'addons' && (showAddonsDropdown || selectedAddOn)) ||
                                (activeTab === tab.id && !['context', 'library', 'business', 'addons'].includes(tab.id))
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                            {(tab.id === 'context' || tab.id === 'library' || tab.id === 'business' || tab.id === 'addons') && (
                                <span className="ml-1 text-xs">
                                    {(tab.id === 'context' && showContextDropdown) ||
                                        (tab.id === 'library' && showLibraryDropdown) ||
                                        (tab.id === 'addons' && (showAddonsDropdown || selectedAddOn)) ||
                                        (tab.id === 'business' && showOptimizationDropdown) ? '▼' : '▶'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Context Modal */}
                {showContextDropdown && (
                    <div
                        className="w-full max-w-3xl !mt-2 text-left text-white overflow-y-auto rounded-xl shadow-lg backdrop-blur bg-[rgba(255,255,255,0.05)] border border-white/10"
                        style={{
                            maxHeight: '350px',
                            marginLeft: '40%'
                        }}
                    >
                        {isLoading ? (
                            <div className="text-center py-8 text-white/80 text-base">Loading documents...</div>
                        ) : (
                            <>
                                <div className="mb-6 px-6 pt-4 ">
                                    <div
                                        className="flex items-center mb-3 cursor-pointer"
                                        onClick={() => setIsPersistentOpen(!isPersistentOpen)}
                                    >
                                        <span className=" text-blue-700">
                                            {isPersistentOpen ? '▼' : '▶'}
                                        </span>
                                        <h3 className="font-semibold ml-2 text-lg text-blue-500">Persistent Context</h3>
                                        <span className="ml-2 text-xs bg-blue-500 text-white-700 px-2 py-1 rounded-full">
                                            {persistentDocuments.length} documents
                                        </span>

                                    </div>

                                    {isPersistentOpen && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {persistentDocuments.length > 0 ? (
                                                persistentDocuments.map((doc) => (
                                                    <div
                                                        key={doc.doc_id}
                                                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                                                        onClick={() => handleDocSelect(doc.doc_id, doc.title)}
                                                    >
                                                        <svg
                                                            className="flex-shrink-0"
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 48 48"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <g transform="translate(10, 10)" fill="green" fillOpacity="0.8">
                                                                <rect y="0" width="34" height="4" rx="1" />
                                                                <rect y="6" width="34" height="4" rx="1" />
                                                                <rect y="12" width="34" height="4" rx="1" />
                                                                <rect y="18" width="34" height="4" rx="1" />
                                                                <rect y="24" width="34" height="4" rx="1" />
                                                                <rect y="30" width="34" height="4" rx="1" />
                                                            </g>
                                                        </svg>
                                                        <span className="text-sm text-white/90">{doc.title}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-gray-400 text-sm">No documents in Persistent Context</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Voice-of-the-Customer */}
                                <div className="px-6 pb-4">
                                    <div
                                        className="flex items-center mb-3 cursor-pointer"
                                        onClick={() => setIsCustomerVoiceOpen(!isCustomerVoiceOpen)}
                                    >
                                        <span className="text-blue-700">
                                            {isCustomerVoiceOpen ? '▼' : '▶'}
                                        </span>
                                        <h3 className="font-semibold ml-2 text-lg text-blue-500">Voice-of-the-Customer</h3>
                                        <span className="ml-2 text-xs bg-blue-500 text-white-700 px-2 py-1 rounded-full">
                                            {customerVoiceDocuments.length} documents
                                        </span>

                                    </div>

                                    {isCustomerVoiceOpen && (
                                        <div className="grid grid-cols-1 gap-2">
                                            {customerVoiceDocuments.length > 0 ? (
                                                customerVoiceDocuments.map((doc) => (
                                                    <div
                                                        key={doc.doc_id}
                                                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                                                        onClick={() => handleDocSelect(doc.doc_id, doc.title)}
                                                    >
                                                        <svg
                                                            className="flex-shrink-0"
                                                            width="24"
                                                            height="24"
                                                            viewBox="0 0 48 48"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <g transform="translate(10, 10)" fill="blue" fillOpacity="0.8">
                                                                <rect y="0" width="34" height="4" rx="1" />
                                                                <rect y="6" width="34" height="4" rx="1" />
                                                                <rect y="12" width="34" height="4" rx="1" />
                                                                <rect y="18" width="34" height="4" rx="1" />
                                                                <rect y="24" width="34" height="4" rx="1" />
                                                                <rect y="30" width="34" height="4" rx="1" />
                                                            </g>
                                                        </svg>
                                                        <span className="text-sm text-white/90">{doc.title}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-gray-400 text-sm">No documents in Voice-of-the-Customer</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </>
                        )}
                    </div>
                )}

                {/* Library Modal */}
                <div className="relative ml-[8%] -top-6 w-[220px]">
                    {/* <div
                        onClick={() => setShowLibraryDropdown((prev) => !prev)}
                        className="text-xs bg-white/10 text-white rounded-full px-3 py-2 min-w-[150px] cursor-pointer hover:bg-white/20 transition"
                    >
                        {selectedPromptTitle}
                    </div> */}

                    {showLibraryDropdown && (
                        <div className="ml-[15%] w-[220px] !mt-[8px] text-left text-white overflow-hidden rounded-md border border-white/20 bg-[rgba(255,255,255,0.05)]">
                            <div className="flex flex-col divide-y divide-white/10">
                                {prompts.map((prompt) => (
                                    <div
                                        key={prompt.prompt_id}
                                        onClick={() => {
                                            handlePromptSelect({ target: { value: prompt.name } });
                                            setShowLibraryDropdown(false);
                                        }}
                                        className="px-4 py-2 hover:bg-white/10 cursor-pointer text-sm transition-colors"
                                    >
                                        {prompt.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Prompt optimization */}
                {showOptimizationDropdown && (
                    <div className="ml-[66%] w-full max-w-[600px] !mt-[-15px] text-left text-white overflow-y-auto rounded-xl shadow-lg backdrop-blur bg-[rgba(255,255,255,0.05)] border border-white/10 p-4">
                        <h2 className="text-lg font-bold mb-3">Prompt Optimization</h2>

                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-1">Original Query:</h3>
                            <div className="bg-white/5 p-3 rounded-lg mb-3 text-sm">
                                <p>{searchQuery}</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-1">Optimized Query:</h3>
                            <textarea
                                value={optimizedQuery}
                                onChange={(e) => setOptimizedQuery(e.target.value)}
                                className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                                onClick={() => {
                                    setSearchQuery(optimizedQuery);
                                    setShowOptimizationDropdown(false);
                                }}
                            >
                                Use
                            </button>
                            <button
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                                onClick={() => {
                                    setOptimizedQuery(searchQuery);
                                    setShowOptimizationDropdown(false);
                                }}
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                )}

                {/* Add-Ons Modal */}
                {showAddonsDropdown && (
                    <div className="ml-[69%] w-[220px] !mt-[-15px] text-left text-white overflow-hidden rounded-md border border-white/20 bg-[rgba(255,255,255,0.05)]">
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

                {selectedAddOn && (
                    <div className="ml-[85%] p-6 w-[500px] !mt-[-15px] text-left text-white overflow-hidden rounded-md border border-white/20 bg-[#2b2b4b]  relative">
                        <button
                            onClick={() => setSelectedAddOn(null)}
                            className="absolute top-2 right-4 text-white text-xl"
                        >
                            &times;
                        </button>

                        <div className="flex flex-col">
                            <h2 className="text-xl font-semibold text-center mb-2 -mt-3">Optional Add-Ons</h2>
                            {/* Industry */}
                            {selectedAddOn === 'Industry' && (
                                <div>
                                    <label className="block font-large mb-4 text-md text-left border-b">Industry:</label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {['Technology', 'Healthcare', 'Finance', 'Retail', 'Other'].map((item) => (
                                            <label key={item} className="flex items-center space-x-2">
                                                <input type="checkbox" value={item.toLowerCase()} />
                                                <span className='text-sm'>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom industry..."
                                        className="w-full px-3 py-2  text-white bg-[#2b2b4b] border border-white/20 rounded-md mt-2"
                                    />
                                </div>
                            )}

                            {/* Audience */}
                            {selectedAddOn === 'Audience' && (
                                <div>
                                    <label className="block font-large mb-4 text-md text-left border-b">Audience:</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto mb-2">
                                        {[
                                            'C-Suite', 'Sales', 'Marketing', 'IT', 'Operations',
                                            'Finance', 'Customer Support', 'Prospect', 'Customer', 'Thought Leader'
                                        ].map((aud) => (
                                            <label key={aud} className="flex items-center space-x-2">
                                                <input type="checkbox" value={aud.toLowerCase().replace(/ /g, '-')} />
                                                <span className='text-sm' >{aud}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience..."
                                        className="w-full px-3 py-2 bg-[#2b2b4b] border border-white/20 text-white rounded-md mt-2"
                                    />
                                </div>
                            )}

                            {/* Tone */}
                            {selectedAddOn === 'Tone' && (
                                <div>
                                    <label className="block font-large mb-4 text-md text-left border-b">Tone:</label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {['Professional', 'Casual', 'Friendly', 'Formal', 'Technical'].map((tone) => (
                                            <label key={tone} className="flex items-center space-x-2">
                                                <input type="checkbox" value={tone.toLowerCase()} />
                                                <span className='text-sm'>{tone}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Objective */}
                            {selectedAddOn === 'Objective' && (
                                <div>
                                    <label className="block font-large mb-4 text-md text-left border-b">Objective:</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your objective..."
                                        className="w-full px-3 py-2 bg-[#2b2b4b] border border-white/20 text-white border border-white/20 rounded-md"
                                    />
                                </div>
                            )}

                            {/* Dos & Don'ts */}
                            {selectedAddOn === `Dos & Don'ts` && (
                                <div>
                                    <label className="block font-large mb-4 text-md text-left border-b">Dos & Don'ts:</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">Dos</h4>
                                            <textarea
                                                placeholder="Enter dos..."
                                                className="w-full px-3 py-2 bg-[#2b2b4b] text-white border border-white/20 rounded-md h-24"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Don'ts</h4>
                                            <textarea
                                                placeholder="Enter don'ts..."
                                                className="w-full px-3 py-2 bg-[#2b2b4b] text-white border border-white/20 rounded-md h-24"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save and Cancel Buttons */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setSelectedAddOn(null)}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        // You can add form save logic here
                                        setSelectedAddOn(null);
                                    }}
                                    className="px-3 py-1.5 rounded-lg transition-colors text-sm bg-blue-600 hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Assistant;