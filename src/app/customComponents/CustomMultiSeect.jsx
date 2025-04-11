'use client'
import React, { useState } from 'react'
const MultiSelectDropdown = ({ label, options, selectedValues, onToggle, isOpen, onSelect }) => {

    const toggleOption = (value) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onSelect(newSelected);
    };

    return (
        <div className="relative mb-4 cursor-pointer">
            <div
                onClick={onToggle}
                className="w-[240px] cursor-pointer text-sm bg-white/10 p-2 pr-10 border border-gray-200 rounded-full focus:ring-blue-500 focus:border-gray-200 text-left flex justify-between items-center"
            >
                <span className='ml-1 cursor-pointer'>
                    {label} {selectedValues.length > 0 ? `(${selectedValues.length})` : ''}
                </span>
                <span className='-mr-7 cursor-pointer'>▼</span>
            </div>

            {isOpen && (
                <div className="absolute cursor-pointer z-10 mt-1 w-[230px] bg-[#1a1b41] border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => {
                        // Ensure count is always a number
                        const count = typeof option.count === 'number' ? option.count : 0;

                        return (
                            <div
                                key={option.value}
                                className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center ${selectedValues.includes(option.value)
                                    ? 'bg-[#3a86ff] text-white'
                                    : 'hover:bg-white/10'
                                    }`}
                                onClick={() => toggleOption(option.value)}
                            >
                                <span>{option.label}</span>
                                <span className="text-xs opacity-70">({count})</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


export default MultiSelectDropdown