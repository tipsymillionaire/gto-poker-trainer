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
    <div className="flex items-center space-x-3">
      <label htmlFor={selectId} className="text-sm font-medium whitespace-nowrap">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className="px-3 py-2 bg-black text-teal-400 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
