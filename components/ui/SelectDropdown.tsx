import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  id?: string;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ label, value, onChange, options, id }) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col">
      <label htmlFor={selectId} className="mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectDropdown;