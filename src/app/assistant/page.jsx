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


const GuidelineModal = ({ step, onNext, onSkip, onClose, totalSteps }) => {
    const guidelines = [
        {
            title: "Enhance Your Search with Library",
            description: "Access pre-built prompts and templates to get started quickly with common tasks.",
            button: "Open Library",
            skip: "Skip"
        },
        {
            title: "Optimize Your Query for Better Results",
            description: "Get suggestions to improve your prompt and professionalize your query with one click.",
            button: "Optimize Query",
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
            <div className="rounded-lg p-6 w-full max-w-md mx-4" style={{ backgroundColor: appColors.primaryColor }}>
                <div className="flex justify-between items-center mb-4 -mt-2">
                    <h2 className="text-xl font-bold ">Getting Started</h2>

                    <button
                        onClick={onClose}
                        className=" hover:text-gray-500"
                    >
                        &times;
                    </button>
                </div>
                <hr className='border-b -mx-6 -mt-2 mb-2' />
                <div className="mb-6">
                    <h3 className="text-lg font-semibold  mb-2">{currentGuideline.title}</h3>
                    <p className="text-gray-500">{currentGuideline.description}</p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={onSkip}
                            className="px-2 py-1 rounded-md  hover:text-gray-400 border"
                        >
                            {currentGuideline.skip}
                        </button>
                        <button
                            onClick={onNext}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
    const [addOns, setAddOns] = useState({
        industry: [],
        audience: [],
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
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showGuideline, setShowGuideline] = useState(false);
    const [currentGuidelineStep, setCurrentGuidelineStep] = useState(0);
    const [pendingSubmit, setPendingSubmit] = useState(false); // Add this state
    const totalGuidelineSteps = 4;


    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [currentMessages]);

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

    useEffect(() => {
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

        optimizeQuery();
    }, [showOptimizationModal, searchQuery]);

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

    const tabs = [
        { id: 'uplode', label: '+' },
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

    const handleTabClick = async (tabId) => {
        setActiveTab(tabId);

        if (tabId === 'context') {
            setShowContextModal(true);
            setHasSearched(true);
        } else if (tabId === 'business') {
            if (!searchQuery.trim()) {
                ShowCustomToast('Please enter a query first', 'info', 2000);
                return;
            }
            setShowOptimizationModal(true);
            setHasSearched(true);
        } else if (tabId === 'addons') {
            setShowAddonsModal(true);
            setHasSearched(true);
        } else if (tabId === 'library') {
            setActiveTab('library');
            setShowLibraryDropdown(!showLibraryDropdown);
            setHasSearched(true);
            setShowAddonsDropdown(false);
            setSelectedAddOn(null);
        } else if (tabId === 'uplode') {
            setHasSearched(true);
            fileInputRef.current.click();
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
            processedDescription: processedContent  // This now contains the fully processed template
        }]);
    };
    const handleFileUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const userId = localStorage.getItem('current_user_id');
        const uploadedDocumentIds = [];

        // Store file info for display
        const newFiles = Array.from(files).map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            file // keep the file object for upload
        }));
        setSelectedFiles([...selectedFiles, ...newFiles]);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const filePath = `${userId}/${Date.now()}-${file.name}`;

                // Upload file to storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('uploaded-documents')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Create record in database
                const { data: dbData, error: dbError } = await supabase
                    .from('lib_uploaded_doc')
                    .insert([
                        {
                            user_id: userId,
                            uploded_doc_url: filePath,
                            document_name: file.name,

                        }
                    ])
                    .select('id');

                if (dbError) throw dbError;

                if (dbData && dbData[0]) {
                    uploadedDocumentIds.push(dbData[0].id);
                }
            }

            // ShowCustomToast('File(s) uploaded successfully!', 'success');
            setSelectedUploadedDocuments([...selectedUploadedDocuments, ...uploadedDocumentIds]);
        } catch (error) {
            console.log('Upload error:', error);
            ShowCustomToast('Error uploading file(s)', 'error');
            // Remove failed files from display
            setSelectedFiles(selectedFiles.filter(f => !newFiles.some(nf => nf.name === f.name)));
        } finally {
            setUploading(false);
        }
    };
    const handleRemoveFile = (index) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

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

            // For industry, audience, tone
            const newArray = isChecked
                ? [...prev[type], value]
                : prev[type].filter(item => item !== value);
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
        if (searchQuery.trim()) {
          setShowOptimizationModal(true);
          setShowGuideline(false);
        } else {
          setShowGuideline(false);
          ShowCustomToast('Please enter a query first to optimize', 'info');
          return;
        }
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
    
    // Check if submit should be enabled
    const isSubmitEnabled = searchQuery.trim() || selectedDocs.length > 0 || selectedPromptId;

    return (
        <div className="w-full flex" style={{ backgroundColor: appColors.primaryColor, minHeight: '90%' }}>
            {/* Conversations sidebar */}
            <div className="w-64 border-r border-gray-700 overflow-y-auto relative no-scrollbar" style={{ height: '85vh' }}>
                {/* Sticky header with conversation title and new chat button */}
                <div className="sticky top-0 z-10 bg-[#2b2b4b] p-4 pb-0">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-xl font-semibold text-white -mt-[6px]">Conversations</h2>
                    </div>
                    <hr className="border-gray-500 -mx-4" />
                </div>

                {/* Conversation list with padding */}
                <div className="p-4 pt-2">
                    {isLoading && conversations.length === 0 ? (
                        <div className="flex justify-center items-center h-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.conversation_id}
                                    className={`p-3 rounded-lg cursor-pointer ${selectedConversation === conv.conversation_id ? 'bg-blue-600' : 'bg-white/10 hover:bg-white/20'}`}
                                    onClick={() => handleConversationSelect(conv.conversation_id)}
                                >
                                    <p className="text-white text-sm truncate">{conv.title || `Conversation ${conv.conversation_id.slice(-4)}`}</p>
                                    {/* <p className="text-xs text-white/60">{new Date(conv.created_at || Date.now()).toLocaleString()}</p> */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col">
                <div className={`w-full flex-1 flex flex-col ${hasSearched ? 'justify-end' : 'justify-center'} items-center`}>
                    {/* Chat history container with scroll */}
                    <div
                        ref={chatContainerRef}
                        className="w-full max-w-4xl mb-4 mt-4 overflow-y-auto no-scrollbar"
                        style={{ maxHeight: '65vh' }}
                    >
                        {/* Always show existing messages */}
                        {currentMessages.length > 0 && (
                            currentMessages.map((msg, index) => (
                                <div key={`${msg.id}-${index}`} className="w-full space-y-4 mb-6">
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`rounded-lg px-4 py-2 max-w-3xl break-words overflow-hidden ${msg.role === 'user' ? 'bg-white/10 text-white' : 'text-white'}`}>
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // Headings with gradient text
                                                    h1: ({ node, ...props }) => (
                                                        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent" {...props} />
                                                    ),
                                                    h2: ({ node, ...props }) => (
                                                        <h2 className="text-xl font-semibold mb-3 mt-4 bg-gradient-to-r from-blue-300 to-purple-400 bg-clip-text text-transparent" {...props} />
                                                    ),
                                                    h3: ({ node, ...props }) => (
                                                        <h3 className="text-lg font-medium mb-2 mt-3 text-gray-200" {...props} />
                                                    ),

                                                    // Lists with custom bullets
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-blue-400" {...props} />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-blue-400 marker:font-bold" {...props} />
                                                    ),
                                                    li: ({ node, ...props }) => (
                                                        <li className="mb-1.5 pl-1.5" {...props} />
                                                    ),

                                                    // Paragraphs with better line height
                                                    p: ({ node, ...props }) => (
                                                        <p className="leading-relaxed text-gray-100" {...props} />
                                                    ),

                                                    // Enhanced table styling
                                                    table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-sm mb-4">
                                                            <table className="min-w-full divide-y divide-gray-700" {...props} />
                                                        </div>
                                                    ),
                                                    thead: ({ node, ...props }) => (
                                                        <thead className="bg-gradient-to-r from-gray-700 to-gray-800" {...props} />
                                                    ),
                                                    tbody: ({ node, ...props }) => (
                                                        <tbody className="divide-y divide-gray-700" {...props} />
                                                    ),
                                                    tr: ({ node, ...props }) => (
                                                        <tr className="hover:bg-gray-800/50 transition-colors duration-150" {...props} />
                                                    ),
                                                    th: ({ node, ...props }) => (
                                                        <th
                                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                                                            {...props}
                                                        />
                                                    ),
                                                    td: ({ node, ...props }) => (
                                                        <td className="px-4 py-3 text-sm text-gray-200" {...props} />
                                                    ),

                                                    // Code blocks with syntax highlighting feel
                                                    code: ({ node, inline, ...props }) => inline ? (
                                                        <code className="bg-gray-700 px-1.5 py-0.5 rounded-md text-sm font-mono text-purple-300" {...props} />
                                                    ) : (
                                                        <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 shadow-inner">
                                                            <pre className="p-3 overflow-x-auto text-sm font-mono text-gray-200">
                                                                <code {...props} />
                                                            </pre>
                                                        </div>
                                                    ),

                                                    // Blockquotes with elegant styling
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote
                                                            className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-4 py-2 bg-gray-800/50 rounded-r-lg"
                                                            {...props}
                                                        />
                                                    ),

                                                    // Links with hover effect
                                                    a: ({ node, ...props }) => (
                                                        <a
                                                            className="text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            {...props}
                                                        />
                                                    )
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
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
                            <div className="h-full flex items-center justify-center">
                                <h1 className="text-2xl font-bold" style={{ color: appColors.textColor }}>
                                    {conversations.length === 0 ? 'How can I help you today?' : 'Choose a conversation or begin a new one!'}
                                </h1>
                            </div>
                        )}
                    </div>

                    {/* Input area - fixed at bottom */}
                    <div className="w-full max-w-4xl sticky bottom-4 bg-transparent pt-4">
                        {selectedDocTitles.length > 0 || selectedSourceTitles.length > 0 || selectedLibraryDocTitles.length > 0 || selectedFiles.length > 0 || selectedPromptTitle ? (
                            <div className="w-full max-w-[890px] mb-2"> {/* Fixed width container */}
                                <div className="relative">
                                    {/* Scrollable area for all tags */}
                                    <div className="overflow-x-auto whitespace-nowrap no-scrollbar pb-2 -mb-2">
                                        <div className="inline-flex gap-2 min-w-min">
                                            {/* Prompt Title */}
                                            {selectedPromptTitle && (
                                                <span className="inline-flex items-center text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
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

                                            {/* Document Titles */}
                                            {selectedDocTitles.map(doc => (
                                                <span
                                                    key={doc.id}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                    {doc.title}
                                                    <button
                                                        onClick={() => handleDocSelect(doc.id, doc.title)}
                                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}

                                            {/* Source Titles */}
                                            {selectedSourceTitles.map(source => (
                                                <span
                                                    key={source.id}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                    {source.title}
                                                    <button
                                                        onClick={() => handleSourceSelect(source.id, source.title)}
                                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}

                                            {/* Library Document Titles */}
                                            {/* {selectedLibraryDocTitles.map(source => (
                                                <span
                                                    key={source.id}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                    {source.title}
                                                    <button
                                                        onClick={() => handleLibraryDocsSelect(source.id, source.title)}
                                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))} */}

                                            {/* Files */}
                                            {selectedFiles.map((file, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                                >
                                                    {file.name}
                                                    <button
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Optional: Fade effect to indicate scrollable area */}
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#your-bg-color] to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        ) : null}

                        <div className="relative w-full">
                            <textarea
                                placeholder="Ask anything"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pt-3 pb-3 p-4 pr-36 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto transition-all duration-200 ${isExpanded ? 'rounded-xl' : 'rounded-full'
                                    }`}
                                style={{
                                    backgroundColor: appColors.primaryColor,
                                    minHeight: '50px',
                                    maxHeight: '200px',
                                    height: 'auto',
                                }}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    const newHeight = Math.min(e.target.scrollHeight, 200);
                                    e.target.style.height = newHeight + 'px';

                                    setIsExpanded(newHeight > 50); // Switch when height increases beyond base
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && isSubmitEnabled) {
                                        e.preventDefault();
                                        handleSubmit();

                                        // Reset height and rounding
                                        setTimeout(() => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = '50px';
                                            setIsExpanded(false);
                                        }, 100);
                                    }
                                }}
                                rows={1}
                            />
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                multiple
                                onChange={handleFileUpload}
                                accept="*"
                                ref={fileInputRef}
                            />
                            {/* Toggle Switch */}
                           <div className="relative group">
                                <div className="absolute right-14 -top-10 group cursor-pointer" onClick={() => setIsPromptMode((prev) => !prev)}>
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
                            </div>
                            <div className="relative group">
                                {/* Tooltip */}
                                {!searchQuery && (
                                    <div className="absolute -top-0 -right-10 -translate-x-1/2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Please input text
                                    </div>
                                )}
                                {/* Submit Button */}
                               <button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !isSubmitEnabled || !searchQuery}
                                    className="absolute right-2 -top-[48px] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 cursor-pointer"
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

                />

                {/* Library Modal */}
                <PromptLibraryModal
                    showLibraryDropdown={showLibraryDropdown}
                    setShowLibraryDropdown={setShowLibraryDropdown}
                    onSourceSelect={handleSourceSelect}
                    onLibraryDocsSelect={handleLibraryDocsSelect}
                    selectedLibraryDocs={selectedLibraryDocs}
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
                                <h3 className="text-sm font-medium mb-1 mt-4">Original Query:</h3>
                                <div className="bg-white/5 p-3 rounded-lg mb-3 text-sm">
                                    <p>{searchQuery}</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-sm font-medium mb-1">Optimized Query:</h3>
                                {isLoading ? (
                                    <div className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Optimizing your query...
                                    </div>
                                ) : (
                                    <textarea
                                        value={optimizedQuery}
                                        onChange={(e) => setOptimizedQuery(e.target.value)}
                                        className="w-full bg-white/5 p-3 rounded-lg mb-3 text-sm min-h-[150px]"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-2 py-1 text-[13px] bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                    onClick={() => {
                                        setOptimizedQuery(searchQuery);
                                        setShowOptimizationModal(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={`text-[13px] text-white px-4 py-1 rounded-md transition-colors ${!isLoading && optimizedQuery ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'
                                        }`}
                                    disabled={isLoading || !optimizedQuery}
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
                                                    checked={addOns.industry.includes(item.toLowerCase())}
                                                    onChange={(e) => handleAddOnChange('industry', item.toLowerCase(), e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <span>{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Add custom industry..."
                                        className="w-full px-4 py-2 text-white bg-[#3b3b5b] border border-white/20 rounded-md"
                                        onBlur={(e) => handleCustomAddOn('industry', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('industry', e.target.value)}
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
                                        placeholder="Add custom audience..."
                                        className="w-full px-4 py-2 bg-[#3b3b5b] border border-white/20 text-white rounded-md"
                                        onBlur={(e) => handleCustomAddOn('audience', e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCustomAddOn('audience', e.target.value)}
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
                                                    checked={addOns.tone.includes(tone.toLowerCase())}
                                                    onChange={(e) => handleAddOnChange('tone', tone.toLowerCase(), e.target.checked)}
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
                                <button
                                    onClick={() => setShowAddonsModal(false)}
                                    className=" text-[13px] px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddonsModal(false);
                                    }}
                                    className="text-[13px] text-white px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                >
                                    Apply Add-Ons
                                </button>
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
        </div>
    );
};

export default Assistant;
