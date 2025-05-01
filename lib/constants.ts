export const POSITIONS_8MAX = ['UTG', 'UTG+1', 'LJ', 'HJ', 'CO', 'BU', 'SB', 'BB'] as const;
export type Position = typeof POSITIONS_8MAX[number];

export const ACTIONS = ['FOLD', 'CALL', 'RAISE'] as const;
export type Action = typeof ACTIONS[number];

export const STACK_SIZES = [40]; // Add more later: [20, 30, 40, 60, 80, 100];

export const OPEN_RAISE_SIZE_BB = [2.3];

// Hand rankings for sorting/display
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS = ['s', 'h', 'd', 'c']; // Spades, Hearts, Diamonds, Clubs
export const SUIT_SYMBOLS: { [key: string]: string } = { // Map suit letters to symbols
    s: '♠',
    h: '♥',
    d: '♦',
    c: '♣',
};