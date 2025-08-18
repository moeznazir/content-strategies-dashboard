import { FaTimes, FaCopy, FaChevronDown, FaChevronUp, FaEye, FaDownload } from "react-icons/fa";
import { appColors } from "@/lib/theme";
import { useState } from "react";

const GenericModal = ({ data, onClose }) => {
    const [copiedField, setCopiedField] = useState(null);
    const [collapsedSections, setCollapsedSections] = useState({});
    const [expandedFields, setExpandedFields] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // List of fields to hide as specified
    const HIDDEN_FIELDS = [
        'id',
        'Avatar',
        'Guest',
        'Video Title',
        'Guest Role',
        'Video Description',
        'Transcript',
        'Text comments for the rating (OPTIONAL input from the user)',
        'Episode Title',
        'Guest Company',
        'Quote',
        'Video Length',
        'Mentions',
        'Mentioned_Quotes',
        'Client',
        'Employee',
        'Guest Title',
        'Public_vs_Private',
        'Podbook Link',
        'Article - Extended Media',
        'YouTube Short - Extended Media',
        'YouTube Link',
        'Videos',
        'Videos Link',
        'Challenge Report_Unedited Video Link',
        'Challenge Report_Unedited Transcript Link',
        'Challenge Report_Summary',
        'Podcast Report_Unedited Video Link',
        'Podcast Report_Unedited Transcript Link',
        'Podcast Report_Summary',
        'Post-Podcast Report_Unedited Video Link',
        'Post-Podcast Report_Unedited Transcript Link',
        'Post-Podcast Report_Summary',
        'LinkedIn Video - Extended Media',
        'Post_Podcast_Insights',
        'Article_Transcript',
        'LinkedIn_Video_Transcript',
        'Case_Study',
        'Case_Study_Transcript',
        'YouTube_Short_Transcript',
        'Quote Card - Extended Media',
        'Private Link - Post-Podcast 1',
        'Private Link - Post-Podcast 2',
        'Discussion Guide',
        'Guest Industry',
        'report_link',
        'Full Case Study_Interactive Link',
        'Full Case Study_Copy and Paste Text',
        'Full Case Study_Link To Document',
        'Problem Section_Video Link',
        'Problem Section_Copy and Paste Text',
        'Problem Section_Link To Document',
        'Solution Section_Video Link',
        'Solution Section_Copy and Paste Text',
        'Solution Section_Link To Document',
        'Results Section_Video Link',
        'Results Section_Copy and Paste Text',
        'Results Section_Link To Document',
        'Case Study Video Short_Video Link',
        'Case Study Video Short_Copy and Paste Text',
        'Case Study Video Short_Link To Document',
        'Case Study Other Video_Video Title',
        'Case Study Other Video_Video Link',
        'Case Study Other Video_Copy and Paste Text',
        'Case Study Other Video_Link To Document',
        'Tags',
        'Video_ID',
        'ranking',
        'Ranking Justification',
        'Date Recorded',
        'Episode_Number',
        'total_count',
        'mentioned_count',
        'private_count',
        'public_count',
        'total_count',
        'client_count',
        'employee_count'
    ];


    const handlePreview = async (url) => {
        if (!url) return;
        setErrorMessage(null);
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                setPreviewUrl(url);
            } else {
                setErrorMessage("Unable to open document: The link is not accessible");
            }
        } catch (error) {
            setErrorMessage("Unable to open document: The link is invalid or not accessible");
        }
    };

    // Format label text (convert DETAILS_FULL_EPISODES to Details Full Episodes)
    const formatLabel = (label) => {
        // First replace underscores with spaces
        let formatted = label.replace(/_/g, ' ');
        // Then capitalize first letter of each word and lowercase the rest
        formatted = formatted.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        return formatted;
    };

    // Automatically detect sections from data keys
    const detectSections = () => {
        const sections = {};

        Object.keys(data).forEach(key => {
            // Skip hidden fields
            if (HIDDEN_FIELDS.includes(key)) {
                return;
            }

            // Skip normalized fields that are handled separately
            if (['Themes', 'Validations', 'Objections', 'Challenges', 'Sales Insights',
                'Case_Study_Other_Video', 'Video Type'].includes(key)) {
                return;
            }

            // Check if the value is an array of objects (like your structure)
            if (Array.isArray(data[key]) && data[key].length > 0 && typeof data[key][0] === 'object') {
                sections[key] = {
                    title: formatLabel(key),
                    data: data[key]
                };
            }
            // Check if the value is a single object
            else if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
                sections[key] = {
                    title: formatLabel(key),
                    data: [data[key]] // Wrap in array for consistent handling
                };
            }
            // Handle string values or empty arrays
            else {
                sections[key] = {
                    title: formatLabel(key),
                    data: data[key] === null || data[key] === '' ? [] : [{ [key]: data[key] }]
                };
            }
        });

        return sections;
    };

    const sections = detectSections();

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const toggleExpandField = (fieldId) => {
        setExpandedFields(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    const copyToClipboard = (text, fieldName) => {
        if (typeof text === 'object') {
            text = JSON.stringify(text, null, 2);
        }
        navigator.clipboard.writeText(text)
            .then(() => {
                setCopiedField(fieldName);
                setTimeout(() => setCopiedField(null), 1500);
            })
            .catch(err => {
                console.log('Failed to copy text: ', err);
            });
    };

    const shouldShowPreviewIcon = (key) => {
        // Fields that should show preview icon based on your other modals
        const previewFields = [
            'transcript', 'details', 'text', 'email', 'report',
             'comments', 'hashtags', 'guide', 'video details',
            'insights', 'vision', 'challenge report','ebooks','cold','guest','warm','short and long-tail seo keywords'
        ];

        return previewFields.some(field => key.toLowerCase().includes(field));
    };

    const hasValidData = (item) => {
        return Object.values(item).some(value => {
            if (value === null || value === undefined || value === '') return false;
            if (typeof value === 'object' && Object.keys(value).length === 0) return false;
            return true;
        });
    };

    const renderFieldValue = (value, fieldId, fieldKey) => {
        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-400 text-sm">N/A</span>;
        }

        if (typeof value === 'object' && Object.keys(value).length === 0) {
            return <span className="text-gray-400 text-sm">Empty</span>;
        }

        if (typeof value === 'object') {
            return (
                <pre className="text-sm bg-gray-700 p-2 rounded overflow-x-auto text-gray-300">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
        }

        if (typeof value === 'string' && value.startsWith('http')) {
            return (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all underline"
                >
                    {value.length > 90 ? `${value.substring(0, 90)}...` : value}
                </a>
            );
        }

        const isExpanded = expandedFields[fieldId];
        const displayText = isExpanded ? value : (value.length > 100 ? `${value.substring(0, 100)}...` : value);

        return (
            <div className="text-gray-300 whitespace-pre-wrap text-sm">
                {displayText}
                {value.length > 100 && (
                    <button
                        onClick={() => toggleExpandField(fieldId)}
                        className="text-blue-400 hover:text-blue-300 ml-1 text-xs"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        );
    };

    const renderSection = (sectionId, sectionData) => {
        if (collapsedSections[sectionId] === undefined) {
            setCollapsedSections(prev => ({ ...prev, [sectionId]: true }));
            return null;
        }

        const hasData = sectionData.data.some(item => hasValidData(item));

        return (
            <div key={sectionId} className="mb-6">
                <div
                    className={`flex justify-between items-center cursor-pointer p-3 rounded-lg hover:bg-white/10 border border-gray-600 transition-all duration-200 ${collapsedSections[sectionId] ? 'bg-gray-800/50' : 'bg-gray-800/70 shadow-md'}`}
                    onClick={() => toggleSection(sectionId)}
                >
                    <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                        <span className=" px-2 py-1 rounded-md text-sm">
                            {sectionData.title}
                        </span>
                    </h3>
                    {collapsedSections[sectionId] ? (
                        <FaChevronDown className="text-gray-400 transition-transform duration-200" />
                    ) : (
                        <FaChevronUp className="text-gray-400 transition-transform duration-200" />
                    )}
                </div>

                {!collapsedSections[sectionId] && (
                    <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-600 ml-3">
                        {hasData ? (
                            sectionData.data.map((item, index) => {
                                if (!hasValidData(item)) return null;

                                return (
                                    <div 
                                        key={index} 
                                        className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 shadow-md hover:shadow-lg transition-shadow duration-200"
                                    >
                                        {Object.entries(item).map(([key, value]) => {
                                            if (sectionId.toLowerCase().includes('emails') && key.toLowerCase() === 'category') {
                                                return null;
                                            }
                                            const fieldId = `${sectionId}-${key}-${index}`;
                                            const showPreview = shouldShowPreviewIcon(key) && typeof value === 'string' && value.trim().length > 0;

                                            return (
                                                <div key={key} className="mb-4 last:mb-0 group">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="font-medium text-gray-300 flex items-center gap-2">
                                                            <span className=" px-2 py-0.5 rounded text-sm bold">
                                                                {formatLabel(key)}
                                                            </span>
                                                        </label>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {copiedField === fieldId && (
                                                                <span className="text-xs text-green-400 animate-pulse">Copied!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1 border border-gray-600 p-3 rounded  shadow-inner">
                                                            {renderFieldValue(value, fieldId, key)}
                                                        </div>
                                                        <div className="flex flex-col gap-2 mt-1">
                                                            <button
                                                                onClick={() => copyToClipboard(value, fieldId)}
                                                                className="p-1 text-yellow-300 hover:text-white bg-yellow-600/20 rounded hover:bg-yellow-600/40 transition-colors"
                                                                title="Copy"
                                                            >
                                                                <FaCopy size={14} />
                                                            </button>
                                                            {showPreview && (
                                                                <button
                                                                    onClick={() => handlePreview(value)}
                                                                    className="p-1 text-blue-300 hover:text-white bg-blue-600/20 rounded hover:bg-blue-600/40 transition-colors"
                                                                    title="Preview"
                                                                >
                                                                    <FaEye size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-4 rounded-lg border border-gray-600 bg-gray-800/40 text-gray-400 text-center shadow-inner">
                                No data available
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };
    return (
        <>
            {/* Document Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-[#1a1b41]">
                            <h2 className="text-lg font-semibold">Document Preview</h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = previewUrl;
                                        link.target = '_blank';
                                        link.rel = 'noopener noreferrer';
                                        link.download = '';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                    title="Download"
                                >
                                    <FaDownload size={20} />
                                </button>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <iframe
                                src={previewUrl}
                                title="Document Preview"
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message Modal */}
            {errorMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex items-center justify-center p-6">
                    <div className="bg-[#1a1b41] rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Error</h2>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <p className="text-red-400 mb-4">{errorMessage}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
                <div
                    className="p-6 rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-lg bg-[#1a1b41]"
                >
                    {/* Header */}
                    <div className="sticky top-0 py-2 flex justify-between items-center z-10 mb-2"
                        style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                        <h2 className="text-xl font-bold -mt-4">CONTENT DETAILS</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 -mt-2">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    <hr className="border-b border-gray-600 -mx-6 mb-4" />

                    {/* Main Content */}
                    <div className="space-y-4">
                        {Object.entries(sections).map(([sectionId, sectionData]) =>
                            renderSection(sectionId, sectionData)
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GenericModal;