import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  description?: string;
  className?: string;
  labelClassName?: string;
}

export const BookingFormField: React.FC<FormFieldProps> = ({
  label,
  children,
  required,
  description,
  className,
  labelClassName,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className={`text-sm font-medium ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {children}
    </div>
  );
};