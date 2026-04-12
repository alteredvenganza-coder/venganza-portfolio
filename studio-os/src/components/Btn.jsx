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
      'bg-white border border-border text-ink hover:border-burgundy-muted hover:text-burgundy disabled:opacity-50',
    ghost:
      'text-muted hover:text-ink hover:bg-paper disabled:opacity-50',
    danger:
      'bg-[#fce8e6] text-[#7b1f24] border border-[#f5c6c6] hover:bg-[#f5c6c6] disabled:opacity-50',
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
