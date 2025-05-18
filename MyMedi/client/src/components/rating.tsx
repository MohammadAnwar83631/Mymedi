import React from 'react';

interface RatingProps {
  value: number; // Expected to be between 0 and 5
}

const Rating: React.FC<RatingProps> = ({ value }) => {
  // Normalize value to be between 0 and 5
  const normalizedValue = Math.max(0, Math.min(5, value));
  
  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(normalizedValue);
  const hasHalfStar = normalizedValue % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex">
      {/* Full Stars */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <i key={`full-${index}`} className="fas fa-star text-amber-400"></i>
      ))}
      
      {/* Half Star */}
      {hasHalfStar && (
        <i className="fas fa-star-half-alt text-amber-400"></i>
      )}
      
      {/* Empty Stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <i key={`empty-${index}`} className="far fa-star text-amber-400"></i>
      ))}
    </div>
  );
};

export default Rating;
