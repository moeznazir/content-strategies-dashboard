"use client";

import React from "react";
import dynamic from "next/dynamic";

// Import react-select dynamically to prevent hydration issues
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function CustomSelect({
    id,
    value,
    onChange,
    disabled,
    title,
    className,
    options = [],
    isMulti = false,
    placeholder,
    ...props
}) {
    return (
        <div className="w-full">
            {title && (
                <label
                    htmlFor={id}
                    className="block text-sm font-bold text-gray-700 mb-1"
                >
                    {title}
                </label>
            )}

            <Select
                id={id}
                value={options.filter((option) => value.includes(option.value))} // Keep selected values
                onChange={(selectedOptions) =>
                    onChange(isMulti ? selectedOptions.map((opt) => opt.value) : selectedOptions.value)
                }
                options={options}
                isMulti={isMulti} // Enable multiple selection
                isDisabled={disabled}
                className={className}
                placeholder={placeholder}
                styles={{
                    control: (provided, state) => ({
                        ...provided,
                        borderColor: state.isFocused ? "#c7b740" : "#d1d5db", 
                        boxShadow: state.isFocused ? "0 0 0 1.5px #c7b740" : "none",
                        "&:hover": { borderColor: "#c7b740" },
                    }),
                }}
            />
        </div>
    );
}
