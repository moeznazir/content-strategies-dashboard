'use client'
import { appColors } from '@/lib/theme';
import React, { useState } from 'react';

const Assistant = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [searchResult, setSearchResult] = useState('');

    const tabs = [
        { id: 'persistent', label: 'Persistent Context' },
        { id: 'customer', label: 'Voice-of-the-Customer' },
        { id: 'business', label: 'Voice-of-the-Business' },
        { id: 'market', label: 'Voice-of-the-Market' },
        // { id: 'addon', label: 'Add On' },
    ];

    const modalContents = {
        persistent: <div className="p-4"><h2 className="text-xl font-bold mb-4">Persistent Context Files</h2><div className="space-y-2">{['Sample file 1.txt', 'Sample file 2.txt', 'Sample file 3.txt'].map(file => (<div key={file} className="flex items-center p-2 hover:bg-[rgba(255,255,255,0.1)] rounded cursor-pointer"><span>{file}</span></div>))}</div></div>,
        customer: <div className="p-4"><h2 className="text-xl font-bold mb-4">Voice-of-the-Customer Content</h2><p>Customer feedback and insights would appear here.</p></div>,
        business: <div className="p-4"><h2 className="text-xl font-bold mb-4">Voice-of-the-Business Content</h2><p>Business metrics and internal data would appear here.</p></div>,
        market: <div className="p-4"><h2 className="text-xl font-bold mb-4">Voice-of-the-Market Content</h2><p>Market trends and competitor analysis would appear here.</p></div>,
        addon: <div className="p-4"><h2 className="text-xl font-bold mb-4">Add On Content</h2><p>Additional tools and integrations would appear here.</p></div>,
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setModalContent(modalContents[tabId]);
        setIsModalOpen(true);
    };

    return (
        <div className={`h-full w-full flex flex-col -mt-20 ${hasSearched ? 'justify-end' : 'justify-center'} items-center`} style={{ backgroundColor: appColors.primaryColor }}>
            <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-6">
                <h1 className="text-2xl font-bold" style={{ color: appColors.textColor }}>What can I help with?</h1>
                {hasSearched && (
                    <div className="w-full max-w-2xl text-left text-white mb-6">
                        <h2 className="text-xl font-semibold">Search Result</h2>
                        <p>{searchResult}</p>
                    </div>
                )}

                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Ask anything"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-4 rounded-full border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ backgroundColor: appColors.primaryColor }}
                    />
                    <button
                        onClick={() => {
                            setHasSearched(true);
                            setSearchResult(`Result for "${searchQuery}"`); 
                        }}
                        className="absolute right-2 top-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>

                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-semibold">
                                {tabs.find(tab => tab.id === activeTab)?.label}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:bg-[rgba(255,255,255,0.1)] p-1 rounded"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>

                        </div>
                        <div>{modalContent}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assistant;