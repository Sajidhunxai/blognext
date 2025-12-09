"use client";

interface StarRatingProps {
  rating: number; // 0.0 to 5.0
  showNumber?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ratingCount?: number; // Optional number of ratings
}

export default function StarRating({
  rating,
  showNumber = false,
  size = "sm",
  className = "",
  ratingCount,
}: StarRatingProps) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={`text-yellow-400 ${sizeClasses[size]}`}>
          ★
        </span>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <span className={`text-yellow-400 ${sizeClasses[size]}`} style={{ opacity: 0.5 }}>
          ★
        </span>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className={`text-gray-300 ${sizeClasses[size]}`}>
          ★
        </span>
      ))}
      
      {/* Rating number */}
      {showNumber && (
        <span className={`text-gray-600 font-semibold ml-1 ${sizeClasses[size]}`}>
          {clampedRating.toFixed(1)}
          {typeof ratingCount === "number" && ratingCount > 0 && (
            <span className="text-gray-400 font-normal"> ({ratingCount})</span>
          )}
        </span>
      )}
    </div>
  );
}

