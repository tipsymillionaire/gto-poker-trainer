import React from 'react';
// Assuming SUIT_SYMBOLS is defined like: {'s': '♠', 'h': '♥', 'd': '♦', 'c': '♣'}
import { SUIT_SYMBOLS } from '@/lib/constants';

interface CardDisplayProps {
  cards: [string, string] | null; // Expecting specific cards like ["As", "Kd"]
}

const CardDisplay: React.FC<CardDisplayProps> = ({ cards }) => {
  // Define card dimensions (adjust as needed)
  const cardWidth = 'w-10'; // Use Tailwind width class (40px)
  const cardHeight = 'h-14'; // Use Tailwind height class (56px)

  // Function to get suit BACKGROUND color class
  // Using slightly darker shades for better white text contrast
  const getSuitBgColor = (suit: string): string => {
    switch (suit.toLowerCase()) {
      case 's': return 'bg-gray-800';   // Spades: Dark Gray/Black
      case 'h': return 'bg-red-600';     // Hearts: Red
      case 'd': return 'bg-blue-600';    // Diamonds: Blue
      case 'c': return 'bg-green-600';   // Clubs: Green
      default: return 'bg-gray-800';     // Default background
    }
  };

  // Function to render a single card using CSS
  const renderCard = (card: string | null, key: number) => {
    if (!card || card.length < 2) {
      // Render a placeholder or card back style if needed
      // Keeping placeholder background white for visibility
      return (
        <div key={key} className={`${cardWidth} ${cardHeight} bg-gray-300 border border-gray-400 rounded shadow-md flex items-center justify-center text-gray-500`}>?</div>
      );
    }

    const rank = card[0].toUpperCase();
    const suit = card[1].toLowerCase();
    const suitSymbol = SUIT_SYMBOLS[suit] || suit; // Get symbol or fallback to letter
    const suitBgClass = getSuitBgColor(suit);      // Get the background color class

    return (
      <div
        key={key}
        // Apply dynamic background, remove bg-white, ensure white text
        className={`${cardWidth} ${cardHeight} ${suitBgClass} border border-black/30 rounded shadow-md flex flex-col items-center justify-center p-1 font-bold text-lg text-white`}
      >
        {/* Main rank and suit - Apply text-white directly */}
        <span className={`block text-center leading-none`}>{rank}</span>
        <span className={`block text-center text-xl leading-none`}>{suitSymbol}</span>
        {/* Corner elements removed for simplicity, but could be added back with text-white */}
      </div>
    );
  };


  if (!cards) {
    // Display placeholders if no cards are provided yet
    return (
        <div className="flex space-x-1">
            {renderCard(null, 1)}
            {renderCard(null, 2)}
        </div>
    );
  }

  const [card1, card2] = cards;

  return (
    <div className="flex space-x-1">
        {renderCard(card1, 1)}
        {renderCard(card2, 2)}
    </div>
  );
};

export default CardDisplay;