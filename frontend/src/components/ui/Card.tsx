import type { ReactNode } from 'react';

/**
 * Card — Styled container component from Stitch design system.
 * @param children - Card content
 * @param className - Extra Tailwind classes
 * @param hover - Enable hover glow effect
 * @param onClick - Click handler (makes card interactive)
 */
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card'} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}
