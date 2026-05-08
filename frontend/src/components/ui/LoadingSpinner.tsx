/**
 * LoadingSpinner — Animated teal spinner for async loading states.
 * @param size - 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`${sizeMap[size]} ${className}`} role="status" aria-label="Loading">
      <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#14b8a6" strokeWidth="3" />
        <path
          className="opacity-90"
          fill="#14b8a6"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
