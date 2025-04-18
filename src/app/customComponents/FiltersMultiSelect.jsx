'use client'
import React, { useState, useEffect, useRef } from 'react'

const MultiSelectDropdown = ({ label, options, selectedValues, onToggle, isOpen, onSelect, field, exclusiveSelections }) => {
    const dropdownRef = useRef(null);

    const exclusiveGroups = ['Themes', 'Objections', 'Validations'];
    const selectedExclusiveGroup = exclusiveGroups.find(group =>
        group !== field && exclusiveSelections?.[group]?.length > 0
    );

    const isDropdownDisabled =
        exclusiveGroups.includes(field) &&
        selectedExclusiveGroup &&
        selectedExclusiveGroup !== field;

    const toggleOption = (value) => {
        const alreadySelected = selectedValues.includes(value);

        // If this field is disabled (another exclusive group has selections), ignore click
        if (isDropdownDisabled) return;

        if (alreadySelected) {
            onSelect(selectedValues.filter(v => v !== value));
        } else {
            onSelect([...selectedValues, value]);
        }
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (isOpen) {
                    onToggle();
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onToggle]);

    return (
        <div className="relative mb-4 group" ref={dropdownRef}>
            <div
                onClick={() => {
                    if (!isDropdownDisabled) {
                        onToggle();
                    }
                }}
                className={`
        w-[240px] text-sm bg-white/10 p-2 pr-10 border rounded-full text-left 
        flex justify-between items-center
        ${isDropdownDisabled ? 'border-gray-500 text-gray-400 cursor-not-allowed' : 'border-gray-200 cursor-pointer'}
    `}
            >
                <span className='ml-1'>
                    {label} {selectedValues.length > 0 ? `(${selectedValues.length})` : ''}
                </span>
                <span className='-mr-7'>▼</span>
            </div>

            {isDropdownDisabled && !isOpen && (
                <div className="absolute top-2 left-30 ml-2 mt-1 z-20 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    You can select only one of: <br />
                    Objections / Validations / Themes
                </div>
            )}


            {isOpen && !isDropdownDisabled && (
                <div className="absolute z-10 mt-1 w-[230px] bg-[#1a1b41] border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.map((option) => {
                        const isDisabled = false;

                        return (
                            <div
                                key={option.value}
                                className={`px-4 py-2 text-sm flex justify-between items-center
                                    ${selectedValues.includes(option.value)
                                        ? 'bg-[#3a86ff] text-white'
                                        : 'hover:bg-white/10'}
                                `}
                                onClick={() => toggleOption(option.value)}
                            >
                                <span>{option.label}</span>
                                {typeof option.count === 'number' && (
                                    <span className="text-xs opacity-70">({option.count})</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
