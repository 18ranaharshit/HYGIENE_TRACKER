import { Star } from 'lucide-react';

/**
 * StarRating — Interactive or read-only star rating component.
 * @param value - Current rating value (1-5)
 * @param onChange - Callback when rating changes (if interactive)
 * @param max - Maximum stars (default: 5)
 * @param readOnly - If true, renders static stars
 * @param size - Icon size in px
 */
interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: number;
}

export default function StarRating({ value, onChange, max = 5, readOnly = false, size = 18 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5" role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;
        return (
          <button
            key={i}
            type="button"
            onClick={readOnly ? undefined : () => onChange?.(starValue)}
            disabled={readOnly}
            className={`transition-all duration-100 ${readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'}`}
            aria-label={readOnly ? undefined : `Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            <Star
              size={size}
              className={`transition-colors ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
