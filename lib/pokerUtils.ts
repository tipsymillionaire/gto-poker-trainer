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
 * Gets the file path for a card image. (No longer primary method, kept for potential fallback)
 * Assumes images are named like "As.png", "Kd.png" in public/images/cards/
 * @param {string} card - Card string (e.g., "As", "Td").
 * @returns {string} The relative path to the card image.
 */
/* // Commenting out as we are using CSS cards now
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
*/