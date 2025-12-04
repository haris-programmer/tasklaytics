import { useState } from 'react';
import './Button.css';

export function Button({
  children,
  variant = 'default',
  size = 'default',
  icon,
  className = '',
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Use the premium glow style for primary variant
  if (variant === 'primary') {
    return (
      <button
        className="neu-button neu-button--primary-glow"
        style={{
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Glow effect layers */}
        <div className="neu-button__glow-outer" />
        <div className="neu-button__glow-inner" />
        <div className="neu-button__glow-center" />

        {/* Content */}
        <span className="neu-button__content">
          {icon && <span className="neu-button__icon">{icon}</span>}
          <span className="neu-button__text">{children}</span>
        </span>
      </button>
    );
  }

  // Default button styling for other variants
  const classes = [
    'neu-button',
    variant !== 'default' && `neu-button--${variant}`,
    size === 'icon' && 'neu-button--icon',
    size === 'icon-sm' && 'neu-button--icon-sm',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <span className="neu-button__icon">{icon}</span>}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>
    </button>
  );
}
