import { motion } from 'framer-motion';

// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
export default function Btn({
  children,
  variant = 'secondary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center gap-1.5 font-sans font-medium rounded transition-colors focus:outline-none select-none';

  const sizes = {
    sm: 'px-3 py-2 sm:py-1.5 text-xs',
    md: 'px-4 py-2.5 sm:py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  const variants = {
    primary:
      'bg-burgundy text-white hover:bg-burgundy-light disabled:opacity-50',
    secondary:
      'bg-white/10 border border-white/15 text-ink hover:bg-white/15 hover:border-white/25 disabled:opacity-50',
    ghost:
      'text-muted hover:text-ink hover:bg-white/8 disabled:opacity-50',
    danger:
      'bg-red-950/60 text-red-300 border border-red-800/50 hover:bg-red-900/60 disabled:opacity-50',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
