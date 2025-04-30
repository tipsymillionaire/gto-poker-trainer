import React from 'react';
import { getCardImagePath } from '@/lib/pokerUtils';

interface CardDisplayProps {
  cards: [string, string] | null; // Expecting specific cards like ["As", "Kd"]
}

const CardDisplay: React.FC<CardDisplayProps> = ({ cards }) => {
  if (!cards) {
    return <div className="text-white text-lg font-semibold">Waiting for hand...</div>;
  }

  const [card1, card2] = cards;
  const imgPath1 = getCardImagePath(card1);
  const imgPath2 = getCardImagePath(card2);

  // Basic display - use actual images and better styling
  return (
    <div className="flex space-x-1">
       {/* Use img tags for actual card images */}
       {/* Ensure you have card images in public/images/cards/ */}
       <img src={imgPath1} alt={card1} className="h-20 w-auto md:h-28 rounded shadow-md bg-white" onError={(e) => (e.currentTarget.src = '/images/cards/back.png')} />
       <img src={imgPath2} alt={card2} className="h-20 w-auto md:h-28 rounded shadow-md bg-white" onError={(e) => (e.currentTarget.src = '/images/cards/back.png')} />

       {/* Fallback text display */}
       {/* <div className="w-16 h-24 bg-white rounded border border-gray-400 flex items-center justify-center text-black text-2xl font-bold shadow-lg">{card1}</div>
           <div className="w-16 h-24 bg-white rounded border border-gray-400 flex items-center justify-center text-black text-2xl font-bold shadow-lg">{card2}</div> */}
    </div>
  );
};

export default CardDisplay;