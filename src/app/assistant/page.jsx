'use client';
import { getAllContext } from '@/lib/services/chatServices';
import { appColors } from '@/lib/theme';
import React, { useEffect, useState } from 'react';

const Assistant = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResult, setSearchResult] = useState('');
    const [documents, setDocuments] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [showContextDropdown, setShowContextDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const tabs = [
        { id: 'persistent', label: 'Context' },
        { id: 'customer', label: 'Library' },
        { id: 'business', label: 'Optimization' },
        { id: 'Add-ons', label: 'Add-ons' },
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
                    console.error('Unexpected response structure:', response);
                    setDocuments([]);
                }
                if (Array.isArray(extractedPrompts)) {
                    setPrompts(extractedPrompts);
                }
            } catch (error) {
                console.error('Failed to fetch context:', error);
                setDocuments([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'persistent') {
            setShowContextDropdown(!showContextDropdown);
        } else {
            setShowContextDropdown(false);
        }
    };
    useEffect(() => {
        if (!showContextDropdown) {
            setActiveTab(null); // or a default tab like 'all' if needed
        }
    }, [showContextDropdown]);

    // Group documents by layer - now checking for tags array properly
    const layer1Documents = documents.filter(doc => doc?.tags?.includes('layer_1'));
    const layer2Documents = documents.filter(doc => doc?.tags?.includes('layer_2'));
    return (
        <div
            className={`h-full w-full flex flex-col -mt-20 ${hasSearched ? 'justify-end' : 'justify-center'
                } items-center`}
            style={{ backgroundColor: appColors.primaryColor }}
        >
            <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-6">
                <h1 className="text-2xl font-bold" style={{ color: appColors.textColor }}>
                    What can I help with?
                </h1>
                {hasSearched && (
                    <div className="w-full max-w-2xl text-left text-white mb-6">
                        <h2 className="text-xl font-semibold">Search Result</h2>
                        <p>{searchResult}</p>
                    </div>
                )}

                <div className="relative w-[150%]">
                    <input
                        type="text"
                        placeholder="Ask anything"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 pr-40 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: appColors.primaryColor }}
                    />

                    {/* Dropdown inside input, right-aligned but left of send button */}
                    <div className="absolute right-14 top-3.5 -mt-[1px] w-40">
                        <select
                            onChange={(e) => {
                                const selectedPrompt = prompts.find(p => p.name === e.target.value);
                                if (selectedPrompt) setSearchQuery(selectedPrompt.name);
                            }}
                            className="w-full text-xs bg-white/10 text-white rounded-full px-2 py-2 focus:outline-none"
                        >
                            <option value="">Prompt Template</option>
                            {prompts.map((prompt) => (
                                <option key={prompt.prompt_id} value={prompt.name}>
                                    {prompt.name}
                                </option>
                            ))}
                        </select>
                    </div>


                    {/* Send Button */}
                    <button
                        onClick={() => {
                            setHasSearched(true);
                            setSearchResult(`Result for "${searchQuery}"`);
                        }}
                        className="absolute right-2 top-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    >
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
                    </button>
                </div>


                <div className="flex flex-wrap justify-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Context Dropdown */}
                {showContextDropdown && (
                    <div
                        className="w-full max-w-2xl mt-4 text-left text-white overflow-y-auto rounded-xl shadow-lg backdrop-blur bg-[rgba(255,255,255,0.05)] border border-white/10"
                        style={{ maxHeight: '350px', minWidth:'1000px' }}
                    >
                        {isLoading ? (
                            <div className="text-center py-8 text-white/80 text-base">Loading documents...</div>
                        ) : (
                            <>
                                <div className="mb-6 px-6 pt-4">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                        <h3 className="font-semibold text-lg text-purple-300">Layer 1 Context</h3>
                                        <span className="ml-2 text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded-full">
                                            {layer1Documents.length} documents
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {layer1Documents.length > 0 ? (
                                            layer1Documents.map((doc) => (
                                                <div
                                                    key={doc.doc_id}
                                                    className="flex items-start gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                                                >
                                                    <input type="checkbox" className="accent-blue-500 mt-1" />
                                                    <span className="text-sm text-white/90 leading-snug">{doc.title}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-gray-400 text-sm">No documents in Layer 1</div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 pb-4">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                        <h3 className="font-semibold text-lg text-purple-300">Layer 2 Context </h3>
                                        <span className="ml-2 text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded-full">
                                            {layer2Documents.length} documents
                                        </span>
                                    </div>                                    <div className="grid grid-cols-2 gap-3">
                                        {layer2Documents.length > 0 ? (
                                            layer2Documents.map((doc) => (
                                                <div
                                                    key={doc.doc_id}
                                                    className="flex items-start gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all"
                                                >
                                                    <input type="checkbox" className="accent-blue-500 mt-1" />
                                                    <span className="text-sm text-white/90 leading-snug">{doc.title}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 text-gray-400 text-sm">No documents in Layer 2</div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}


            </div>
        </div>
    );
};

export default Assistant;