import React from 'react';
import Image from 'next/image'; // Import next/image
import { getCardImagePath } from '@/lib/pokerUtils';

interface CardDisplayProps {
  cards: [string, string] | null; // Expecting specific cards like ["As", "Kd"]
}

const CardDisplay: React.FC<CardDisplayProps> = ({ cards }) => {
  // Define card dimensions (adjust as needed)
  const cardWidth = 70; // Example width in pixels
  const cardHeight = 100; // Example height based on typical card aspect ratio

  if (!cards) {
    // Display placeholders or card backs while loading/waiting
    return (
        <div className="flex space-x-1">
           {/* Use placeholder or card back image */}
           <Image
                src='/images/cards/back.png'
                alt="Card Back"
                width={cardWidth}
                height={cardHeight}
                className="rounded shadow-md bg-white"
                unoptimized // Use if images are static and don't need optimization
            />
           <Image
                src='/images/cards/back.png'
                alt="Card Back"
                width={cardWidth}
                height={cardHeight}
                className="rounded shadow-md bg-white"
                unoptimized
            />
        </div>
    );
  }

  const [card1, card2] = cards;
  const imgPath1 = getCardImagePath(card1);
  const imgPath2 = getCardImagePath(card2);

  return (
    <div className="flex space-x-1">
       {/* Use next/image component */}
       <Image
            src={imgPath1}
            alt={card1}
            width={cardWidth}
            height={cardHeight}
            className="rounded shadow-md bg-white"
            unoptimized // Assuming local images don't need Next.js optimization
            // Add priority if this is likely to be LCP
       />
       <Image
            src={imgPath2}
            alt={card2}
            width={cardWidth}
            height={cardHeight}
            className="rounded shadow-md bg-white"
            unoptimized
       />
    </div>
  );
};

export default CardDisplay;