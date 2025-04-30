import React from 'react';
import { PositionRangeData, HandActionDetail } from '@/lib/ranges';
import { RANKS } from '@/lib/constants';

interface RangeGridProps {
  rangeData: PositionRangeData | null;
}

const RangeGrid: React.FC<RangeGridProps> = ({ rangeData }) => {
  if (!rangeData) {
    return <div className="text-center text-gray-500 mt-4">Range data not available.</div>;
  }

  // Function to get the background color based on action
  const getActionColor = (detail: HandActionDetail | undefined): string => {
    if (!detail) return 'bg-gray-200'; // Default for missing hands in data
    switch (detail.action) {
      case 'R': return 'bg-red-400 hover:bg-red-500'; // Raise
      case 'C': return 'bg-green-400 hover:bg-green-500'; // Call
      case 'F': return 'bg-blue-300 hover:bg-blue-400'; // Fold
      // Add colors for other actions if needed (e.g., mixed)
      default: return 'bg-gray-300'; // Unknown/Fallback
    }
  };

  return (
    <div className="mt-4 p-2 border border-gray-300 rounded bg-gray-50 overflow-x-auto">
      <div className="grid grid-cols-13 gap-px" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
        {RANKS.map((rank1, i) =>
          RANKS.map((rank2, j) => {
            let hand: string;
            let handDetail: HandActionDetail | undefined;

            if (i === j) { // Pocket pairs
              hand = rank1 + rank2;
              handDetail = rangeData[hand];
            } else if (i < j) { // Suited hands (upper right triangle)
              hand = rank1 + rank2 + 's';
              handDetail = rangeData[hand];
            } else { // Offsuit hands (lower left triangle)
              hand = rank2 + rank1 + 'o'; // Canonical order (higher rank first)
              handDetail = rangeData[hand];
            }

            const bgColor = getActionColor(handDetail);
            const textColor = handDetail?.action === 'R' || handDetail?.action === 'C' ? 'text-white' : 'text-gray-800';

            return (
              <div
                key={hand}
                title={`${hand}: ${handDetail?.action || 'N/A'}`}
                className={`aspect-square flex items-center justify-center text-xs sm:text-sm font-mono rounded-sm transition-colors duration-150 ${bgColor} ${textColor}`}
              >
                {hand}
              </div>
            );
          })
        )}
      </div>
       {/* Optional Legend */}
       <div className="flex justify-center space-x-4 mt-3 text-xs">
            <span><span className="inline-block w-3 h-3 bg-red-400 mr-1 rounded-sm"></span> Raise</span>
            <span><span className="inline-block w-3 h-3 bg-green-400 mr-1 rounded-sm"></span> Call</span>
            <span><span className="inline-block w-3 h-3 bg-blue-300 mr-1 rounded-sm"></span> Fold</span>
            <span><span className="inline-block w-3 h-3 bg-gray-200 mr-1 rounded-sm border border-gray-400"></span> N/A</span>
       </div>
    </div>
  );
};

export default RangeGrid;