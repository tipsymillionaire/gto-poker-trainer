'use client'; // VERY IMPORTANT! This component needs interactivity

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { POSITIONS_8MAX, STACK_SIZES, Action, Position } from '@/lib/constants';
import { getSimplifiedGtoAction, getGtoRange, PositionRangeData } from '@/lib/ranges';
import { generateTwoRandomCards, formatHandForRangeLookup } from '@/lib/pokerUtils';
import PokerTable from '../ui/PokerTable';
// import CardDisplay from './CardDisplay'; // No longer needed here
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
    // Store the correct action in state, calculated by setupNewScenario
    const [correctActionState, setCorrectActionState] = useState<Action | null>(null);
    const [isActionMade, setIsActionMade] = useState<boolean>(false); // Disable buttons after action
    const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state for initial hand

    // --- Position Filtering ---
    const availableOpenerPositions = POSITIONS_8MAX.filter(p => p !== 'BB');
    const availableUserPositions = useMemo(() => {
        // **Important**: With a fixed layout, the user can technically be in any position
        // relative to the opener. The filtering logic might need adjustment depending
        // on the specific scenarios you want to train (e.g., only allow positions after the opener).
        // For now, allow any position except the opener itself.
        return POSITIONS_8MAX.filter(p => p !== openerPos);
        /* // Original logic (only positions after opener or blinds):
        return POSITIONS_8MAX.filter(p => {
            const openerIndex = POSITIONS_8MAX.indexOf(openerPos);
            const userIndex = POSITIONS_8MAX.indexOf(p);
            const isAfterOpener = (userIndex > openerIndex);
            if (p === openerPos) return false;
            if (openerPos === 'SB') return p === 'BB';
            return isAfterOpener || p === 'SB' || p === 'BB';
        });
        */
    }, [openerPos]);

    // --- Hand Generation and Scenario Update ---
    const setupNewScenario = useCallback(() => {
        setIsLoading(true);
        setFeedback(null);
        setShowRange(false);
        setCorrectRange(null);
        setIsActionMade(false);

        // Ensure userPos is valid for the selected openerPos based on filtering logic
        // This might need adjustment if the filtering logic changes significantly
        const validUserPositions = POSITIONS_8MAX.filter(p => p !== openerPos);
        let currentValidUserPos = userPos;
        if (!validUserPositions.includes(userPos)) {
            currentValidUserPos = validUserPositions.length > 0 ? validUserPositions[0] : 'BB'; // Fallback
            setUserPos(currentValidUserPos); // Update state if needed
        }


        const cards = generateTwoRandomCards();
        const handKey = formatHandForRangeLookup(cards[0], cards[1]);
        // Use the potentially updated userPos for fetching the action
        const action = getSimplifiedGtoAction(openerPos, currentValidUserPos, stackSize, handKey);

        setCurrentCards(cards);
        setCurrentHandKey(handKey);
        setCorrectActionState(action);
        setIsLoading(false);

    }, [openerPos, userPos, stackSize]); // Dependencies

    // Generate initial hand or when settings change
    useEffect(() => {
        setupNewScenario();
    }, [setupNewScenario]); // Run once on mount and when relevant state changes

    // Reset user position if it becomes invalid when opener changes (using updated logic)
    useEffect(() => {
        const validUserPositions = POSITIONS_8MAX.filter(p => p !== openerPos);
        if (!validUserPositions.includes(userPos)) {
            const defaultPos = validUserPositions.length > 0 ? validUserPositions[0] : 'BB'; // Simple fallback
             setUserPos(defaultPos);
        }
    }, [openerPos, userPos]); // Removed availableUserPositions dependency as it's recalculated inline


    // --- Action Handling ---
    const handleAction = (chosenAction: Action) => {
        if (isLoading || !currentHandKey || isActionMade) return;

        setIsActionMade(true);

        if (correctActionState === null) {
             // Ensure feedback uses the current userPos state value
             setFeedback(`❓ Range data not found for ${currentHandKey} in ${userPos} vs ${openerPos}. Cannot determine correct action.`);
             setShowRange(false);
             setCorrectRange(null);
             return;
        }

        if (chosenAction === correctActionState) {
            setFeedback(`✅ Correct! GTO play with ${currentHandKey} is ${correctActionState}.`);
            setShowRange(false);
        } else {
            setFeedback(`❌ Incorrect. You chose ${chosenAction}. GTO play with ${currentHandKey} is ${correctActionState}.`);
            const range = getGtoRange(openerPos, userPos, stackSize);
            setCorrectRange(range);
            setShowRange(true);
        }
    };

    // --- Render ---
    return (
        <div className="w-full max-w-5xl p-4 sm:p-6  rounded-lg shadow-xl border border-gray-200">
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
                    // Update options based on the potentially simplified filtering logic
                    options={POSITIONS_8MAX.filter(p => p !== openerPos).map(p => ({ value: p, label: p }))}
                    id="user-pos-select"
                />
            </div>

            {/* Display Area: Table now handles cards */}
            {/* Adjusted min-height slightly */}
            <div className="mb-6 relative min-h-[350px] md:min-h-[450px] flex flex-col items-center justify-start pt-4"> {/* Increased min-height */}
                 {/* Poker Table - Renders seats AND cards */}
                <div className="w-full mb-4">
                    <PokerTable
                        positions={POSITIONS_8MAX}
                        openerPos={openerPos}
                        userPos={userPos}
                        stackSize={stackSize}
                        heroCards={currentCards} // Pass cards to table
                        isLoading={isLoading} // Pass loading state
                    />
                </div>

                {/* Central Card Display Removed */}
                {/* Loading indicator can be placed elsewhere if needed, or handled within PokerTable */}
                {isLoading && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700 animate-pulse font-semibold z-30">
                        Dealing...
                    </div>
                )}
            </div>


            {/* Action Buttons */}
            <ActionButtons onAction={handleAction} disabled={isActionMade || isLoading} />

            {/* Feedback Area */}
            {feedback && (
                <div className={`mt-4 p-3 rounded-md text-center font-medium ${
                    feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' :
                    feedback.startsWith('❌') ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                    {feedback}
                </div>
            )}

            {/* Next Hand Button */}
            <div className="text-center mt-4">
                <button
                    onClick={setupNewScenario}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLoading || (!isActionMade && feedback === null)}
                >
                    {isLoading ? 'Loading...' : 'Next Hand'}
                </button>
            </div>


            {/* Range Display (Conditional) */}
            {showRange && correctRange && (
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