import { RANKS, SUITS } from './constants';

/**
 * Generates a random poker hand in the format used for range lookups (e.g., "AKs", "72o", "TT").
 * This simplified version picks ranks and suitedness randomly.
 * A more accurate simulation would deal two distinct cards.
 * @returns {string} A hand string like "AKs", "TT", "72o".
 */
export function generateRandomHandInRangeFormat(): string {
    let r1Idx = Math.floor(Math.random() * RANKS.length);
    let r2Idx = Math.floor(Math.random() * RANKS.length);
    let rank1 = RANKS[r1Idx];
    let rank2 = RANKS[r2Idx];

    // Handle pairs
    if (r1Idx === r2Idx) {
        return `${rank1}${rank2}`;
    }

    // Ensure canonical order (higher rank first, e.g., AK, not KA)
    if (r1Idx > r2Idx) { // Lower index means higher rank in RANKS array
        [rank1, rank2] = [rank2, rank1];
        [r1Idx, r2Idx] = [r2Idx, r1Idx]; // Swap indices too if needed elsewhere
    }

    // Determine if suited or offsuit (adjust probability if needed)
    // Simplified: 4 suited combos vs 12 offsuit combos for non-pairs
    const isSuited = Math.random() < (4 / 16); // ~25% chance
    return `${rank1}${rank2}${isSuited ? 's' : 'o'}`;
}


/**
 * Generates two distinct random cards (e.g., ["As", "Kd"]).
 * @returns {[string, string]} An array containing two card strings.
 */
export function generateTwoRandomCards(): [string, string] {
    const deck = RANKS.flatMap(rank => SUITS.map(suit => rank + suit));
    // Use const as these are not reassigned
    const card1Index = Math.floor(Math.random() * deck.length);
    const card1 = deck[card1Index];

    // Remove card1 from deck to prevent duplicates
    deck.splice(card1Index, 1);

    // Use const as these are not reassigned
    const card2Index = Math.floor(Math.random() * deck.length);
    const card2 = deck[card2Index];

    return [card1, card2];
}


/**
 * Converts two specific cards (e.g., "As", "Kd") into the range format ("AKo").
 * @param {string} card1 - First card (e.g., "As").
 * @param {string} card2 - Second card (e.g., "Kd").
 * @returns {string} The hand in range format (e.g., "AKo", "TT", "A5s").
 */
export function formatHandForRangeLookup(card1: string, card2: string): string {
    let r1 = card1[0]; let s1 = card1[1];
    let r2 = card2[0]; let s2 = card2[1];

    // Use const as these are not reassigned
    const idx1 = RANKS.indexOf(r1);
    const idx2 = RANKS.indexOf(r2);

    if (idx1 === -1 || idx2 === -1) {
        console.error("Invalid card rank:", card1, card2);
        return "Invalid"; // Or throw error
    }

    // Handle pairs
    if (idx1 === idx2) {
        return r1 + r2;
    }

    // Ensure canonical order (higher rank first)
    if (idx1 > idx2) { // Lower index means higher rank
        [r1, r2] = [r2, r1];
        [s1, s2] = [s2, s1]; // Keep suits aligned with ranks after swap
    }

    // Determine suitedness
    return `${r1}${r2}${s1 === s2 ? 's' : 'o'}`;
}

/**
 * Gets the file path for a card image.
 * Assumes images are named like "As.png", "Kd.png" in public/images/cards/
 * @param {string} card - Card string (e.g., "As", "Td").
 * @returns {string} The relative path to the card image.
 */
export function getCardImagePath(card: string): string {
    if (!card || card.length < 2) return '/images/cards/back.png'; // Default/fallback
    // Basic validation - could be more robust
    const rank = card[0].toUpperCase();
    const suit = card[1].toLowerCase();
    if (!RANKS.includes(rank) || !SUITS.includes(suit)) {
         return '/images/cards/back.png'; // Fallback for invalid format
    }
    return `/images/cards/${rank}${suit}.png`; // e.g., /images/cards/As.png
}

// ----------------------------------------
// 5. Range Data Access Logic
// lib/ranges.ts
// IMPORTANT: This relies on the structure of your JSON data.
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
    if (!range) { // Check if range itself is null first
         console.warn(`Range not found for ${defenderPos} vs ${openerPos} @ ${stack}bb. Cannot determine action for ${hand}. Defaulting to FOLD.`);
         return 'FOLD';
    }
    const handActionDetail = range[hand]; // Now try to access the hand detail

    if (!handActionDetail) {
        // Handle hands potentially missing (e.g., if range isn't 100% complete)
        // Defaulting to FOLD might be reasonable for unknown hands in many spots.
        console.warn(`Hand ${hand} not found in range for ${defenderPos} vs ${openerPos} @ ${stack}bb. Defaulting to FOLD.`);
        return 'FOLD'; // Default if hand truly missing
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