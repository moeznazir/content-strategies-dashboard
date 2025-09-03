'use client';
import { listConversations, fetchConversation, sendChats, optimizePrompt } from '@/lib/services/chatServices';
import { appColors } from '@/lib/theme';
import React, { useEffect, useState, useRef } from 'react';
import { ShowCustomToast } from '../customComponents/CustomToastify';
import PromptLibraryModal from '../customComponents/PromptLibraryModal';
import ContextModal from '../customComponents/ContextModal';
import { createClient } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeFileName } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';


const GuidelineModal = ({ step, onNext, onSkip, onClose, totalSteps }) => {
    const guidelines = [
        {
            title: "Enhance Your Search with Library",
            description: "Access pre-built prompts and templates to get started quickly with common tasks.",
            button: "Open Library",
            skip: "Skip"
        },
        {
            title: "Optimize Your Prompt for Better Results",
            description: "Get suggestions to improve your prompt and professionalize your query with one click.",
            button: "Optimize Prompt",
            skip: "Skip"
        },
        {
            title: "Add Context for Better Responses",
            description: "Include relevant documents to help the AI understand your business better.",
            button: "Add Context",
            skip: "Skip"
        },
        {
            title: "Refine Results with Add-Ons",
            description: "Customize the AI's output with specific parameters to get exactly what you need.",
            button: "Apply Add-ons",
            skip: "Finish"
        }
    ];

    const currentGuideline = guidelines[step];

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="rounded-lg p-5 w-full max-w-sm mx-4 shadow-lg" style={{ backgroundColor: appColors.primaryColor }}>

                {/* Header */}
                <div className="flex justify-between items-center mb-2 -mt-3">
                    <h2 className="text-lg font-semibold">Getting Started</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                        &times;
                    </button>
                </div>

                <hr className="border-b border-gray-300 -mx-5 mb-3" />

                {/* Content */}
                <div className="mb-5">
                    <h3 className="text-base font-medium mb-1">{currentGuideline.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{currentGuideline.description}</p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center">
                    {/* Steps */}
                    <div className="flex space-x-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                        <button
                            onClick={onSkip}
                            className="px-3 py-1 rounded-md text-sm text-gray-600 hover:text-gray-400 border border-gray-300"
                        >
                            {currentGuideline.skip}
                        </button>
                        <button
                            onClick={onNext}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                        >
                            {currentGuideline.button}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const Assistant = () => {
    const [activeTab, setActiveTab] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [selectedSource, setSelectedSource] = useState([]);
    const [selectedDocTitles, setSelectedDocTitles] = useState([]);
    const [selectedLibraryDocs, setSelectedLibraryDocs] = useState([]);
    const [selectedLibraryDocTitles, setSelectedLibraryDocTitles] = useState([]);
    const [selectedSourceTitles, setSelectedSourceTitles] = useState([]);
    const [selectedPromptId, setSelectedPromptId] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedPromptTitle, setSelectedPromptTitle] = useState('');
    const [optimizedQuery, setOptimizedQuery] = useState('');
    const [selectedAddOn, setSelectedAddOn] = useState(null);
    const [showLibraryDropdown, setShowLibraryDropdown] = useState(false);
    const [showAddonsDropdown, setShowAddonsDropdown] = useState(false);
    const [isPromptMode, setIsPromptMode] = useState(true);
    const [showContextModal, setShowContextModal] = useState(false);
    const [showOptimizationModal, setShowOptimizationModal] = useState(false);
    const [showAddonsModal, setShowAddonsModal] = useState(false);
    const [hoveredTab, setHoveredTab] = useState(null);
    const leaveTimer = useRef(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [currentMessages, setCurrentMessages] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    const [originalPrompt, setOriginalPrompt] = useState('');

    // const [showReplaceConfirmation, setShowReplaceConfirmation] = useState(false);
    const [addOns, setAddOns] = useState({
        industry: [],
        audience: [],
        audienceTitles: [],
        tone: [],
        objective: '',
        advice: {
            do: [],
            dont: []
        }
    });

    const [selectedUploadedDocuments, setSelectedUploadedDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingIndexes, setUploadingIndexes] = useState([]);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showGuideline, setShowGuideline] = useState(false);
    const [currentGuidelineStep, setCurrentGuidelineStep] = useState(0);
    const [pendingSubmit, setPendingSubmit] = useState(false); // Add this state
    const totalGuidelineSteps = 4;

    const [currentStep, setCurrentStep] = useState(0);
    const steps = ['library', 'context', 'addons'];

    const [newResponseArrived, setNewResponseArrived] = useState(false);
    const [showScrollToTop, setShowScrollToTop] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    useEffect(() => {
        if (chatContainerRef.current) {
            const container = chatContainerRef.current;

            // Scroll to bottom when new messages are added
            container.scrollTop = container.scrollHeight;

            // Check if we need to show scroll buttons
            const checkScrollPosition = () => {
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                setShowScrollToTop(container.scrollTop > 300);
                setShowScrollToBottom(!isNearBottom && container.scrollHeight > container.clientHeight);
            };

            checkScrollPosition();
            container.addEventListener('scroll', checkScrollPosition);

            return () => {
                container.removeEventListener('scroll', checkScrollPosition);
            };
        }
    }, [currentMessages]);

    useEffect(() => {
        if (apiResponse && currentMessages.length > 0) {
            // Find the latest assistant message
            const lastMessage = currentMessages[currentMessages.length - 1];
            if (lastMessage.role === 'assistant') {
                setNewResponseArrived(true);

                // Scroll to the top of the new response
                setTimeout(() => {
                    const assistantMessages = document.querySelectorAll('.message-content');
                    if (assistantMessages.length > 0) {
                        const latestMessage = assistantMessages[assistantMessages.length - 1];
                        latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        }
    }, [apiResponse, currentMessages]);

    const scrollToTopOfResponse = () => {
        if (chatContainerRef.current) {
            const assistantMessages = document.querySelectorAll('.message-content');
            if (assistantMessages.length > 0) {
                const latestMessage = assistantMessages[assistantMessages.length - 1];
                latestMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setNewResponseArrived(false);
            }
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // useEffect(() => {
    //     if (showAddonsModal && searchQuery.trim() !== '') {
    //         setShowReplaceConfirmation(true);
    //     } else {
    //         setShowReplaceConfirmation(false);
    //     }
    // }, [showAddonsModal]);
    useEffect(() => {
        localStorage.removeItem('originalPrompt');
    }, []);

    useEffect(() => {
        const savedOriginalPrompt = localStorage.getItem('originalPrompt');
        if (savedOriginalPrompt) {
            setOriginalPrompt(savedOriginalPrompt);
        }
    }, []);
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setIsLoading(true);
                const userId = localStorage.getItem('current_user_id');
                const { conversations } = await listConversations(userId);

                // Filter out any invalid conversations
                const validConversations = conversations.filter(conv =>
                    conv.conversation_id && typeof conv.conversation_id === 'string'
                );

                setConversations(validConversations);


            } catch (error) {
                console.log('Failed to load conversations:', error);
                ShowCustomToast('Failed to load conversations', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, []);

    const optimizeQuery = async () => {
        if (showOptimizationModal && searchQuery.trim()) {
            try {
                setIsLoading(true);
                setOptimizedQuery(""); // Clear previous optimization
                const optimized = await optimizePrompt(searchQuery);

                if (!optimized.error) {
                    let raw = optimized.prompt || optimized.message;

                    // Remove wrapping quotes if present
                    if (raw.startsWith('"') && raw.endsWith('"')) {
                        raw = raw.slice(1, -1);
                    }

                    // Clean the response
                    const cleanedResponse = raw
                        .replace(/^,+|,+$/g, '')
                        .replace(/,+\s*,+/g, ', ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    setOptimizedQuery(cleanedResponse);
                } else {
                    ShowCustomToast('Failed to optimize prompt', 'error');
                }
            } catch (error) {
                console.log('Optimization error:', error);
                ShowCustomToast('Error optimizing prompt', 'error');
            } finally {
                setIsLoading(false);
            }
        }
    };



    const handleConversationSelect = async (conversationId) => {
        try {
            setIsLoading(true);
            setHasSearched(true);
            setSelectedConversation(conversationId);

            const response = await fetchConversation(conversationId);
            const messages = response.data || [];

            // Format messages for display
            const formattedMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                id: msg.id || Date.now().toString()
            }));

            setCurrentMessages(formattedMessages);
        } catch (error) {
            console.log('Failed to load conversation:', error);
            ShowCustomToast('Failed to load conversation', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Update the tabs array to include the file icon
    const tabs = [
        {
            id: 'uplode',
            label: (
                // File + plus icon (default state)
                <div className="flex items-center space-x-1">
                    {/* File icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5H4z" />
                    </svg>
                    {/* Plus icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )
        },

        { id: 'library', label: `Library` },
        { id: 'business', label: 'Optimization' },
        { id: 'context', label: 'Context' },
        { id: 'addons', label: '+ Add-Ons' },
    ];

    // Tab hover messages
    const tabMessages = {
        context: [
            "Add relevant documents to improve response quality",
            "Context helps the AI understand your business better",
            "Select documents that match your prompt topic"
        ],
        library: [
            "Choose from pre-built prompts for common tasks",
            "Templates help you get started quickly",
            "Save time with our curated prompt library"
        ],
        business: [
            "Optimize your prompt for better results",
            "Get suggestions to improve your prompt",
            "Professionalize your prompt with one click"
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

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            // Close current modal
            if (steps[currentStep] === 'library') {
                setShowLibraryDropdown(false);
            } else if (steps[currentStep] === 'context') {
                setShowContextModal(false);
            }

            // Open next modal and set active tab
            const nextStep = currentStep + 1;
            const nextTab = steps[nextStep];

            setCurrentStep(nextStep);
            setActiveTab(nextTab);

            if (nextTab === 'context') {
                setShowContextModal(true);
            } else if (nextTab === 'addons') {
                setShowAddonsModal(true);
            }
        }
    };
    const goToPreviousStep = () => {
        if (currentStep > 0) {
            // Close current modal
            if (steps[currentStep] === 'context') {
                setShowContextModal(false);
            } else if (steps[currentStep] === 'addons') {
                setShowAddonsModal(false);
            }

            // Open previous modal and set active tab
            const prevStep = currentStep - 1;
            const prevTab = steps[prevStep];

            setCurrentStep(prevStep);
            setActiveTab(prevTab);

            if (prevTab === 'library') {
                setShowLibraryDropdown(true);
            } else if (prevTab === 'context') {
                setShowContextModal(true);
            }
        }
    };

    const handleTabClick = async (tabId) => {
        setActiveTab(tabId);

        // Update current step based on the tab clicked
        const stepIndex = steps.indexOf(tabId);
        if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
        }

        if (tabId === 'context') {
            setShowContextModal(true);
            setHasSearched(true);
            setShowOptimizationModal(false);
            setShowAddonsModal(false);
            setShowLibraryDropdown(false);
        } else if (tabId === 'business') {
            setShowOptimizationModal(true);
            setHasSearched(true);
            setShowContextModal(false);
            setShowAddonsModal(false);
            setShowLibraryDropdown(false);
        } else if (tabId === 'addons') {
            setShowAddonsModal(true);
            setHasSearched(true);
            setShowContextModal(false);
            setShowOptimizationModal(false);
            setShowLibraryDropdown(false);
        } else if (tabId === 'library') {
            setShowLibraryDropdown(!showLibraryDropdown);
            setHasSearched(true);
            setShowContextModal(false);
            setShowOptimizationModal(false);
            setShowAddonsModal(false);
        } else if (tabId === 'uplode') {
            setHasSearched(true);
            fileInputRef.current.click();
            setShowContextModal(false);
            setShowOptimizationModal(false);
            setShowAddonsModal(false);
            setShowLibraryDropdown(false);
        }
    };
    const handleMouseEnter = (tabId) => {
        if (leaveTimer.current) {
            clearTimeout(leaveTimer.current);
        }
        setHoveredTab(tabId);
    };

    const handleMouseLeave = () => {
        leaveTimer.current = setTimeout(() => {
            setHoveredTab(null);
        }, 300); // 300ms delay before hiding
    };


    // For context documents modal
    const handleDocSelect = (docId, docTitle) => {
        setSelectedDocs(prev => {
            const newSelection = prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId];

            return newSelection.filter(id => id && id.trim() !== '');
        });

        setSelectedDocTitles(prev => {
            const cleaned = prev.filter(doc => doc.id && doc.id.trim() !== '');
            return cleaned.some(doc => doc.id === docId)
                ? cleaned.filter(doc => doc.id !== docId)
                : [...cleaned, {
                    id: docId,
                    title: docTitle || 'Untitled Document'
                }];
        });
    };
    // For AI in 3rd steps  in library modal
    const handleSourceSelect = (docId, docTitle) => {
        setSelectedSource(prev => {
            const newSelection = prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId];

            return newSelection.filter(id => id && id.trim() !== '');
        });

        setSelectedSourceTitles(prev => {
            const cleaned = prev.filter(doc => doc.id && doc.id.trim() !== '');
            return cleaned.some(doc => doc.id === docId)
                ? cleaned.filter(doc => doc.id !== docId)
                : [...cleaned, {
                    id: docId,
                    title: docTitle || 'Untitled Document'
                }];
        });
    };
    // For selcting prompts (doc) on slecting Template in step 1 in Library modal
    const handleLibraryDocsSelect = (docId, docTitle, processedContent) => {
        setSelectedLibraryDocs([docId]);
        setSelectedLibraryDocTitles([{
            id: docId,
            title: docTitle,
            processedDescription: processedContent
        }]);
    };

    const handleRemoveLibraryDoc = (docId) => {
        setSelectedLibraryDocs((prev) => prev.filter((id) => id !== docId));
        setSelectedLibraryDocTitles((prev) => prev.filter((doc) => doc.id !== docId));
    };

    // Upload handler


    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const userId = localStorage.getItem("current_user_id");
        const uploadedDocumentIds = [];

        const filesArr = Array.from(files);

        // Temp show in preview (with loading)
        const newFileStates = filesArr.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file,
            isUploading: true,
        }));

        setSelectedFiles((prev) => [...prev, ...newFileStates]);

        try {
            for (let i = 0; i < filesArr.length; i++) {
                const file = filesArr[i];
                const safeFileName = sanitizeFileName(file.name);
                const filePath = `${userId}/${Date.now()}-${safeFileName}`;

                // Upload to Supabase
                const { error: uploadError } = await supabase.storage
                    .from("uploaded-documents")
                    .upload(filePath, file, { upsert: true });

                if (uploadError) {
                    ShowCustomToast(`Failed to upload "${file.name}"`, "error");
                    continue;
                }

                const { data: dbData, error: dbError } = await supabase
                    .from("lib_uploaded_doc")
                    .insert([
                        {
                            user_id: userId,
                            uploded_doc_url: filePath,
                            document_name: file.name,
                        },
                    ])
                    .select("id");

                if (dbError) {
                    ShowCustomToast(`Failed to save record for "${file.name}"`, "error");
                    continue;
                }

                const dbId = dbData?.[0]?.id;

                // Update the uploaded file state
                setSelectedFiles((prev) =>
                    prev.map((f) =>
                        f.name === file.name && f.isUploading
                            ? {
                                ...f,
                                filePath,
                                dbId,
                                isUploading: false,
                            }
                            : f
                    )
                );

                uploadedDocumentIds.push(dbId);
            }

            setSelectedUploadedDocuments((prev) => [...prev, ...uploadedDocumentIds]);

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
                setIsExpanded(false)
            }
        } catch (error) {
            console.log("Upload error:", error);
            ShowCustomToast("Unexpected error while uploading", "error");
        }
    };


    // Remove handler
    const handleRemoveFile = async (index) => {
        const fileToRemove = selectedFiles[index];
        if (!fileToRemove) return;

        try {
            // 1. Delete from storage
            if (fileToRemove.filePath) {
                const { error: storageError } = await supabase.storage
                    .from("uploaded-documents")
                    .remove([fileToRemove.filePath]);

                if (storageError) {
                    console.error("Storage delete error:", storageError);
                }
            }

            // 2. Delete from DB
            if (fileToRemove.dbId) {
                const { error: dbError } = await supabase
                    .from("lib_uploaded_doc")
                    .delete()
                    .eq("id", fileToRemove.dbId);

                if (dbError) {
                    console.error("DB delete error:", dbError);
                }
            }

            // 3. Update UI state
            const newFiles = [...selectedFiles];
            newFiles.splice(index, 1);
            setSelectedFiles(newFiles);

            setSelectedUploadedDocuments((prev) =>
                prev.filter((id) => id !== fileToRemove.dbId)
            );

            // Reset the file input after removal
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setIsExpanded(false)
            // ShowCustomToast(`File(s) removed successfully.`, "success");
        } catch (error) {
            console.error("Remove file error:", error);
            ShowCustomToast("Error while removing file.", "error");
        }
    };
    console.log("selectedFilesAfter", selectedFiles);
    const handleAddOnChange = (type, value, isChecked) => {
        setAddOns(prev => {
            if (type === 'objective') {
                return { ...prev, objective: value };
            }

            if (type === 'do' || type === 'dont') {
                const newAdvice = { ...prev.advice };
                if (isChecked) {
                    newAdvice[type] = [...newAdvice[type], value];
                } else {
                    newAdvice[type] = newAdvice[type].filter(item => item !== value);
                }
                return { ...prev, advice: newAdvice };
            }

            // ✅ For arrays like industry, audienceTitles, tone
            const current = Array.isArray(prev[type]) ? prev[type] : [];
            const newArray = isChecked
                ? [...current, value]
                : current.filter(item => item !== value);

            return { ...prev, [type]: newArray };
        });
    };

    const handleCustomAddOn = (type, value) => {
        if (!value.trim()) return;

        setAddOns(prev => {
            if (type === 'objective') {
                return { ...prev, objective: value };
            }

            if (type === 'do' || type === 'dont') {
                const newAdvice = { ...prev.advice };
                newAdvice[type] = [...newAdvice[type], value];
                return { ...prev, advice: newAdvice };
            }

            // For industry, audience, tone
            if (!prev[type].includes(value)) {
                return { ...prev, [type]: [...prev[type], value] };
            }
            return prev;
        });
    };
    const handleSubmit = async () => {
        try {
            setNewResponseArrived(false);
            // Check if this is the first search and show guidelines if needed
            const hasSeenGuidelines = localStorage.getItem('hasSeenAssistantGuidelines');

            if (!hasSeenGuidelines) {
                // Show guideline modal and set pending submit flag
                setShowGuideline(true);
                setPendingSubmit(true); // Mark that we have a pending submit
                localStorage.setItem('hasSeenAssistantGuidelines', 'true');
                return; // Exit early without submitting
            }

            // If guidelines were already seen, proceed with normal submit
            await executeSubmit();


        } catch (error) {
            ShowCustomToast('Something went wrong, Please try again', 'info', 2000);
            console.log('Error sending chat:', error);
        }
    };


    const executeSubmit = async () => {
        try {
            setIsLoading(true);
            setHasSearched(true);

            // Check if this is the first search and show guidelines if needed
            const hasSeenGuidelines = localStorage.getItem('hasSeenAssistantGuidelines');
            if (!hasSeenGuidelines) {
                setShowGuideline(true);
                localStorage.setItem('hasSeenAssistantGuidelines', 'true');
            }
            const userId = localStorage.getItem('current_user_id');
            const isNewConversation = !selectedConversation;
            const conversationId = selectedConversation || `conv-${Date.now()}`;


            let advice = {};
            if (addOns?.advice?.do?.length > 0) {
                advice.do = addOns.advice.do;
            }
            if (addOns?.advice?.dont?.length > 0) {
                advice.dont = addOns.advice.dont;
            }
            if (Object.keys(advice).length === 0) {
                advice = undefined;
            }
            // Prepare add_ons object for API
            const add_ons = {
                ...addOns,
                industry: addOns?.industry?.length > 0 ? addOns.industry : undefined,
                audience: addOns?.audience?.length > 0 ? addOns.audience : undefined,
                audienceTitles: addOns?.audienceTitles?.length > 0 ? addOns.audienceTitles : undefined,
                tone: addOns?.tone?.length > 0 ? addOns.tone : undefined,
                objective: addOns?.objective || undefined,
                advice
            };

            // Remove undefined values
            Object.keys(add_ons).forEach(key => {
                if (add_ons[key] === undefined) {
                    delete add_ons[key];
                }
            });
            if (add_ons.advice && Object.keys(add_ons.advice).length === 0) {
                delete add_ons.advice;
            }
            const formattedLibraryDocumentIds = selectedLibraryDocs.map(id => id.toString());
            const response = await sendChats({
                user_id: userId,
                context_document_ids: selectedDocs,
                prompt: searchQuery,
                source_document_ids: selectedSource,
                uploaded_document_ids: selectedUploadedDocuments,
                add_ons: add_ons,
                prompt_id: selectedLibraryDocTitles[0]?.processedDescription || '',
                conversation_id: conversationId
            });

            setApiResponse(response);
            const { conversations: updatedConversations } = await listConversations(userId);
            const validConversations = updatedConversations.filter(conv =>
                conv.conversation_id && typeof conv.conversation_id === 'string'
            );

            // Sort conversations by date (newest first)
            const sortedConversations = [...validConversations].sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );

            setConversations(sortedConversations);

            // If this was a new conversation, select the newest one
            if (isNewConversation && sortedConversations.length > 0) {
                setSelectedConversation(sortedConversations[0].conversation_id);

                // Also load the new conversation's messages
                const response = await fetchConversation(sortedConversations[0].conversation_id);
                const messages = response.data || [];
                setCurrentMessages(messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    id: msg.id || Date.now().toString()
                })));
            }

            // Update chat history
            const newMessages = [
                ...currentMessages,
                { role: 'user', content: searchQuery, id: `user-${Date.now()}` },
                { role: 'assistant', content: response?.message || response?.response || response?.data?.response, id: `assistant-${Date.now()}` }
            ];

            setCurrentMessages(newMessages);
            setSearchQuery('');
            setSelectedDocs([]);
            setSelectedDocTitles([]);
            setSelectedLibraryDocTitles([]);
            setSelectedLibraryDocs([]);
            setSelectedSource([]);
            setSelectedSourceTitles([]);
            setSelectedFiles([]);
            setSelectedUploadedDocuments([]);
            setAddOns({
                industry: [],
                audience: [],
                audienceTitles: [],
                tone: [],
                objective: '',
                advice: {
                    do: [],
                    dont: []
                }
            });

            // Refresh conversations list
            const { conversations } = await listConversations(userId);
            setConversations(conversations.filter(conv => conv.conversation_id && typeof conv.conversation_id === 'string'));

        } catch (error) {
            ShowCustomToast('Something went wrong, Please try again', 'info', 2000);
            console.log('Error sending chat:', error);
        } finally {
            setIsLoading(false);

        }
    };

    const handleGuidelineAction = () => {
        switch (currentGuidelineStep) {
            case 0: // Library step
                setShowLibraryDropdown(true);
                setActiveTab('library');
                setShowGuideline(false);
                break;
            case 1: // Optimization step

                setShowOptimizationModal(true);
                setActiveTab('business');
                setShowGuideline(false);
                break;
            case 2: // Context step
                setShowContextModal(true);
                setActiveTab('context');
                setShowGuideline(false);
                break;
            case 3: // Add-ons step
                setShowAddonsModal(true);
                setActiveTab('addons');
                setShowGuideline(false);
                break;
            default:
                break;
        }

        // Move to next step or close
        if (currentGuidelineStep < totalGuidelineSteps - 1) {
            setCurrentGuidelineStep(prev => prev + 1);
        } else {
            setShowGuideline(false);
        }

        // Don't automatically execute submit - let user manually submit again
        setPendingSubmit(false);
    };

    const handleGuidelineSkip = () => {
        if (currentGuidelineStep < totalGuidelineSteps - 1) {
            setCurrentGuidelineStep(prev => prev + 1);
        } else {
            setShowGuideline(false);
        }

        // Don't automatically execute submit - let user manually submit again
        setPendingSubmit(false);
    };

    const handleGuidelineClose = () => {
        setShowGuideline(false);

        // Don't automatically execute submit - let user manually submit again
        setPendingSubmit(false);
    };
    const getAddOnsCount = () => {
        const industry = addOns.industry.length;
        const audience = addOns.audience.length;
        const titles = addOns.audienceTitles.length;
        const tone = addOns.tone.length;
        const objective = addOns.objective ? 1 : 0;
        const dos = addOns.advice.do.length;
        const donts = addOns.advice.dont.length;
        const total = industry + audience + titles + tone + objective + dos + donts;

        return {
            industry,
            audience,
            titles,
            tone,
            objective,
            dos,
            donts,
            total
        };
    };
    const [expandedGroups, setExpandedGroups] = useState([]);

    const handleGroupToggle = (group) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };
    // Add this component to display add-on counts
    const AddOnsIndicator = () => {
        const counts = getAddOnsCount();
        const hasAddOns = Object.values(counts).some(count => count > 0);

        if (!hasAddOns) return null;

        return (
            <div className="w-full max-w-[890px]">
                <div className="relative">
                    <div className="overflow-x-auto whitespace-nowrap no-scrollbar pb-2 -mb-2">
                        <div className="inline-flex gap-2 min-w-min">
                            {/* Audience Industry */}
                            {counts.industry > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Audience-Industry: +{counts.industry}
                                </span>
                            )}

                            {/* Audience Department */}
                            {counts.audience > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Audience-Dpartments: +{counts.audience}
                                </span>
                            )}
                            {/* Audience Titles*/}
                            {counts.titles > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Audience-Titles: +{counts.titles}
                                </span>
                            )}

                            {/* Tone */}
                            {counts.tone > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Tone: +{counts.tone}
                                </span>
                            )}

                            {/* Objective */}
                            {counts.objective > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Objective: +{counts.objective}
                                </span>
                            )}

                            {/* Dos */}
                            {counts.dos > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Dos: +{counts.dos}
                                </span>
                            )}

                            {/* Donts */}
                            {counts.donts > 0 && (
                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                    Don'ts: +{counts.donts}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleClearSearchQuery = () => {
        setSelectedDocs([]);
        setSelectedDocTitles([]);

    };

    // const handleReplace = () => {
    //     // Clear the search query using the callback from parent
    //     if (handleClearSearchQuery) {
    //         handleClearSearchQuery();
    //     }
    //     setShowReplaceConfirmation(false);
    // };

    // const handleCancelReplace = () => {
    //     setShowReplaceConfirmation(false);
    // };
    // Check if submit should be enabled
    const isSubmitEnabled = searchQuery.trim() || selectedDocs.length > 0 || selectedPromptId;

    const formatPlainTextWithStyling = (text) => {
        const lines = text?.split('\n');
        const elements = [];
        let currentListItems = [];
        let inEmphasizedSection = false;
        let inTable = false;
        let tableRows = [];
        let tableHeaders = [];

        const flushList = () => {
            if (currentListItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-2 marker:text-blue-400">
                        {currentListItems.map((item, i) => (
                            <li key={i} className="text-gray-100 text-lg">{item}</li>
                        ))}
                    </ul>
                );
                currentListItems = [];
            }
        };

        const renderTable = () => {
            if (tableRows?.length > 0) {
                elements.push(
                    <div key={`table-${elements.length}`} className="mb-6 overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-600 text-lg">
                            <thead>
                                <tr className="bg-gray-800">
                                    {tableHeaders.map((header, idx) => (
                                        <th key={idx} className="border border-gray-600 px-4 py-3 text-left font-semibold text-white">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows?.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="border border-gray-600 px-4 py-3 text-gray-100">
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            tableHeaders = [];
            tableRows = [];
            inTable = false;
        };

        lines.forEach((line, index) => {
            const trimmedLine = line?.trim();

            // Check if this is a table header separator (|---|)
            if (trimmedLine?.match(/^\|(\s*\-+\s*\|)+$/)) {
                if (tableHeaders.length > 0 && !inTable) {
                    inTable = true;
                }
                return;
            }

            // Check if this is a table row
            if (trimmedLine?.startsWith('|') && trimmedLine.endsWith('|')) {
                if (!inTable && tableHeaders.length === 0) {
                    // This is the header row
                    tableHeaders = trimmedLine?.split('|')
                        .filter(cell => cell.trim() !== '')
                        .map(cell => cell.trim());
                } else if (inTable) {
                    // This is a data row
                    const rowData = trimmedLine?.split('|')
                        .filter(cell => cell.trim() !== '')
                        .map(cell => cell.trim());

                    // Skip empty rows or separator rows
                    if (rowData.length > 0 && !rowData.every(cell => cell.match(/^\-+$/))) {
                        tableRows.push(rowData);
                    }
                }
                return;
            }

            // If we were in a table and encounter a non-table line, render the table
            if (inTable && !trimmedLine.startsWith('|')) {
                renderTable();
            }

            if (!trimmedLine) {
                flushList();
                elements.push(<br key={`br-${index}`} />);
                return;
            }

            // Detect main headings (lines with numbers or that look like titles)
            if ((trimmedLine?.match(/^\d+\)/) || /^[A-Z][A-Za-z\s]+[:\-—]/.test(trimmedLine)) && trimmedLine.length < 80) {
                flushList();
                inEmphasizedSection = true;
                elements.push(
                    <h2 key={`h2-${index}`} className="text-2xl font-bold mb-4 text-white mt-6 first:mt-0">
                        {trimmedLine}
                    </h2>
                );
                return;
            }

            // Detect subheadings (lines with emoji or that indicate categories)
            if (trimmedLine?.includes('➤') || trimmedLine.includes('💷') || trimmedLine.includes('—')) {
                flushList();
                elements.push(
                    <h3 key={`h3-${index}`} className="text-xl font-semibold mb-3 text-blue-300 mt-4">
                        {trimmedLine}
                    </h3>
                );
                return;
            }

            // Detect options (A), B), C), etc.)
            if (/^[A-Z]\)\s/.test(trimmedLine)) {
                flushList();
                elements.push(
                    <div key={`option-${index}`} className="flex items-start mb-3">
                        <span className="font-bold text-blue-300 mr-2 flex-shrink-0 text-xl">
                            {trimmedLine.substring(0, 2)}
                        </span>
                        <span className="text-gray-100 text-lg">{trimmedLine.substring(3)}</span>
                    </div>
                );
                return;
            }

            // Detect list items (lines starting with •, -, *, or numbers)
            if (/^[•\-*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)) {
                currentListItems.push(trimmedLine.replace(/^[•\-*]\s/, '').replace(/^\d+\.\s/, ''));
                return;
            }

            // Detect bold patterns (text between **)
            if (trimmedLine.includes('**')) {
                flushList();
                const boldLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white text-lg">$1</strong>');
                elements.push(
                    <p
                        key={`bold-${index}`}
                        className="mb-3 leading-relaxed text-gray-100 text-lg"
                        dangerouslySetInnerHTML={{ __html: boldLine }}
                    />
                );
                return;
            }

            // Detect italic patterns (text between _)
            if (trimmedLine.includes('_')) {
                flushList();
                const italicLine = trimmedLine.replace(/_(.*?)_/g, '<em class="italic text-gray-300 text-lg">$1</em>');
                elements.push(
                    <p
                        key={`italic-${index}`}
                        className="mb-3 leading-relaxed text-gray-100 text-lg"
                        dangerouslySetInnerHTML={{ __html: italicLine }}
                    />
                );
                return;
            }

            // Text in emphasized sections (after headings)
            if (inEmphasizedSection) {
                flushList();
                elements.push(
                    <p key={`p-${index}`} className="mb-3 leading-relaxed text-gray-200 text-lg font-medium">
                        {trimmedLine}
                    </p>
                );
                return;
            }

            // Regular paragraphs
            flushList();
            elements.push(
                <p key={`p-${index}`} className="mb-3 leading-relaxed text-gray-100 text-lg">
                    {trimmedLine}
                </p>
            );
        });

        // Render any remaining table at the end
        if (inTable) {
            renderTable();
        }

        flushList(); // Flush any remaining list items

        return elements;
    };
    return (
        <div className="w-full flex" style={{ backgroundColor: appColors.primaryColor, minHeight: '90%' }}>
            {/* Conversations sidebar */}
            <div className="w-64 border-r border-gray-700 relative flex flex-col" style={{ height: "85vh" }}>
                {/* Fixed header section */}
                <div className="flex-shrink-0">
                    {/* New Chat button */}
                    <div
                        onClick={() => {
                            setSelectedConversation(null);
                            setCurrentMessages([]);
                            setSearchQuery("");
                            setSelectedDocs([]);
                            setSelectedDocTitles([]);
                            setSelectedLibraryDocTitles([]);
                            setSelectedLibraryDocs([]);
                            setSelectedSource([]);
                            setSelectedSourceTitles([]);
                            setSelectedFiles([]);
                            setSelectedUploadedDocuments([]);
                            setAddOns({
                                industry: [],
                                audience: [],
                                audienceTitles: [],
                                tone: [],
                                objective: "",
                                advice: { do: [], dont: [] },
                            });
                        }}
                        className="p-3 mx-4 mt-3 mb-2 flex items-center gap-3 text-sm text-white hover:bg-white/20 rounded-md transition-colors cursor-pointer"
                    >
                        {/* Pencil/Edit icon */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon -ml-[3px]"
                            aria-hidden="true"
                        >
                            <path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"></path>
                        </svg>
                        New Chat
                    </div>

                    {/* Chats header */}
                    <div className="px-4">
                        <h2 className="text-xl font-semibold text-white mb-2 ml-2">Chats</h2>
                        <hr className="border-gray-500" />
                    </div>
                </div>

                {/* Scrollable conversation list only */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2">
                    {isLoading && conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.conversation_id}
                                    className={`p-3 rounded-lg cursor-pointer ${selectedConversation === conv.conversation_id
                                        ? "bg-blue-600"
                                        : "hover:bg-white/20"
                                        }`}
                                    onClick={() => handleConversationSelect(conv.conversation_id)}
                                >
                                    <p className="text-white text-sm truncate">
                                        {conv.title || `Conversation ${conv.conversation_id.slice(-4)}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


            {/* Main chat area */}
            <div className="flex-1 flex flex-col relative">
                {/* {newResponseArrived && (
                    <button
                        onClick={scrollToTopOfResponse}
                        className="fixed  mt-1 right-12 bottom-28 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg z-10 transition-all duration-300"
                        style={{ animation: 'bounce 2s infinite' }}
                    >
                        <ArrowUp className="w-5 h-5" />
                        <span className="sr-only">Scroll to new response</span>
                    </button>
                )} */}
                {/* Scroll to bottom button (appears when user scrolls up) */}
                {/* {showScrollToBottom && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-50 mb-28">
                        <button
                            onClick={scrollToBottom}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                        >
                            <ArrowDown className="w-4 h-4" />
                            <span className="sr-only">Scroll to bottom</span>
                        </button>
                    </div>
                )} */}

                <div className={`w-full flex-1 flex flex-col ${hasSearched ? 'justify-end' : 'justify-center'} items-center`}>
                    {/* Chat history container with scroll */}
                    <div
                        ref={chatContainerRef}
                        className="w-full max-w-4xl mb-4 mt-4 overflow-y-auto no-scrollbar items-center"
                        style={{
                            maxHeight:
                                isExpanded ||
                                    selectedFiles.length > 0 ||
                                    getAddOnsCount().total > 0 ||
                                    (selectedPromptTitle && selectedPromptTitle.length > 30)
                                    ? "48vh"
                                    : "68vh",
                        }}
                    >
                        {/* Always show existing messages */}
                        {currentMessages.length > 0 && (
                            currentMessages.map((msg, index) => (
                                <div key={`${msg.id}-${index}`} className="w-full space-y-4 mb-6">
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`rounded-lg px-4 py-3 max-w-3xl break-words overflow-hidden ${msg.role === 'user' ? 'bg-white/10 text-white' : ' text-white'}`}>

                                            {msg.role === 'assistant' ? (
                                                <div className="message-content">
                                                    {formatPlainTextWithStyling(msg.content)}
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Show loading indicator at the bottom while loading */}
                        {isLoading && (
                            <div className="flex justify-center my-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                            </div>
                        )}

                        {/* Show empty state if no messages */}
                        {!isLoading && currentMessages.length === 0 && (
                            <div className="h-full flex items-center justify-center mb-4">
                                <h1 className="text-2xl font-bold" style={{ color: appColors.textColor }}>
                                    {conversations.length === 0 ? 'How can I help you today?' : 'Choose a chat or begin a new one!'}
                                </h1>
                            </div>
                        )}
                    </div>

                    {/* Scroll to bottom button - positioned above the response text area */}
                    {showScrollToBottom && (
                        <div className=" bottom-48 -mt-12 left-1/2 transform -translate-x-1/2 z-10">
                            <button
                                onClick={scrollToBottom}
                                className="bg-gray-500 hover:bg-gray-500 mb-2 text-white p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
                            >
                                <ArrowDown className="w-4 h-4" />
                                <span className="sr-only">Scroll to bottom</span>
                            </button>
                        </div>
                    )}
                    {/* Input area - fixed at bottom */}
                    <div className="flex flex-col w-full max-w-4xl" style={{ height: "auto" }}>
                        {/* Add-ons indicators */}
                        {(selectedDocTitles.length > 0 || selectedSourceTitles.length > 0 ||
                            selectedLibraryDocTitles.length > 0 || selectedFiles.length > 0 ||
                            selectedPromptTitle || getAddOnsCount().total > 0) && (
                                <div className="w-full max-w-[890px] mb-2">
                                    <div className="relative">
                                        {/* Scrollable area for all tags and AddOns */}
                                        <div className="pb-2 -mb-2">
                                            <div className="flex gap-2 min-w-min">
                                                {/* Prompt Title */}
                                                {selectedPromptTitle && (
                                                    <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full w-100">
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

                                                {/* Document Titles - Grouped summary */}
                                                {selectedDocTitles.length > 0 && (
                                                    <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 !py-0 rounded-full whitespace-nowrap">
                                                        Context ({selectedDocTitles.length} Document{selectedDocTitles.length !== 1 ? 's' : ''})
                                                        <button
                                                            onClick={() => {
                                                                // Remove all documents at once
                                                                selectedDocTitles.forEach(doc => {
                                                                    handleDocSelect(doc.id, doc.title);
                                                                });
                                                            }}
                                                            className="ml-4 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}

                                                {/* Document Titles */}
                                                {/* {selectedDocTitles.map(doc => (
                                                    <span
                                                        key={doc.id}
                                                        className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                                    >
                                                        {doc.title}
                                                        <button
                                                            onClick={() => handleDocSelect(doc.id, doc.title)}
                                                            className="ml-1 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}
                                                {/* Source Titles Group by */}
                                                {selectedSourceTitles.length > 0 && (
                                                    <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 !py-0 rounded-full whitespace-nowrap">
                                                        Library ({selectedSourceTitles.length} Document{selectedSourceTitles.length !== 1 ? 's' : ''})
                                                        <button
                                                            onClick={() => {
                                                                // Remove all library docs at once
                                                                selectedSourceTitles.forEach(source => {
                                                                    handleSourceSelect(source.id, source.title);
                                                                });
                                                            }}
                                                            className="ml-4 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                )}


                                                {/* Source Titles */}
                                                {/* {selectedSourceTitles.map(source => (
                                                    <span
                                                        key={source.id}
                                                        className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                                    >
                                                        {source.title}
                                                        <button
                                                            onClick={() => handleSourceSelect(source.id, source.title)}
                                                            className="ml-1 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}

                                                {/* Library Document Titles */}
                                                {/* {selectedLibraryDocTitles.map(source => (
                                                    <span
                                                        key={source.id}
                                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                    >
                                                        {source.title}
                                                        <button
                                                              onClick={() => handleRemoveLibraryDoc(source.id)}
                                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}


                                                {/* Files */}
                                                {/* {selectedFiles.map((file, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full"
                                                    >
                                                        {file.name}
                                                        <button
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="ml-1 text-blue-100 hover:text-white"
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))} */}

                                                {/* AddOns indicators - inline with tags */}
                                                <AddOnsIndicator />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className={`relative w-full`}>

                            <div
                                className={`w-full pt-3 pb-3 p-4 pr-36 border border-gray-300 text-white focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200 ${isExpanded || selectedFiles.length > 0 ? 'rounded-xl' : 'rounded-full'}`}
                                style={{
                                    maxHeight: "none", // Remove fixed maxHeight
                                }}
                            // onClick={() => document.querySelector('textarea').focus()}
                            >
                                {/* File tags inside the textarea */}
                                <div className="flex gap-3 overflow-x-auto mb-0 whitespace-nowrap pb-2 no-scrollbar">
                                    {selectedFiles.map((file, index) => {
                                        const extension = file.file.name.split(".").pop().toLowerCase();
                                        const fileSize = (file.file.size / 1024).toFixed(1) + " KB";

                                        const getFileIcon = (ext) => {
                                            switch (ext) {
                                                case "js": return "🟨 <>";       // JavaScript
                                                case "css": return "🎨 { }";     // CSS
                                                case "html": return "🌐 <>";     // HTML
                                                case "json": return "🟦 {}";     // JSON
                                                case "pdf": return "📕";         // PDF
                                                case "doc":
                                                case "docx": return "📄";        // Word
                                                case "xls":
                                                case "xlsx": return "📊";        // Excel
                                                case "zip": return "🟪";         // Zip
                                                default: return "📁";            // Generic file
                                            }
                                        };

                                        return (
                                            <div
                                                key={index}
                                                className="inline-flex mb-1 items-center gap-3 bg-neutral-800   text-white px-4 py-2 rounded-xl shadow-md relative min-w-[220px] max-w-xs"
                                            >
                                                {/* File Icon */}
                                                <div className="text-xl">
                                                    {getFileIcon(extension)}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-sm font-medium truncate ">{file.file.name}</span>
                                                    <span className="text-xs text-gray-300">
                                                        {extension.toUpperCase()} • {fileSize}
                                                    </span>
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemoveFile(index)}
                                                    className="ml-0 -mr-2 -mt-4 text-xs bg-white/20 hover:bg-white/30 rounded-full w-5 h-5 flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                                {/* Loader Overlay */}
                                                {file.isUploading && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}

                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Textarea for input */}
                                <textarea
                                    placeholder={selectedFiles.length > 0 ? "Add a message or ask about your files..." : "Ask anything"}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full  -mt-[10px] bg-transparent outline-none resize-none overflow-y-auto no-scrollbar"
                                    style={{
                                        minHeight: selectedFiles.length > 0 ? '30px' : '20px',
                                        maxHeight: '100px',
                                        height: 'auto',
                                    }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        const newHeight = Math.min(e.target.scrollHeight, 200);
                                        e.target.style.height = newHeight + 'px';

                                        const hasContent = newHeight > 30 || selectedFiles.length > 0;
                                        setIsExpanded(hasContent);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && isSubmitEnabled) {
                                            e.preventDefault();

                                            // Store the current textarea reference
                                            const textarea = e.currentTarget;

                                            handleSubmit();

                                            // Clear text value and reset height after a small delay
                                            setTimeout(() => {
                                                // setSearchQuery("");
                                                textarea.style.height = 'auto';
                                                setIsExpanded(false);
                                            }, 100);
                                        }
                                    }}
                                    ref={(el) => {
                                        if (el) {
                                            // ✅ On re-render, keep expanded if text is already long
                                            if (!searchQuery) {
                                                el.style.height = "auto";
                                                setIsExpanded(false);
                                            } else {
                                                el.style.height = "auto";
                                                const newHeight = Math.min(el.scrollHeight, 200);
                                                el.style.height = newHeight + "px";
                                                setIsExpanded(newHeight > 30 || selectedFiles.length > 0);
                                            }
                                        }
                                    }}
                                    rows={1}

                                />
                            </div>
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                                accept="*"
                                ref={fileInputRef}
                            />
                            {/* Toggle Switch + Info Icon Row */}
                            <div className="flex items-center gap-2 absolute right-14 -mt-[40px]">
                                {/* Info Icon beside toggle */}
                                <div
                                    className="relative group cursor-pointer flex flex-col items-center"
                                    onClick={() => setShowGuideline(true)}
                                    onMouseEnter={() => setHoveredTab('guide')}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    {/* Info icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 text-gray-400 hover:text-white transition-colors"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full  -translate-x-1/2 mb-3 ml-[50px] z-10 hidden group-hover:block">
                                        <div className="relative bg-[#3b3b5b] text-white text-sm p-3 rounded-lg shadow-lg w-64">
                                            <p className="mb-0">
                                                Let the AI Navigator walk you through a best practice prompt experience.
                                            </p>
                                            <div className="absolute -bottom-2 right-4 w-4 h-4 transform rotate-45 bg-[#3b3b5b]"></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Toggle Switch Tooltip - Updated */}
                                <div className="relative group cursor-pointer"
                                    onClick={() => setIsPromptMode((prev) => !prev)}
                                >
                                    <div
                                        className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors duration-300 ${isPromptMode ? 'bg-blue-600' : 'bg-gray-500'}`}
                                    >
                                        <div
                                            className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isPromptMode ? 'translate-x-4' : 'translate-x-0'}`}
                                        ></div>
                                    </div>

                                    {/* Updated Tooltip */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-9 mt-0.5 w-48 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                                        <div className="bg-[#3b3b5b] text-white text-sm p-3 rounded-lg shadow-lg w-[120px]">
                                            <p className="mb-0">Randomness</p>
                                        </div>
                                        {/* Tooltip arrow */}
                                        <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-6 h-6 transform rotate-45 bg-[#3b3b5b] z-0"></div>
                                    </div>
                                </div>


                            </div>

                            <div className="relative group">
                                {/* Updated Tooltip */}
                                {!searchQuery && (
                                    <div className="absolute -right-10 top-1 w-48 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ">
                                        <div className="bg-[#3b3b5b] text-white text-sm p-3 rounded-lg shadow-lg w-[150px]">
                                            <p className="mb-0">Please input text</p>
                                        </div>
                                        {/* Tooltip arrow */}
                                        <div className="absolute -top-[10px] right-14 w-6 h-6 transform rotate-45 bg-[#3b3b5b] z-0"></div>
                                    </div>
                                )}
                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !isSubmitEnabled || !searchQuery}
                                    className="absolute right-3 -top-[47px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
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
                    <div className="flex mt-4 flex-wrap justify-center gap-2 -mb-4">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className="relative"
                                onMouseEnter={() => handleMouseEnter(tab.id)}
                                onMouseLeave={handleMouseLeave}
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

                </div>

                {/* Context Modal */}
                <ContextModal
                    showContextModal={showContextModal}
                    setShowContextModal={setShowContextModal}
                    onDocSelect={handleDocSelect}
                    selectedDocTitles={selectedDocTitles}
                    currentStep={currentStep}
                    goToPreviousStep={goToPreviousStep}
                    goToNextStep={goToNextStep}
                    searchQueries={searchQuery}
                    setSearchQueries={setSearchQuery}
                    onClearSearchQuery={handleClearSearchQuery}

                />

                {/* Library Modal */}
                <PromptLibraryModal
                    showLibraryDropdown={showLibraryDropdown}
                    setShowLibraryDropdown={setShowLibraryDropdown}
                    onSourceSelect={handleSourceSelect}
                    onLibraryDocsSelect={handleLibraryDocsSelect}
                    selectedLibraryDocs={selectedLibraryDocs}
                    currentSteps={currentStep}
                    goToPreviousStep={goToPreviousStep}
                    goToNextStep={goToNextStep}
                    searchQueries={searchQuery}
                    setSearchQueries={setSearchQuery}
                    onClearSearchQuery={handleClearSearchQuery}
                />

                {/* Optimization Modal */}
                {showOptimizationModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="border rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold -mt-4">Prompt Optimization</h2>
                                <button
                                    onClick={() => {
                                        setShowOptimizationModal(false);
                                        setIsLoading(false);
                                    }}
                                    className="text-white -mt-4 hover:text-gray-300 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <hr className='-mx-6 -mt-2' />

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-1 mt-4">
                                    <h3 className="text-sm font-medium -mb-2">Original Prompt:</h3>
                                    <button
                                        onClick={() => optimizeQuery(searchQuery)}
                                        disabled={!searchQuery.trim() || isLoading}
                                        className={`px-3 py-1 mb-2 text-xs rounded-md transition-colors flex items-center ${!searchQuery.trim() || isLoading
                                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-3 w-3 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Optimizing...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Optimize Prompt
                                            </>
                                        )}
                                    </button>
                                </div>
                                <textarea
                                    value={originalPrompt ? originalPrompt : searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;

                                        if (originalPrompt) {
                                            // agar originalPrompt show ho raha hai, to user edit kare to usi ko update karo
                                            setOriginalPrompt(value);
                                            localStorage.setItem("originalPrompt", value);
                                        } else {
                                            // warna searchQuery update hoti rahe
                                            setSearchQuery(value);

                                            // sirf pehli dafa hi originalPrompt set karo
                                            if (value.trim()) {
                                                setOriginalPrompt(value);
                                                localStorage.setItem("originalPrompt", value);
                                            }
                                        }
                                    }}
                                    className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[100px]"
                                    placeholder="Enter or edit your prompt here..."
                                />


                            </div>

                            <div className="mb-4 -mt-4">
                                <h3 className="text-sm font-medium mb-1">Optimized Prompt:</h3>
                                {isLoading ? (
                                    <div className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Optimizing your prompt...
                                    </div>
                                ) : (
                                    <textarea
                                        value={optimizedQuery}
                                        onChange={(e) => setOptimizedQuery(e.target.value)}
                                        className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px]"
                                        placeholder="Optimized prompt will appear here..."
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                {/* Previous Button with Tooltip */}
                                {/* <div className="relative group"> */}
                                {/* <button
                                        onClick={goToPreviousStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-white" />
                                    </button> */}
                                {/* Tooltip */}
                                {/* <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Add Library
                                    </div> */}
                                {/* </div> */}
                                {/* <button
                                    className="px-4 py-1 text-[13px] bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                                    onClick={() => {
                                        setOptimizedQuery(searchQuery);
                                        setShowOptimizationModal(false);
                                    }}
                                >
                                    Cancel
                                </button> */}
                                <button
                                    className={`px-4 py-1 text-[13px] rounded-md transition-colors ${!isLoading && optimizedQuery
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                        }`}
                                    disabled={isLoading || !optimizedQuery}
                                    onClick={() => {
                                        // Sirf agar originalPrompt empty hai to set karo
                                        if (!originalPrompt) {
                                            localStorage.setItem("originalPrompt", searchQuery);
                                            setOriginalPrompt(searchQuery);
                                        }

                                        setSearchQuery(optimizedQuery); // optimized prompt ko current search bana do
                                        setShowOptimizationModal(false);
                                    }}

                                >
                                    Recommend Optimized Prompt
                                </button>

                                {/* Next Button with Tooltip */}
                                {/* <div className="relative group"> */}
                                {/* <button
                                        onClick={goToNextStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </button> */}
                                {/* Tooltip */}
                                {/* <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Add Context
                                    </div> */}
                                {/* </div> */}
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {/* {showReplaceConfirmation && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-[9999]">
                        <div className="border border-gray-300 rounded-lg p-6 w-96 shadow-xl" style={{ backgroundColor: appColors.primaryColor }}>
                            <h3 className="text-lg font-semibold mb-4 text-white">Replace Prompt?</h3>
                            <p className="text-sm mb-6 text-gray-400">
                                Would you like to replace your current prompt with one from the Add-Ons?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md text-sm text-gray-800 transition-colors"
                                    onClick={handleCancelReplace}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm text-white transition-colors"
                                    onClick={handleReplace}
                                >
                                    Replace
                                </button>
                            </div>
                        </div>
                    </div>
                )} */}
                {/* Add-Ons Modal */}
                {showAddonsModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                        <div className="bg-[#2b2b4b] border rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto no-scrollbar" style={{ backgroundColor: appColors.primaryColor }}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold -mt-2">Optional Add-Ons</h2>
                                <button
                                    onClick={() => {
                                        // setShowReplaceConfirmation(false);
                                        setShowAddonsModal(false);

                                    }}
                                    className="text-white -mt-3 hover:text-gray-300 text-2xl"
                                >
                                    &times;
                                </button>
                            </div>
                            <hr className='-mx-6 -mt-2' />
                            <div className="space-y-6 mt-4">
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Industries:</label>
                                    <div className="space-y-3 max-h-64 overflow-y-auto p-2 rounded-md">
                                        {/* Professional Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("professional-services")}
                                                    onChange={() => handleGroupToggle("professional-services")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Professional Services</span>
                                            </label>
                                            {expandedGroups.includes("professional-services") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Consulting', 'Legal Services', 'Accounting', 'Staffing & Recruiting', 'Business Consulting, HR & Admin Services'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/,/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Manufacturing */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("manufacturing")}
                                                    onChange={() => handleGroupToggle("manufacturing")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Manufacturing</span>
                                            </label>
                                            {expandedGroups.includes("manufacturing") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Industrial Automation', 'Automotive & Aerospace', 'Chemicals & Plastics', 'Electrical/Electronic Manufacturing', 'Machinery'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Technology, Information & Media */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("technology-information-media")}
                                                    onChange={() => handleGroupToggle("technology-information-media")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Technology, Information & Media</span>
                                            </label>
                                            {expandedGroups.includes("technology-information-media") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['SaaS / Computer Software', 'IT Services & IT Consulting', 'Internet, Cloud, AI, Cybersecurity', 'Telecommunications', 'Publishing, Broadcast, Digital Media'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Government Administration */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("government-administration")}
                                                    onChange={() => handleGroupToggle("government-administration")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Government Administration</span>
                                            </label>
                                            {expandedGroups.includes("government-administration") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Federal & Local Government', 'Public Policy / NGOs', 'International Affairs & Development'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Financial Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("financial-services")}
                                                    onChange={() => handleGroupToggle("financial-services")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Financial Services</span>
                                            </label>
                                            {expandedGroups.includes("financial-services") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Banking', 'Insurance', 'Investment Management / Private Equity / Venture Capital', 'FinTech'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Accommodation & Food Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("accommodation-food-services")}
                                                    onChange={() => handleGroupToggle("accommodation-food-services")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Accommodation & Food Services</span>
                                            </label>
                                            {expandedGroups.includes("accommodation-food-services") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Hotels & Hospitality', 'Restaurants / Food & Beverage', 'Travel Services'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Hospitals & Health Care */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("hospitals-health-care")}
                                                    onChange={() => handleGroupToggle("hospitals-health-care")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Hospitals & Health Care</span>
                                            </label>
                                            {expandedGroups.includes("hospitals-health-care") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Hospitals', 'Pharmaceuticals', 'Biotechnology', 'Medical Devices', 'Mental Health & Wellness'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Education */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("education")}
                                                    onChange={() => handleGroupToggle("education")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Education</span>
                                            </label>
                                            {expandedGroups.includes("education") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Higher Education', 'E-Learning & Training', 'Research Institutions'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Entertainment & Media */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("entertainment-media")}
                                                    onChange={() => handleGroupToggle("entertainment-media")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Entertainment & Media</span>
                                            </label>
                                            {expandedGroups.includes("entertainment-media") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Film, Television, Music', 'Sports & Events', 'Gaming & Interactive Media'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/,/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Retail & Consumer Goods */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("retail-consumer-goods")}
                                                    onChange={() => handleGroupToggle("retail-consumer-goods")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Retail & Consumer Goods</span>
                                            </label>
                                            {expandedGroups.includes("retail-consumer-goods") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['General Retail', 'Apparel & Fashion', 'Consumer Products & Personal Care', 'Luxury Goods'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Administrative & Support Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("administrative-support-services")}
                                                    onChange={() => handleGroupToggle("administrative-support-services")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Administrative & Support Services</span>
                                            </label>
                                            {expandedGroups.includes("administrative-support-services") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Facilities Services', 'Outsourcing & BPO', 'HR Support'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Construction */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("construction")}
                                                    onChange={() => handleGroupToggle("construction")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Construction</span>
                                            </label>
                                            {expandedGroups.includes("construction") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Civil Engineering', 'Architecture & Planning', 'Residential & Commercial Construction'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Transportation, Logistics & Supply Chain */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("transportation-logistics-supply-chain")}
                                                    onChange={() => handleGroupToggle("transportation-logistics-supply-chain")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Transportation, Logistics & Supply Chain</span>
                                            </label>
                                            {expandedGroups.includes("transportation-logistics-supply-chain") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Airlines & Aviation', 'Shipping & Ports', 'Trucking & Freight', 'Warehousing & Distribution'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Consumer Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("consumer-services")}
                                                    onChange={() => handleGroupToggle("consumer-services")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Consumer Services</span>
                                            </label>
                                            {expandedGroups.includes("consumer-services") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Personal Services', 'Customer Service Operations', 'Repair & Maintenance'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Real Estate & Equipment Rental Services */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("real-estate-equipment-rental-services")}
                                                    onChange={() => handleGroupToggle("real-estate-equipment-rental-services")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Real Estate & Equipment Rental Services</span>
                                            </label>
                                            {expandedGroups.includes("real-estate-equipment-rental-services") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Real Estate Development', 'Commercial & Residential Property Management', 'Leasing & Rental Services'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Oil, Gas, and Mining */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("oil-gas-mining")}
                                                    onChange={() => handleGroupToggle("oil-gas-mining")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Oil, Gas, and Mining</span>
                                            </label>
                                            {expandedGroups.includes("oil-gas-mining") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Oil & Gas', 'Mining & Metals', 'Renewables (often cross-listed here or under "Utilities")'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\(|\)|"/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Wholesale & Trade */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("wholesale-trade")}
                                                    onChange={() => handleGroupToggle("wholesale-trade")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Wholesale & Trade</span>
                                            </label>
                                            {expandedGroups.includes("wholesale-trade") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Wholesale Distribution', 'Import/Export'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\//g, '-');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Agriculture, Farming & Forestry */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("agriculture-farming-forestry")}
                                                    onChange={() => handleGroupToggle("agriculture-farming-forestry")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Agriculture, Farming & Forestry</span>
                                            </label>
                                            {expandedGroups.includes("agriculture-farming-forestry") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Farming & Ranching', 'Agribusiness', 'Forestry & Fisheries'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Utilities */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("utilities")}
                                                    onChange={() => handleGroupToggle("utilities")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Utilities</span>
                                            </label>
                                            {expandedGroups.includes("utilities") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Power Generation & Distribution', 'Water & Waste Management', 'Renewable Energy'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Holding Companies / Conglomerates */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("holding-companies-conglomerates")}
                                                    onChange={() => handleGroupToggle("holding-companies-conglomerates")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Holding Companies / Conglomerates</span>
                                            </label>
                                            {expandedGroups.includes("holding-companies-conglomerates") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Parent Orgs & Investment Holdings'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.industry.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('industry', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience industry..."
                                        className="w-full px-4 py-2 text-white bg-[#3b3b5b] border border-white/20 rounded-md mt-3"
                                        onBlur={(e) => handleCustomAddOn('industry', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('industry', e.target.value)}
                                    />
                                </div>
                                {/* Audience Department */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Departments:</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-3">
                                        {[
                                            'Marketing', 'Sales', 'Customer Success', 'Product', 'Operations',
                                            'Finance', 'Human Resources (HR)', 'Revenue Operations (RevOps)',
                                            'Partner / Channel', 'Executive Leadership', 'Information Technology (IT)',
                                            'Legal', 'Research & Development (R&D)', 'Procurement / Supply Chain', 'C-Suite'
                                        ].map((aud) => (
                                            <label key={aud} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.audience.includes(aud.toLowerCase().replace(/ /g, '-'))}
                                                    onChange={(e) => handleAddOnChange('audience', aud.toLowerCase().replace(/ /g, '-'), e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span>{aud}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience departments..."
                                        className="w-full px-4 py-2 bg-[#3b3b5b] border border-white/20 text-white rounded-md"
                                        onBlur={(e) => handleCustomAddOn('audience', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('audience', e.target.value)}
                                    />
                                </div>

                                {/* Audience Titles - Nested Structure */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Titles:</label>
                                    <div className="space-y-3 max-h-64 overflow-y-auto p-2 rounded-md">
                                        {/* Executive */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("executive")}
                                                    onChange={() => handleGroupToggle("executive")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Executive</span>
                                            </label>
                                            {expandedGroups.includes("executive") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {[
                                                        "Chief Executive Officer",
                                                        "Chief Revenue Officer",
                                                        "Chief Sales Officer",
                                                        "Chief Marketing Officer",
                                                        "Chief Product Officer",
                                                        "Chief Financial Officer",
                                                        "Chief Customer Officer",
                                                    ].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, "-");
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) =>
                                                                        handleAddOnChange("audienceTitles", key, e.target.checked)
                                                                    }
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Marketing */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("marketing")}
                                                    onChange={() => handleGroupToggle("marketing")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Marketing</span>
                                            </label>
                                            {expandedGroups.includes("marketing") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Marketing Manager', 'Senior Marketing Manager', 'Head of Marketing', 'Director of Marketing', 'VP of Marketing', 'Chief Marketing Officer (CMO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sales */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("sales")}
                                                    onChange={() => handleGroupToggle("sales")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Sales</span>
                                            </label>
                                            {expandedGroups.includes("sales") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Sales Manager', 'Regional Sales Manager', 'Director of Sales', 'VP of Sales', 'Head of Sales / Sales Leader', 'Chief Revenue Officer (CRO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Customer Success */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("customer-success")}
                                                    onChange={() => handleGroupToggle("customer-success")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Customer Success</span>
                                            </label>
                                            {expandedGroups.includes("customer-success") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Customer Success Manager (CSM)', 'Senior Customer Success Manager', 'Head of Customer Success', 'Director of Customer Success', 'VP of Customer Success', 'Chief Customer Officer (CCO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Customer Experience (CX) */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("customer-experience")}
                                                    onChange={() => handleGroupToggle("customer-experience")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Customer Experience (CX)</span>
                                            </label>
                                            {expandedGroups.includes("customer-experience") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Customer Experience Manager', 'CX Program Manager', 'Director of Customer Experience', 'VP of Customer Experience', 'Head of Customer Experience', 'Chief Experience Officer (CXO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Technology / IT */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("technology-it")}
                                                    onChange={() => handleGroupToggle("technology-it")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Technology / IT</span>
                                            </label>
                                            {expandedGroups.includes("technology-it") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['IT Manager / Infrastructure Manager', 'Engineering Manager', 'Director of IT / Director of Engineering', 'VP of IT / VP of Engineering', 'Head of Technology', 'Chief Technology Officer (CTO)', 'Chief Information Officer (CIO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Finance */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("finance")}
                                                    onChange={() => handleGroupToggle("finance")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Finance</span>
                                            </label>
                                            {expandedGroups.includes("finance") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Finance Manager', 'Senior Finance Manager', 'Controller', 'Director of Finance', 'VP of Finance', 'Head of Finance', 'Chief Financial Officer (CFO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Product */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("product")}
                                                    onChange={() => handleGroupToggle("product")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Product</span>
                                            </label>
                                            {expandedGroups.includes("product") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Product Manager', 'Senior Product Manager', 'Group Product Manager', 'Director of Product Management', 'VP of Product', 'Head of Product', 'Chief Product Officer (CPO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Human Resources (HR / People Ops) */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("human-resources")}
                                                    onChange={() => handleGroupToggle("human-resources")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Human Resources (HR / People Ops)</span>
                                            </label>
                                            {expandedGroups.includes("human-resources") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['HR Manager', 'Talent Acquisition Manager', 'People Operations Manager', 'Director of HR / Director of People', 'VP of HR / VP of People', 'Head of People / Head of HR', 'Chief Human Resources Officer (CHRO)', 'Chief People Officer (CPO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Legal */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("legal")}
                                                    onChange={() => handleGroupToggle("legal")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Legal</span>
                                            </label>
                                            {expandedGroups.includes("legal") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Legal Counsel (Manager-level equivalent)', 'Legal Manager / Senior Legal Manager', 'Director of Legal', 'VP of Legal', 'General Counsel', 'Chief Legal Officer (CLO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Procurement / Supply Chain */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("procurement-supply-chain")}
                                                    onChange={() => handleGroupToggle("procurement-supply-chain")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Procurement / Supply Chain</span>
                                            </label>
                                            {expandedGroups.includes("procurement-supply-chain") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Procurement Manager', 'Strategic Sourcing Manager', 'Supply Chain Manager', 'Director of Procurement', 'Director of Supply Chain', 'VP of Procurement / VP of Supply Chain', 'Head of Procurement', 'Chief Procurement Officer (CPO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Operations */}
                                        <div className="border-b border-white/10 pb-2">
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={expandedGroups.includes("operations")}
                                                    onChange={() => handleGroupToggle("operations")}
                                                    className="w-4 h-4"
                                                />
                                                <span className="font-medium">Operations</span>
                                            </label>
                                            {expandedGroups.includes("operations") && (
                                                <div className="ml-6 mt-2 grid grid-cols-1 gap-2">
                                                    {['Operations Manager', 'Business Operations Manager', 'Director of Operations', 'VP of Operations', 'Head of Operations', 'Chief Operating Officer (COO)'].map((item) => {
                                                        const key = item.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
                                                        return (
                                                            <label key={item} className="flex items-center space-x-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={addOns.audienceTitles.includes(key)}
                                                                    onChange={(e) => handleAddOnChange('audienceTitles', key, e.target.checked)}
                                                                    className="w-4 h-4"
                                                                />
                                                                <span className="text-sm">{item}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom audience title..."
                                        className="w-full px-4 py-2 text-white bg-[#3b3b5b] border border-white/20 rounded-md mt-3"
                                        onBlur={(e) => handleCustomAddOn('audienceTitles', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('audienceTitles', e.target.value)}
                                    />
                                </div>

                                {/* Audience Tones */}
                                <div>
                                    <label className="block font-semibold mb-3 text-lg border-b pb-2">Audience Tones:</label>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        {['Executive-Ready', 'Professional & Polished', 'Conversational & Relatable', 'Insightful & Analytical', 'Challenger / Contrarian', 'Persuasive & Compelling', 'Visionary / Futuristic', 'Trusted Advisor', 'Storytelling / Narrative', 'Succinct & Direct', 'Optimistic & Inspiring', 'Consultative', 'Data-Backed / Research-Driven', 'Peer-to-Peer', 'Urgent & Action-Oriented'].map((tone) => (
                                            <label key={tone} className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={addOns.tone.includes(tone.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-'))}
                                                    onChange={(e) => handleAddOnChange('tone', tone.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\//g, '-'), e.target.checked)}
                                                    className="w-4 h-4"
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
                                        value={addOns.objective}
                                        onChange={(e) => handleAddOnChange('objective', e.target.value)}
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
                                                value={addOns.advice.do.join('\n')}
                                                onChange={(e) => {
                                                    const dos = e.target.value.split('\n').filter(item => item.trim());
                                                    setAddOns(prev => ({
                                                        ...prev,
                                                        advice: {
                                                            ...prev.advice,
                                                            do: dos
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 bg-[#3b3b5b] text-white border border-white/20 rounded-md h-32"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2">Don'ts</h4>
                                            <textarea
                                                placeholder="Enter don'ts..."
                                                value={addOns.advice.dont.join('\n')}
                                                onChange={(e) => {
                                                    const donts = e.target.value.split('\n').filter(item => item.trim());
                                                    setAddOns(prev => ({
                                                        ...prev,
                                                        advice: {
                                                            ...prev.advice,
                                                            dont: donts
                                                        }
                                                    }));
                                                }}
                                                className="w-full px-4 py-2 bg-[#3b3b5b] text-white border border-white/20 rounded-md h-32"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                {/* <button
                                    onClick={() => {
                                        // setShowReplaceConfirmation(false);
                                        setShowAddonsModal(false);

                                    }}
                                    className=" text-[13px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button> */}
                                <button
                                    onClick={() => {
                                        setShowAddonsModal(false);
                                    }}
                                    className="text-[13px] text-white px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    Apply Add-Ons
                                </button>
                                <div className="relative group">
                                    <button
                                        onClick={goToPreviousStep}
                                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-white" />
                                    </button>
                                    {/* Tooltip */}
                                    <div className="absolute -top-9 -left-1/2 -translate-x-1/2 
                    bg-black/80 text-white text-xs rounded-md px-2 py-1 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Add Context
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                )}

                {/* Guideline Modal */}
                {showGuideline && (
                    <GuidelineModal
                        step={currentGuidelineStep}
                        onNext={handleGuidelineAction}
                        onSkip={handleGuidelineSkip}
                        onClose={handleGuidelineClose}
                        totalSteps={totalGuidelineSteps}
                    />
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
        </div >
    );
};

export default Assistant;
