import { FaTimes, FaCopy, FaExpand, FaCompress } from "react-icons/fa";
import { appColors } from "@/lib/theme";
import { useState } from "react";
import CustomButton from "./CustomButton";

const Modal = ({ data, onClose }) => {
    const [expandedFields, setExpandedFields] = useState({});
    const [copiedField, setCopiedField] = useState(null);

    // Array fields that should be displayed as tags
    const arrayFields = [
        "Video Type",
        "Tags",
        "Classifications",
        "Themes",
        "Objections",
        "Validations",
        "Challenges"
    ];

    const filteredData = Object.entries(data).filter(
        ([key]) => key !== "Avatar" && key !== "id" && key!=="ranking" && key !=="Ranking Justification" && !key.includes("Rating (1-5 stars by the user)")
    );

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

    const getDisplayName = (key) => {
        const nameMap = {
            "Text comments for the rating (OPTIONAL input from the user)": "Rating Comment",
            // "ranking": "Ranking",
            "Episode_Number": "Episode #",
            "Video_ID": "Video ID"
        };
        return nameMap[key] || key;
    };

    const renderFieldValue = (key, value) => {
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
                <div className="sticky top-0 py-2 flex justify-between items-center border rounded p-2 z-10">
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
                    {filteredData?.map(([key, value]) => {
                        const displayName = getDisplayName(key);
                        const isArrayField = arrayFields.includes(key) && Array.isArray(value);
                        const isLongText = !isArrayField && typeof value === 'string' && value.length > 100;
                        const isExpanded = expandedFields[key];

                        return (
                            <div key={key} className="w-full">
                                {/* Field Label */}
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-gray-600">
                                        {displayName}
                                    </label>
                                    {copiedField === displayName && (
                                        <span className="text-xs text-green-500">Copied!</span>
                                    )}
                                </div>

                                {/* Field Content with Actions */}
                                <div className="flex items-stretch gap-2 w-full">
                                    <div
                                        className={`flex-1 border border-gray-300 p-3 rounded-md overflow-hidden
                                            ${isArrayField ? 'h-auto m-0 p-0 mb-2' : 'hover:bg-white/5 cursor-pointer'}
                                            ${isExpanded ? '' : 'max-h-24 overflow-y-auto'}`}
                                        onClick={!isArrayField ? () => toggleExpand(key) : undefined}
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
                                            onClick={() => copyToClipboard(value, displayName)}
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
};

export default Modal;