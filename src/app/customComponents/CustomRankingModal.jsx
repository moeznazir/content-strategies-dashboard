import React from 'react';
import { appColors } from "@/lib/theme";
import CustomButton from './CustomButton';

const RankingModal = ({ data, onClose }) => {
    // Determine the data type based on the first item's properties
    const dataType = data.length > 0
        ? Object.keys(data[0]).find(key =>
            ['theme', 'validation', 'objection', 'challenges'].includes(key)
        )
        : null;

    const getTitle = () => {
        switch (dataType) {
            case 'theme': return 'Theme Details';
            case 'validation': return 'Validation Details';
            case 'objection': return 'Objection Details';
            case 'challenges': return 'Challenge Details';
            default: return 'Details';
        }
    };

    const getFieldLabel = () => {
        switch (dataType) {
            case 'theme': return 'Theme';
            case 'validation': return 'Validation';
            case 'objection': return 'Objection';
            case 'challenges': return 'Challenge';
            default: return 'Item';
        }
    };
console.log("dataaaaaa",data);
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
            <div
                className="bg-white rounded-lg p-6 w-full max-w-2xl flex flex-col"
                style={{
                    backgroundColor: appColors.primaryColor,
                    color: appColors.textColor,
                    maxHeight: '80vh' 
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold -mt-2">{getTitle()}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                <hr className="border-b border-gray-500 mb-6 -mt-[6px] -mx-6" />
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <div
                                key={index}
                                className="border rounded-lg p-4 mb-4"
                                style={{ backgroundColor: appColors.primaryColor }}
                            >
                                <div className="grid grid-cols-1 gap-2">
                                    <p>
                                        <span className="font-semibold">{getFieldLabel()}: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item[dataType] || `No ${dataType} selected`}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Ranking: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item.ranking || "N/A"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Justification: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item.justification || "No justification available"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Perception to Address: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item.perceptionToAddress || "Not specified"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Why It Matters: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item.whyItMatters || "Not specified"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Deeper Insight: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item.deeperInsight || "Not specified"}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-semibold">Supporting Quotes: </span>
                                        <span className='text-gray-400 text-sm'>
                                            {item.supportingQuotes || "None provided"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-4">No data available</p>
                    )}
                </div>

                <div className="flex justify-end mt-4 -mb-2">
                    <CustomButton onClick={onClose}>
                        Close
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default RankingModal;