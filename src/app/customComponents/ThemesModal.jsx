
import React from 'react';
import { appColors } from "@/lib/theme";
import CustomButton from './CustomButton';

const ThemesModal = ({ themes, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
            <div
                className="bg-white rounded-lg p-6 w-full max-w-2xl"
                style={{ backgroundColor: appColors.primaryColor, color: appColors.textColor }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold -mt-2">Theme Details</h2>
                   
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                <hr className="border-b border-gray-500 mb-6 -mt-[6px] -mx-6" />
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {themes.length > 0 ? (
                        themes.map((theme, index) => (
                            <div
                                key={index}
                                className="border rounded-lg p-4"
                                style={{ backgroundColor: appColors.primaryColor }}
                            >
                                <p><span className="font-semibold">Theme:</span> <span className='text-gray-400  text-sm'>{theme.theme || "No theme selected"}</span></p>
                                <p><span className="font-semibold">Ranking:</span> <span className='text-gray-400 text-sm'>{theme.ranking || "N/A"}</span></p>
                                <p><span className="font-semibold">Ranking Justification:</span> <span className='text-gray-400 text-sm'>{theme.justification || "No justification Avilable"}</span></p>
                            </div>
                        ))
                    ) : (
                        <p>No themes available</p>
                    )}
                </div>


                <div className="flex justify-end mt-4 -mb-2">
                    <CustomButton
                        onClick={onClose}
                    >
                        Close
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default ThemesModal;