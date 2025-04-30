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

    // --- Position Filtering ---
    // Filter available opener positions (cannot be BB)
    const availableOpenerPositions = POSITIONS_8MAX.filter(p => p !== 'BB');

    // Filter available user positions based on opener (must be after opener, or in blinds, cannot be opener)
    const availableUserPositions = POSITIONS_8MAX.filter(p => {
        const openerIndex = POSITIONS_8MAX.indexOf(openerPos);
        const userIndex = POSITIONS_8MAX.indexOf(p);
        // Allow positions after the opener OR SB/BB, but not the opener itself
        return p !== openerPos && (userIndex > openerIndex || ['SB', 'BB'].includes(p));
    });

    // --- Hand Generation and Scenario Update ---
    const setupNewScenario = useCallback(() => {
        const cards = generateTwoRandomCards();
        const handKey = formatHandForRangeLookup(cards[0], cards[1]);

        setCurrentCards(cards);
        setCurrentHandKey(handKey);
        setFeedback(null);
        setShowRange(false);
        setCorrectRange(null);
        setIsActionMade(false); // Re-enable buttons

        // Pre-calculate correct action for the new hand/scenario
        const action = getSimplifiedGtoAction(openerPos, userPos, stackSize, handKey);
        setCorrectAction(action);

    }, [openerPos, userPos, stackSize]); // Dependencies

    // Generate initial hand or when settings change
    useEffect(() => {
        setupNewScenario();
    }, [setupNewScenario]); // Run once on mount and when relevant state changes

    // Reset user position if it becomes invalid when opener changes
    useEffect(() => {
        if (!availableUserPositions.includes(userPos)) {
            // Default to the first valid position (often BU vs CO, or SB/BB)
            setUserPos(availableUserPositions[0] || 'BB');
        }
        // We don't necessarily want to generate a new hand *just* because the valid list changed,
        // only when the *selected* opener/userPos actually changes (handled by setupNewScenario effect).
    }, [openerPos]); // Rerun only when opener changes

    // --- Action Handling ---
    const handleAction = (chosenAction: Action) => {
        if (!currentHandKey || correctAction === null || isActionMade) return; // Prevent multiple actions

        setIsActionMade(true); // Disable buttons

        if (chosenAction === correctAction) {
            setFeedback(`✅ Correct! GTO play with ${currentHandKey} is ${correctAction}.`);
            setShowRange(false);
        } else {
            setFeedback(`❌ Incorrect. You chose ${chosenAction}. GTO play with ${currentHandKey} is ${correctAction}.`);
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
                />
                <SelectDropdown
                    label="Opener Position"
                    value={openerPos}
                    onChange={(e) => setOpenerPos(e.target.value as Position)}
                    options={availableOpenerPositions.map(p => ({ value: p, label: p }))}
                />
                <SelectDropdown
                    label="Your Position (Hero)"
                    value={userPos}
                    onChange={(e) => setUserPos(e.target.value as Position)}
                    options={availableUserPositions.map(p => ({ value: p, label: p }))}
                />
            </div>

            {/* Display Area: Table and Cards */}
            <div className="mb-6 relative min-h-[250px] md:min-h-[350px] flex flex-col items-center justify-center">
                 {/* Poker Table */}
                <div className="w-full mb-4">
                    <PokerTable
                        positions={POSITIONS_8MAX}
                        openerPos={openerPos}
                        userPos={userPos}
                        stackSize={stackSize}
                    />
                </div>

                {/* Cards - Positioned below the table center or overlay */}
                 <div className="mt-[-60px] md:mt-[-80px] z-20 relative"> {/* Adjust vertical offset */}
                    <CardDisplay cards={currentCards} />
                 </div>
            </div>


            {/* Action Buttons */}
            <ActionButtons onAction={handleAction} disabled={isActionMade} />

            {/* Feedback Area */}
            {feedback && (
                <div className={`mt-4 p-3 rounded-md text-center font-medium ${
                    feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' :
                    feedback.startsWith('❌') ? 'bg-red-100 text-red-800 border border-red-300' :
                    'bg-gray-100 text-gray-800 border border-gray-300' // Default style if needed
                }`}>
                    {feedback}
                </div>
            )}

            {/* Next Hand Button */}
            <div className="text-center mt-4">
                <button
                    onClick={setupNewScenario}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                    disabled={!isActionMade && feedback !== null} // Enable after action OR if no action yet
                >
                    Next Hand
                </button>
            </div>


            {/* Range Display (Conditional) */}
            {showRange && (
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