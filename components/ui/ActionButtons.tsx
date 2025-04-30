import React from 'react';
import { Action } from '@/lib/constants';

interface ActionButtonsProps {
  onAction: (action: Action) => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, disabled }) => {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      <button
        onClick={() => onAction('FOLD')}
        disabled={disabled}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out font-semibold"
      >
        Fold
      </button>
      <button
        onClick={() => onAction('CALL')}
        disabled={disabled}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out font-semibold"
      >
        Call
      </button>
      <button
        onClick={() => onAction('RAISE')}
        disabled={disabled}
        className="px-6 py-3 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out font-semibold"
      >
        Raise
      </button>
    </div>
  );
};

export default ActionButtons;