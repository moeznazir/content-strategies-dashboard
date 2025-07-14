"use client";

import React from "react";
import dynamic from "next/dynamic";
import { appColors } from "@/lib/theme";

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
    required = false,
    errorMessage,
    ...props
}) {
    return (
        <div className="w-full">
            {title && (
                <label htmlFor={id} className="block text-sm font-bold mb-1" style={{ color: appColors.textColor }}>
                    {title}
                    {required ? (
                        <span
                            className="text-red-500 ml-1"
                            style={{ display: 'inline-block' }}
                            aria-hidden="true"
                        >
                            *
                        </span>
                    ) : null}
                </label>
            )}

            <Select
                id={id}
                value={
                    isMulti
                        ? options.filter((option) => Array.isArray(value) && value.includes(option.value))
                        : options.find((option) => option.value === value?.value) || null
                }
                onChange={(selectedOptions) =>
                    onChange(isMulti ? selectedOptions.map((opt) => opt.value) : selectedOptions.value)
                }
                options={options}
                isMulti={isMulti} // Enable multiple selection
                isDisabled={disabled}
                className={className}
                placeholder={placeholder}
                required={required}
                styles={{
                    control: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? appColors.hoverColor : "transparent",
                        borderColor: state.isFocused ? appColors.borderColor : appColors.borderColor,
                        boxShadow: "none",
                        "&:hover": {
                            backgroundColor: appColors.hoverColor,
                            borderColor: appColors.borderColor,
                        },
                        color: "white",
                    }),
                    menu: (provided) => ({
                        ...provided,
                        backgroundColor: appColors.primaryColor,
                        color: "white",
                        zIndex: 9999,
                    }),
                    menuList: (provided) => ({
                        ...provided,
                        backgroundColor: appColors.primaryColor,
                        color: "white",
                    }),
                    option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                            ? appColors.hoverColor
                            : appColors.primaryColor,
                        color: "white",
                        "&:active": {
                            backgroundColor: appColors.alternativePrimaryColor,
                        },
                    }),
                    singleValue: (provided) => ({
                        ...provided,
                        color: "white",
                    }),
                    placeholder: (provided) => ({
                        ...provided,
                        color: "#aaa",
                    }),
                    input: (provided) => ({
                        ...provided,
                        color: "white",
                    }),
                }}

            />
            {/* {required && !value && (
                <p className="mt-1 text-sm text-red-500">
                    {errorMessage || 'This field is required'}
                </p>
            )} */}
        </div>
    );
}
