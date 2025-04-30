import React from 'react';
import { Position } from '@/lib/constants';

interface PokerTableProps {
  positions: readonly Position[]; // Expecting 8 positions in order UTG -> BB
  openerPos: Position;
  userPos: Position; // Hero's position
  stackSize: number;
}

// Define approximate positions around an oval table for 8 players (CLOCKWISE)
// Percentages: [top, left] - null means auto/default
// Using string percentages for Tailwind compatibility
const seatPositionsClockwise: { [key in Position]?: { top?: string; bottom?: string; left?: string; right?: string; transform?: string } } = {
    'BB': { top: '5%', left: '20%', transform: 'translateX(-50%)' },      // Top-left
    'UTG+1': { top: '5%', right: '20%', transform: 'translateX(50%)' },   // Top-right
    'LJ': { top: '50%', right: '0%', transform: 'translateY(-50%)' },      // Middle-right
    'HJ': { bottom: '5%', right: '20%', transform: 'translateX(50%)' },   // Bottom-right
    'CO': { bottom: '0%', left: '50%', transform: 'translateX(-50%)' },   // Bottom-center
    'BU': { bottom: '5%', left: '20%', transform: 'translateX(-50%)' },    // Bottom-left
    'SB': { top: '50%', left: '0%', transform: 'translateY(-50%)' },       // Middle-left
    'UTG': { top: '0%', left: '50%', transform: 'translateX(-50%)' },      // Top-center
};

// Define positions for the D, SB, BB markers relative to the center/seats
const markerPositions: { [key: string]: { top?: string; bottom?: string; left?: string; right?: string; transform?: string } } = {
    'D': { bottom: '20%', left: '30%', transform: 'translate(-50%, 50%)' }, // Near BU seat
    'SB': { top: '35%', left: '10%', transform: 'translate(-50%, -50%)' }, // Near SB seat
    'BB': { top: '10%', left: '40%', transform: 'translate(-50%, -50%)' }, // Near BB seat
};


const PokerTable: React.FC<PokerTableProps> = ({ positions, openerPos, userPos, stackSize }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[1.8/1] bg-green-700 border-8 border-gray-800 rounded-[50%] flex items-center justify-center text-white p-4 shadow-lg">
      {/* Inner felt line */}
      <div className="absolute inset-0 border-[15px] border-green-800 rounded-[50%] m-2 pointer-events-none"></div>

      {/* Center Info */}
      <div className="relative z-10 text-center pointer-events-none">
        <h2 className="text-lg md:text-xl font-bold mb-1 md:mb-2">8-Max Table</h2>
        <p className="text-sm md:text-base">Stack: {stackSize}bb</p>
      </div>

      {/* Player Seats */}
      {positions.map(pos => {
        const style = seatPositionsClockwise[pos] || {}; // Use clockwise positions
        const isOpener = pos === openerPos;
        const isHero = pos === userPos;

        // Base styling for a seat
        let seatClasses = `absolute w-16 h-10 md:w-20 md:h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs md:text-sm font-semibold shadow-md transition-all duration-200`;

        // Highlight opener and hero
        if (isOpener) {
          seatClasses += ' bg-red-600 border-red-900 ring-2 ring-offset-2 ring-offset-green-700 ring-white z-10 scale-110';
        } else if (isHero) {
          seatClasses += ' bg-blue-600 border-blue-900 ring-2 ring-offset-2 ring-offset-green-700 ring-white z-10 scale-110';
        } else {
          seatClasses += ' bg-gray-600 border-gray-800';
        }

        return (
          <div
            key={pos}
            className={seatClasses}
            style={style} // Apply absolute positioning styles
          >
            {/* Position Name */}
            <span className="block">{pos}</span>

            {/* Indicator for Opener/Hero */}
            {isOpener && <span className="text-[9px] md:text-[10px] font-normal">(Opener)</span>}
            {isHero && <span className="text-[9px] md:text-[10px] font-normal">(Hero)</span>}
          </div>
        );
      })}

       {/* Dealer Button */}
       <div
         className="absolute w-6 h-6 md:w-8 md:h-8 bg-white rounded-full border-2 border-gray-400 flex items-center justify-center text-black text-sm md:text-base font-bold shadow-md z-20"
         style={markerPositions['D']}
         title="Dealer Button"
       >
         D
       </div>

       {/* Small Blind Button */}
        <div
         className="absolute w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full border-2 border-gray-500 flex items-center justify-center text-black text-xs md:text-sm font-bold shadow-md z-20"
         style={markerPositions['SB']}
         title="Small Blind"
       >
         SB
       </div>

       {/* Big Blind Button */}
        <div
         className="absolute w-6 h-6 md:w-8 md:h-8 bg-gray-900 text-white rounded-full border-2 border-black flex items-center justify-center text-xs md:text-sm font-bold shadow-md z-20"
         style={markerPositions['BB']}
         title="Big Blind"
       >
         BB
       </div>

    </div>
  );
};

export default PokerTable;