import { Position, Action } from './constants';
// Attempt to import the JSON data directly.
// Ensure your tsconfig.json has "resolveJsonModule": true in compilerOptions
import rangeData from '@/data/gtoRanges_40bb_8max.json';

// Define types matching the JSON structure (adapt if your structure differs)
export type HandActionDetail = {
    action: 'R' | 'C' | 'F'; // Raise, Call, Fold (adjust if your data uses different codes)
    frequency?: number; // Optional frequency for mixed strategies
};

export type PositionRangeData = {
    [hand: string]: HandActionDetail; // e.g., "AKs": { action: "R" }
};

type VsPositionRanges = {
    [vsPosKey: string]: PositionRangeData; // e.g., "vs_BU": { ... }
};

type OpenerRanges = {
    [pos in Position]?: VsPositionRanges;
};

// Type assertion: Assume the imported JSON matches OpenerRanges for the 40bb stack
// You might need more robust loading if supporting multiple stack sizes from one file
const ranges40bb: OpenerRanges = rangeData as OpenerRanges;

/**
 * Fetches the complete GTO range for a specific scenario.
 * @param {Position} openerPos - The position of the preflop opener.
 * @param {Position} defenderPos - The position of the player facing the open.
 * @param {number} stack - The effective stack size (currently only 40 supported).
 * @returns {PositionRangeData | null} The range data object or null if not found.
 */
export function getGtoRange(openerPos: Position, defenderPos: Position, stack: number): PositionRangeData | null {
    if (stack !== 40) {
        console.warn(`Stack size ${stack}bb not currently supported.`);
        return null;
    }
    if (!openerPos || !defenderPos || openerPos === defenderPos) {
        console.warn(`Invalid positions for vs Open scenario: ${openerPos} vs ${defenderPos}`);
        return null;
    }

    const vsKey = `vs_${defenderPos}`;
    const openerData = ranges40bb[openerPos];

    if (openerData && openerData[vsKey]) {
        return openerData[vsKey];
    }

    console.warn(`Range not found for ${defenderPos} vs ${openerPos} @ ${stack}bb`);
    return null;
}

/**
 * Gets the simplified GTO action for a specific hand in a given scenario.
 * Currently returns the primary action (ignores frequency/mixed strategies).
 * @param {Position} openerPos - The position of the preflop opener.
 * @param {Position} defenderPos - The position of the player facing the open.
 * @param {number} stack - The effective stack size.
 * @param {string} hand - The hand in range format (e.g., "AKs").
 * @returns {Action | null} The GTO action ('FOLD', 'CALL', 'RAISE') or null if not found/invalid.
 */
export function getSimplifiedGtoAction(openerPos: Position, defenderPos: Position, stack: number, hand: string): Action | null {
    const range = getGtoRange(openerPos, defenderPos, stack);

    // *** Check if range is null before accessing it ***
    if (!range) {
         console.warn(`Range not found for ${defenderPos} vs ${openerPos} @ ${stack}bb. Cannot determine action for ${hand}. Returning null.`);
         // Return null or a default action like 'FOLD' if appropriate for your logic
         return null; // Returning null indicates action couldn't be determined
         // return 'FOLD'; // Alternative: Default to Fold if range is missing
    }

    const handActionDetail = range[hand]; // Now safe to access

    if (!handActionDetail) {
        // Handle hands potentially missing within an existing range
        console.warn(`Hand ${hand} not found in range for ${defenderPos} vs ${openerPos} @ ${stack}bb. Defaulting to FOLD.`);
        return 'FOLD'; // Default if hand truly missing from the range data
    }


    // Map data action codes ('R', 'C', 'F') to our Action type
    switch (handActionDetail.action) {
        case 'F': return 'FOLD';
        case 'C': return 'CALL';
        case 'R': return 'RAISE';
        default:
            console.error(`Unknown action code '${handActionDetail.action}' in range data for hand ${hand}.`);
            return null; // Indicate an error or unexpected data
    }
}