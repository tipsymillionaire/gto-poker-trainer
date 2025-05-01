import React from 'react';
// Removed unused Image import: import Image from 'next/image';
// Assuming these constants and components are correctly defined/imported
import { Position, POSITIONS_8MAX, OPEN_RAISE_SIZE_BB } from '@/lib/constants'; // Keep POSITIONS_8MAX for seatCoordinates lookup if needed, or ensure positions prop covers all possibilities
import CardDisplay from './CardDisplay'; // Ensure CardDisplay uses colored backgrounds/white text

interface PokerTableProps {
    positions: readonly Position[]; // Now used for iteration
    openerPos: Position;
    userPos: Position;
    stackSize: number; // Now used for display logic
    heroCards: [string, string] | null;
    isLoading: boolean;
}

// Seat Layout Coordinates (Using POSITIONS_8MAX keys for now, ensure `positions` prop values match these)
// If you intend to support different table sizes dynamically, this might need adjustment
// or ensure the `positions` prop always contains values from POSITIONS_8MAX.
const seatCoordinates: { [key in Position]: { top: string; left: string } } = {
    'UTG':   { top: '50%', left: '1%' },   // Left
    'UTG+1': { top: '10%', left: '25%' },  // Top Left
    'LJ':    { top: '10%', left: '50%' },  // Top Center
    'HJ':    { top: '10%', left: '75%' },  // Top Right
    'CO':    { top: '50%', left: '99%' },  // Right
    'BU':    { top: '80%', left: '75%' },  // Bottom Right
    'SB':    { top: '80%', left: '50%' },  // Bottom Center
    'BB':    { top: '80%', left: '25%' },  // Bottom Left
};

// Define positions for bet placement logic (beside seat box)
const BET_POS_LEFT_OF_SEAT: Position[] = ['CO', 'BU', 'SB', 'BB'];
const BET_POS_RIGHT_OF_SEAT: Position[] = ['UTG', 'UTG+1', 'LJ', 'HJ'];

const PokerTable: React.FC<PokerTableProps> = ({
    positions, // Now used
    openerPos,
    userPos,
    stackSize, // Now used
    heroCards,
    isLoading
}) => {
    // Dynamic scenario text calculation
    const scenarioText = `${userPos} vs ${openerPos} RFI`;

    // Removed hardcoded baseStack, will use stackSize prop directly

    return (
        // Main Table Container
        <div className={`relative w-full max-w-3xl mx-auto aspect-[2/1] bg-gray-800 border-[6px] border-teal-300 p-5 shadow-lg rounded-[150px]`}>

            {/* Inner Border Effect */}
            <div className={`absolute inset-[18px] border border-teal-400/30 pointer-events-none rounded-[126px]`}></div>

            {/* Center Information Display: Dynamic Scenario + Static Pot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none">
                <p className="text-sm md:text-base font-semibold text-gray-300 mb-1 whitespace-nowrap">{scenarioText}</p>
                {/* Pot size assumes SB (0.5) + BB (1.0) + Opener Raise (e.g., 2.3) = ~3.8BB before hero acts?
                    Or SB+BB+Opener+HeroCall? The 4.6BB seems specific, maybe SB+BB+Opener+SB Call?
                    Keeping it static as per original code for now. */}
                <p className="text-lg font-bold text-white">Pot : 4.6BB</p>
            </div>

            {/* Static Small Blind / Big Blind Posted Amounts (assumed pre-action) */}
            <div className="absolute top-[62%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 z-30" title="Big Blind Post">
                <div className="bg-gray-700 px-1.5 py-0.5 rounded text-white text-[10px] font-medium shadow">
                    1.0BB
                </div>
            </div>
            <div className="absolute top-[62%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-30" title="Small Blind Post">
                <div className="bg-gray-700 px-1.5 py-0.5 rounded text-white text-[10px] font-medium shadow">
                    0.5BB
                </div>
            </div>
            {/* --- / SB/BB Indicators --- */}

            {/* Map through the passed `positions` prop to render each seat */}
            {positions.map((pos) => {
                // Check if the position exists in our coordinate map. Skip rendering if not.
                // This makes it safer if `positions` prop contains unexpected values.
                if (!seatCoordinates[pos]) {
                    console.warn(`PokerTable: Position "${pos}" not found in seatCoordinates.`);
                    return null;
                }

                const isHero = pos === userPos;
                const isOpener = pos === openerPos;
                const isButton = pos === 'BU'; // Assuming BU is always the button

                const { top, left } = seatCoordinates[pos];
                const seatStyle: React.CSSProperties = {
                    position: 'absolute',
                    top: top,
                    left: left,
                    transform: 'translate(-50%, -50%)',
                };

                // Calculate displayed stack size using the stackSize prop and OPEN_RAISE_SIZE_BB
                // Changed `let` to `const` as it's not reassigned
                const displayStack = isOpener
                    ? Math.max(0, stackSize - 2.3) // Opener's stack after raising
                    : stackSize; // Other players' stack (assuming effective stack)
                    // Note: Blinds (SB/BB) technically post before the raise.
                    // For simplicity, we show the effective stack `stackSize` for everyone except the opener post-raise.
                    // You could refine this to show stackSize - 0.5 for SB and stackSize - 1.0 for BB if needed.

                // Base styling for the seat information box (relative position is key)
                let seatClass = 'relative px-3 py-1.5 rounded bg-teal-900/80 text-white text-center shadow-md min-w-[100px] max-h-[35px]';
                if (isHero) {
                    seatClass += ' ring-2 ring-blue-500'; // Hero highlight
                }

                return (
                    // Set z-index for the seat container itself
                    <div key={pos} style={seatStyle} className="flex flex-col items-center z-20" aria-label={`Seat: ${pos}`}>

                        {/* --- Player Cards (Hero and Opener ONLY) --- */}
                        <div className="flex justify-center h-12 items-end mb-1 min-h-[3rem]">
                            {!isLoading && (
                                <>
                                    {isHero && heroCards && ( <div className="relative" title={`Hero Cards: ${heroCards.join(' ')}`}> <CardDisplay cards={heroCards} /> </div> )}
                                    {/* Show hidden cards for opener only if they are NOT also the hero */}
                                    {isOpener && !isHero && ( <div className="flex justify-center" title="Opener Cards (Hidden)"> <div className="w-8 h-10 bg-yellow-600 border border-black/50 rounded-sm shadow-sm -mr-4"></div> <div className="w-8 h-10 bg-yellow-600 border border-black/50 rounded-sm shadow-sm"></div> </div> )}
                                    {/* Non-hero, non-opener players show nothing here */}
                                </>
                            )}
                            {/* Show loading placeholder only in Hero's spot for simplicity, or adjust as needed */}
                            {isLoading && isHero && <div className="h-10 text-xs text-gray-400 flex items-center">Loading...</div>}
                        </div>
                        {/* --- /Player Cards --- */}

                        {/* --- Seat Information Box (with Stack Size & Conditional Bet Indicator) --- */}
                        <div className={seatClass}>
                            {/* Dealer Button */}
                            {isButton && ( <div className="absolute -top-2 -right-5 w-5 h-5 bg-gray-200 rounded-full border-2 border-gray-400 flex items-center justify-center text-black text-xs font-bold shadow z-40" title="Dealer Button"> D </div> )}
                            {/* Position and Stack Info */}
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-xs font-semibold">{pos}</span>
                                <span className="text-[11px] text-gray-300">{displayStack.toFixed(1)} BB</span> {/* Use calculated displayStack */}
                            </div>
                            {/* --- Player Bet Amount (Positioned Conditionally Beside Seat Box) --- */}
                            {/* Bet indicator (Left Side) */}
                            {isOpener && !isLoading && BET_POS_LEFT_OF_SEAT.includes(pos) && (
                                <div className="absolute top-1/2 left-[-5px] -translate-y-1/2 -translate-x-full z-30 whitespace-nowrap">
                                    <div className="bg-gray-700 px-1.5 py-0.5 rounded text-white text-[10px] font-medium shadow" title={`Opener Bet: ${OPEN_RAISE_SIZE_BB} BB`}> {OPEN_RAISE_SIZE_BB}BB </div> {/* Use formatted value */}
                                </div>
                            )}
                            {/* Bet indicator (Right Side) */}
                            {isOpener && !isLoading && BET_POS_RIGHT_OF_SEAT.includes(pos) && (
                                <div className="absolute top-1/2 right-[-5px] -translate-y-1/2 translate-x-full z-30 whitespace-nowrap">
                                    <div className="bg-gray-700 px-1.5 py-0.5 rounded text-white text-[10px] font-medium shadow" title={`Opener Bet: ${OPEN_RAISE_SIZE_BB} BB`}> {OPEN_RAISE_SIZE_BB}BB </div> {/* Use formatted value */}
                                </div>
                            )}
                            {/* --- /Player Bet Amount --- */}
                        </div>
                        {/* --- /Seat Information Box --- */}
                    </div> // End Seat Container
                );
            })} {/* End Map */}
        </div> // End Table Container
    );
};

export default PokerTable;