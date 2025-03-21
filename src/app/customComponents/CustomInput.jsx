import React from 'react';
import { Input } from '@/components/ui/input';

export default function CustomInput({
    id,
    type,
    placeholder,
    value,
    label,
    onChange,
    disabled,
    className,
    ...props
}) {
    return (
        <div className='w-full'>
            {label && (
                <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                {...props}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md 
    focus:outline-none focus:ring-2 focus:ring-[#c7b740] 
    focus:border-[#c7b740] hover:border-[#c7b740] transition ${className}`}
            />


        </div>
    );
}
