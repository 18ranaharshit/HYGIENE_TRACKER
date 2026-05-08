import type { ReactNode } from 'react';

/**
 * Badge — Status/category label chip.
 * @param variant - Color variant
 * @param children - Badge content
 * @param className - Extra classes
 */
interface BadgeProps {
  variant?: 'teal' | 'amber' | 'red' | 'blue' | 'green' | 'gray';
  children: ReactNode;
  className?: string;
}

const variantMap = {
  teal:  'badge-teal',
  amber: 'badge-amber',
  red:   'badge-red',
  blue:  'badge-blue',
  green: 'badge-green',
  gray:  'badge-gray',
};

export default function Badge({ variant = 'teal', children, className = '' }: BadgeProps) {
  return (
    <span className={`${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
}
