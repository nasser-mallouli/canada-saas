import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, hover = false, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-soft p-6 transition-all duration-200 ${
        hover ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
}
