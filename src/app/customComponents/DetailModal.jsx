import { FaTimes, FaCopy, FaExpand, FaCompress } from "react-icons/fa";
import { appColors } from "@/lib/theme";
import { useState } from "react";

const Modal = ({ data, onClose }) => {
    const [expandedFields, setExpandedFields] = useState({});
    const [copiedField, setCopiedField] = useState(null);

    // Array fields that should be displayed as tags
    const arrayFields = [
        "Video Type",
        // "Tags",
        "Mentions"
    ];

    // Special fields that need custom rendering
    const specialFields = ["Themes", "Validations", "Objections", "Challenges", 'Sales Insights'];
    const reportSections = [
        {
            title: "Challenge Report",
            fields: [
                "Challenge Report_Unedited Video Link",
                "Challenge Report_Unedited Transcript Link",
                "Challenge Report_Summary"
            ]
        },
        {
            title: "Podcast Report",
            fields: [
                "Podcast Report_Unedited Video Link",
                "Podcast Report_Unedited Transcript Link",
                "Podcast Report_Summary"
            ]
        },
        {
            title: "Post-Podcast Report",
            fields: [
                "Post-Podcast Report_Unedited Video Link",
                "Post-Podcast Report_Unedited Transcript Link",
                "Post-Podcast Report_Summary"
            ]
        }
    ];
    // Define the exact order of fields we want to display
    const fieldOrder = [
        "Avatar",
        "Guest",
        "Likes",
        "Comments",
        "Guest Title",
        "Guest Company",
        "Guest Industry",
        "Guest Role",
        "Date Recorded",
        "Episode_Number",
        "Episode Title",
        "Video Type",
        "Video Title",
        "Video Length",
        "Video Description",
        "Text comments for the rating (OPTIONAL input from the user)",
        "Quote",
        "Mentions",
        "Public_vs_Private",
        "Discussion Guide",
        "Transcript",
        "Article - Extended Media",
        "Client",
        "Employee",
        // "Tags",
        "Themes",
        "Validations",
        "Objections",
        "Challenges",
        "Sales Insights",
        "Videos",
        "Challenge Report_Unedited Video Link",
        "Challenge Report_Unedited Transcript Link",
        "Challenge Report_Summary",
        "Podcast Report_Unedited Video Link",
        "Podcast Report_Unedited Transcript Link",
        "Podcast Report_Summary",
        "Post-Podcast Report_Unedited Video Link",
        "Post-Podcast Report_Unedited Transcript Link",
        "Post-Podcast Report_Summary",
        "LinkedIn Video - Extended Media",
        "Podbook Link",
        "Private Link - Post-Podcast 1",
        "Private Link - Post-Podcast 2",
        "Quote Card - Extended Media"
    ];

    const getDisplayName = (key) => {
        const nameMap = {
            "Text comments for the rating (OPTIONAL input from the user)": "Top Three Takeaways",
            "Episode_Number": "Episode #",
            "Episode Title": "Full Episode Title",
            "Article - Extended Media": "Article",
            "Quote Card - Extended Media": "Quote Card",
            "Quote": "Key Quote",
            "Public_vs_Private": "Public vs. Private"
        };
        return nameMap[key] || key;
    };

    // Filter and sort the data according to our fieldOrder
    const filteredData = fieldOrder
        .filter(key => data[key] !== undefined && data[key] !== null && data[key] !== "")
        .map(key => ({
            key,
            value: data[key],
            label: getDisplayName(key)
        }));

    const toggleExpand = (fieldName) => {
        setExpandedFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const copyToClipboard = (text, fieldName) => {
        if (typeof text === 'object') {
            text = JSON.stringify(text);
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

    const renderSpecialField = (key, value) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
            return <div className="text-gray-400 text-sm">No data available</div>;
        }

        const entries = Array.isArray(value) ? value : [value];

        return (
            <div className="space-y-3">
                {entries.map((entry, index) => {
                    // Determine the type of entry (theme, validation, etc.)
                    const type = Object.keys(entry).find(k =>
                        ['theme', 'validation', 'objection', 'challenges','insight'].includes(k)
                    );

                    return (
                        <div
                            key={index}
                            className="border rounded-lg p-3"
                            style={{ backgroundColor: appColors.primaryColor }}
                        >
                            <div className="grid grid-cols-1 gap-2">
                                <p>
                                    <span className="font-semibold">{type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Item'}: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry[type] || `No ${type} selected`}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Match Rating (1-10): </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry.ranking || "N/A"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Rating Justification: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry.justification || "No justification available"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Perception to Address: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry.perceptionToAddress || "Not specified"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Why It Matters: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry.whyItMatters || "Not specified"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Deeper Insight: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry.deeperInsight || "Not specified"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold">Supporting Quotes: </span>
                                    <span className='text-gray-400 text-sm'>
                                        {entry.supportingQuotes || "None provided"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderFieldValue = (key, value) => {
        // Handle special fields (Themes, Validations, etc.)
        if (specialFields.includes(key)) {
            return renderSpecialField(key, value);
        }

        // Handle array fields
        if (arrayFields.includes(key) && Array.isArray(value)) {
            const isExpanded = expandedFields[key];
            const visibleTags = isExpanded ? value : value.slice(0, 3);
            const hasMoreTags = value.length > 3 && !isExpanded;

            return (
                <div className="flex flex-wrap gap-2">
                    {visibleTags
                        .filter((item) => item && item !== "nan" && item !== "[]")
                        .map((tag, index) => (
                            <span
                                key={index}
                                className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    {hasMoreTags && (
                        <button
                            onClick={() => toggleExpand(key)}
                            className="text-blue-500 text-sm flex items-center"
                        >
                            +{value.length - 3} more
                        </button>
                    )}
                </div>
            );
        }

        // Handle long text fields
        const isExpanded = expandedFields[key];
        const displayValue = value || "-";
        const isLongText = typeof displayValue === 'string' && displayValue.length > 100;

        if (isLongText && !isExpanded) {
            return (
                <div className="truncate">
                    {displayValue.substring(0, 100)}...
                </div>
            );
        }

        return <div className="break-words">{displayValue}</div>;
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-[40%] max-w-[800px] max-h-[90vh] overflow-y-auto shadow-lg"
                style={{ backgroundColor: appColors.primaryColor }}>

                {/* Header */}
                <div className="sticky top-0 py-2 flex justify-between items-center border rounded p-2 z-10" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                    <h2 className="text-lg font-bold">Content Details</h2>
                    <button onClick={onClose} className="text-red-500">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* User Avatar */}
                {data.Avatar && (
                    <div className="flex justify-center my-6 -mb-1">
                        <img
                            src={data.Avatar || "/default-avatar.png"}
                            alt="User Avatar"
                            className="w-32 h-32 rounded-full object-cover border-4 border-orange-500"
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="space-y-5 px-2">
                    {filteredData.map(({ key, value, label }) => {
                        if (key === "Avatar") return null; // Skip avatar as it's already rendered
                        // Check if this field is part of any report section
                        const isReportField = reportSections.some(section =>
                            section.fields.includes(key)
                        );

                        // If it's part of a report section, we'll handle it separately
                        if (isReportField) return null;

                        const isArrayField = arrayFields.includes(key) && Array.isArray(value);
                        const isSpecialField = specialFields.includes(key);
                        const isLongText = !isArrayField && !isSpecialField && typeof value === 'string' && value.length > 100;
                        const isExpanded = expandedFields[key];

                        return (
                            <div key={key} className="w-full">
                                {/* Field Label */}
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-md font-bold text-gray-600" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                        {label}
                                    </label>
                                    {copiedField === label && (
                                        <span className="text-xs text-green-500">Copied!</span>
                                    )}
                                </div>

                                {/* Field Content with Actions */}
                                <div className="flex items-stretch gap-2 w-full">
                                    <div
                                        className={`flex-1 border border-gray-300 p-3 rounded-md overflow-hidden
                                            ${isArrayField ? 'h-auto m-0 p-0 mb-2' : 'hover:bg-white/5 cursor-pointer'}
                                            ${isExpanded ? '' : isSpecialField ? '' : 'max-h-24 overflow-y-auto'}`}
                                        onClick={!isArrayField && !isSpecialField ? () => toggleExpand(key) : undefined}
                                    >
                                        {renderFieldValue(key, value)}
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        {(isLongText || isArrayField) && (
                                            <div
                                                onClick={() => toggleExpand(key)}
                                                className="w-auto h-[0px] flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-white/10 mt-4 transition-colors cursor-pointer"
                                                title={isExpanded ? "Collapse" : "Expand"}
                                            >
                                                {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => copyToClipboard(value, label)}
                                            className="w-auto h-10 flex items-center justify-center text-gray-500 rounded-md hover:text-gray-700  mt-2 transition-colors"
                                        >
                                            <FaCopy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Render report sections */}
                    {reportSections.map((section) => {
                        // Check if any field in this section has data
                        const hasData = section.fields.some(field =>
                            data[field] !== undefined && data[field] !== null && data[field] !== ""
                        );

                        if (!hasData) return null;

                        return (
                            <div key={section.title}>
                                <label className="text-md font-bold">{section.title}</label>
                                <div className="border rounded-lg p-4">

                                    <div className="space-y-4">
                                        {section.fields.map((field) => {
                                            if (!data[field] || data[field] === "") return null;

                                            const label = getDisplayName(field);
                                            const value = data[field];
                                            const isLongText = typeof value === 'string' && value.length > 100;
                                            const isExpanded = expandedFields[field];

                                            return (
                                                <div key={field} className="w-full">
                                                    {/* Field Label */}
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm font-semibold text-gray-600" style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}>
                                                            {label}
                                                        </label>
                                                        {copiedField === label && (
                                                            <span className="text-xs text-green-500">Copied!</span>
                                                        )}
                                                    </div>

                                                    {/* Field Content with Actions */}
                                                    <div className="flex items-stretch gap-2 w-full">
                                                        <div
                                                            className={`flex-1 border border-gray-300 p-3 rounded-md overflow-hidden
                                                            ${isLongText ? 'hover:bg-white/5 cursor-pointer' : ''}
                                                            ${isExpanded ? '' : 'max-h-24 overflow-y-auto'}`}
                                                            onClick={isLongText ? () => toggleExpand(field) : undefined}
                                                        >
                                                            {renderFieldValue(field, value)}
                                                        </div>

                                                        <div className="flex flex-col justify-between">
                                                            {isLongText && (
                                                                <div
                                                                    onClick={() => toggleExpand(field)}
                                                                    className="w-auto h-[0px] flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-white/10 mt-4 transition-colors cursor-pointer"
                                                                    title={isExpanded ? "Collapse" : "Expand"}
                                                                >
                                                                    {isExpanded ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => copyToClipboard(value, label)}
                                                                className="w-auto h-10 flex items-center justify-center text-gray-500 rounded-md hover:text-gray-700  mt-2 transition-colors"
                                                            >
                                                                <FaCopy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default Modal;