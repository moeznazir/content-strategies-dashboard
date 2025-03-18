import React from 'react';
import { Input } from '@/components/ui/input';
import { appColors } from '@/theme';

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
        label ={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-${appColors.primaryColor}-500 focus:border-${appColors.primaryColor}-500 ${className}`}
      />
    </div>
  );
}
