'use client'; // VERY IMPORTANT! This component needs interactivity

import React, { useState, useEffect, useCallback } from 'react';
import { POSITIONS_8MAX, STACK_SIZES, Action, Position } from '@/lib/constants';
import { getSimplifiedGtoAction, getGtoRange, PositionRangeData } from '@/lib/ranges';
import { generateTwoRandomCards, formatHandForRangeLookup } from '@/lib/pokerUtils';
import PokerTable from '../ui/PokerTable';
import CardDisplay from '../ui/CardDisplay';
import ActionButtons from '../ui/ActionButtons';
import RangeGrid from '../ui/RangeGrid';
import SelectDropdown from '../ui/SelectDropdown';

interface TrainerInterfaceProps {
    initialStack: number;
}

export default function TrainerInterface({ initialStack }: TrainerInterfaceProps) {
    // --- State ---
    const [stackSize, setStackSize] = useState<number>(initialStack);
    const [openerPos, setOpenerPos] = useState<Position>('CO');
    const [userPos, setUserPos] = useState<Position>('BU'); // Hero's position
    const [currentCards, setCurrentCards] = useState<[string, string] | null>(null); // e.g., ["As", "Kd"]
    const [currentHandKey, setCurrentHandKey] = useState<string | null>(null); // e.g., "AKo"
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showRange, setShowRange] = useState<boolean>(false);
    const [correctRange, setCorrectRange] = useState<PositionRangeData | null>(null);
    const [correctAction, setCorrectAction] = useState<Action | null>(null);
    const [isActionMade, setIsActionMade] = useState<boolean>(false); // Disable buttons after action
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for initial hand

    // --- Position Filtering ---
    // Filter available opener positions (cannot be BB)
    const availableOpenerPositions = POSITIONS_8MAX.filter(p => p !== 'BB');

    // Filter available user positions based on opener (must be after opener, or in blinds, cannot be opener)
    // NOTE: This logic determines which positions are *selectable* in the dropdown,
    // it does NOT affect the visual rotation on the table.
    const availableUserPositions = POSITIONS_8MAX.filter(p => {
        const openerIndex = POSITIONS_8MAX.indexOf(openerPos);
        const userIndex = POSITIONS_8MAX.indexOf(p);
        // Allow positions after the opener OR SB/BB, but not the opener itself
        // Standard poker order: UTG -> BB clockwise
        const isAfterOpener = (userIndex > openerIndex);
        // Special cases for blinds defending vs non-blind opens
        const isBlindDefending = ['SB', 'BB'].includes(p) && !['SB', 'BB'].includes(openerPos);
        // Special case: SB defending vs BB open (not applicable here as BB doesn't open)
        // Special case: BB defending vs SB open
        const isBbVsSb = p === 'BB' && openerPos === 'SB';

        // Combine conditions: Must not be opener AND (must be after opener OR blind defending)
        // This logic needs refinement for exact poker rules (e.g., SB can defend vs BU)
        // Let's simplify: Any position except the opener is valid for selection for now.
        // GTO ranges will determine valid scenarios.
        // return p !== openerPos;

        // More accurate filtering (still might need edge case checks):
        if (p === openerPos) return false; // Cannot be the opener
        if (openerPos === 'SB') return p === 'BB'; // Only BB can defend vs SB open
        // If opener is not SB, then positions after opener + SB + BB are valid defenders
        return isAfterOpener || p === 'SB' || p === 'BB';

    });

    // --- Hand Generation and Scenario Update ---
    const setupNewScenario = useCallback(() => {
        setIsLoading(true); // Start loading
        setFeedback(null); // Clear previous feedback immediately
        setShowRange(false);
        setCorrectRange(null);
        setIsActionMade(false); // Re-enable buttons

        // Generate cards and format hand key
        const cards = generateTwoRandomCards();
        const handKey = formatHandForRangeLookup(cards[0], cards[1]);

        // Pre-calculate correct action for the new hand/scenario
        // Ensure userPos is valid relative to openerPos before getting action
        // This check should ideally happen based on GTO data availability,
        // but we'll rely on the dropdown filtering for now.
        const action = getSimplifiedGtoAction(openerPos, userPos, stackSize, handKey);

        // Update state after calculations
        setCurrentCards(cards);
        setCurrentHandKey(handKey);
        setCorrectAction(action);
        setIsLoading(false); // End loading

    }, [openerPos, userPos, stackSize]); // Dependencies

    // Generate initial hand or when settings change
    useEffect(() => {
        setupNewScenario();
    }, [setupNewScenario]); // Run once on mount and when relevant state changes

    // Reset user position if it becomes invalid when opener changes
    useEffect(() => {
        // If the current userPos is no longer in the list of valid defenders for the new opener,
        // select the first available valid defender position.
        if (!availableUserPositions.includes(userPos)) {
            const defaultPos = availableUserPositions.length > 0 ? availableUserPositions[0] : 'BB'; // Default to BB if list empty somehow
             setUserPos(defaultPos);
             // Note: setupNewScenario will run again due to userPos change
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openerPos, availableUserPositions]); // Include missing dependencies as requested by ESLint rule


    // --- Action Handling ---
    const handleAction = (chosenAction: Action) => {
        if (isLoading || !currentHandKey || isActionMade) return; // Prevent actions during load or after completion, no need to check correctAction === null here

        setIsActionMade(true); // Disable buttons

        // Get the correct action again here just in case state wasn't fully updated
        // though useCallback should handle this. Or rely on the state `correctAction`.
        const currentCorrectAction = getSimplifiedGtoAction(openerPos, userPos, stackSize, currentHandKey);


        if (currentCorrectAction === null) {
             // Handle case where range/action wasn't found
             setFeedback(`❓ Range data not found for ${currentHandKey} in ${userPos} vs ${openerPos}. Cannot determine correct action.`);
             setShowRange(false);
             setCorrectRange(null);
             return; // Exit early
        }


        if (chosenAction === currentCorrectAction) {
            setFeedback(`✅ Correct! GTO play with ${currentHandKey} is ${currentCorrectAction}.`);
            setShowRange(false);
        } else {
            setFeedback(`❌ Incorrect. You chose ${chosenAction}. GTO play with ${currentHandKey} is ${currentCorrectAction}.`);
            // Fetch and set the correct range only on incorrect answers where data exists
            const range = getGtoRange(openerPos, userPos, stackSize);
            setCorrectRange(range);
            setShowRange(true);
        }
    };

    // --- Render ---
    return (
        <div className="w-full max-w-5xl p-4 sm:p-6 bg-gray-100 rounded-lg shadow-xl border border-gray-200">
            {/* Settings Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-300">
                <SelectDropdown
                    label="Stack Size (BB)"
                    value={stackSize.toString()}
                    onChange={(e) => setStackSize(parseInt(e.target.value, 10))}
                    options={STACK_SIZES.map(s => ({ value: s.toString(), label: `${s}bb` }))}
                    id="stack-size-select"
                />
                <SelectDropdown
                    label="Opener Position"
                    value={openerPos}
                    onChange={(e) => setOpenerPos(e.target.value as Position)}
                    options={availableOpenerPositions.map(p => ({ value: p, label: p }))}
                    id="opener-pos-select"
                />
                <SelectDropdown
                    label="Your Position (Hero)"
                    value={userPos}
                    onChange={(e) => setUserPos(e.target.value as Position)}
                    // Ensure dropdown only shows valid defending positions for the current opener
                    options={availableUserPositions.map(p => ({ value: p, label: p }))}
                    id="user-pos-select"
                />
            </div>

            {/* Display Area: Table and Cards */}
            {/* Increased min-height to better accommodate table layout */}
            <div className="mb-6 relative min-h-[350px] md:min-h-[450px] flex flex-col items-center justify-start pt-4">
                 {/* Poker Table - Takes up space */}
                <div className="w-full mb-4">
                    <PokerTable
                        positions={POSITIONS_8MAX} // Pass the standard order
                        openerPos={openerPos}
                        userPos={userPos} // Pass the actual selected hero position
                        stackSize={stackSize}
                    />
                </div>

                {/* Cards - Positioned absolutely in the center of the parent container */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 h-20 md:h-28 flex items-center justify-center">
                    {isLoading ? (
                         <div className="text-gray-700 animate-pulse font-semibold">Dealing...</div>
                    ) : (
                        <CardDisplay cards={currentCards} />
                    )}
                 </div>
            </div>


            {/* Action Buttons */}
            <ActionButtons onAction={handleAction} disabled={isActionMade || isLoading} />

            {/* Feedback Area */}
            {feedback && (
                <div className={`mt-4 p-3 rounded-md text-center font-medium ${
                    feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' :
                    feedback.startsWith('❌') ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-yellow-100 text-yellow-800 border border-yellow-300' // Style for info/warning
                }`}>
                    {feedback}
                </div>
            )}

            {/* Next Hand Button */}
            <div className="text-center mt-4">
                <button
                    onClick={setupNewScenario}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    // Disable if loading OR if an action hasn't been made yet (unless there's feedback already shown from previous hand)
                    disabled={isLoading || (!isActionMade && feedback === null)}
                >
                    {isLoading ? 'Loading...' : 'Next Hand'}
                </button>
            </div>


            {/* Range Display (Conditional) */}
            {showRange && correctRange && ( // Only show if showRange is true AND correctRange is not null
                <div className="mt-6 pt-4 border-t border-gray-300">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">
                        Correct Range for {userPos} vs {openerPos} Open ({stackSize}bb):
                    </h3>
                    <RangeGrid rangeData={correctRange} />
                </div>
            )}
        </div>
    );
}