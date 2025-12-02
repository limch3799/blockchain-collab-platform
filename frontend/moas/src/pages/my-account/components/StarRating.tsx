interface StarRatingProps {
  rating: number;
}

const StarRating = ({ rating }: StarRatingProps) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.min(Math.max(rating - (star - 1), 0), 1) * 100; // 0–100%

        return (
          <div key={star} className="relative w-5 h-5">
            {/* Gray background star */}
            <svg className="absolute top-0 left-0 w-5 h-5 fill-gray-300" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>

            {/* Yellow foreground star (clipped by percentage) */}
            <div
              className="absolute top-0 left-0 h-5 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <svg className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
