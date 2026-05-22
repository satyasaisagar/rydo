'use client';

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils';
import { Loader2, X } from 'lucide-react';

// ─── Button ───────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]';
    const variants = {
      primary:   'bg-[#00C853] text-black hover:bg-[#00A846] focus:ring-[#00C853]',
      secondary: 'border border-white/10 text-white hover:bg-white/5 focus:ring-white/20',
      ghost:     'text-white/60 hover:text-white hover:bg-white/5 focus:ring-white/10',
      danger:    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500',
    };
    const sizes = {
      sm: 'px-3.5 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading} {...props}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ─── Badge ────────────────────────────────────────────────
interface BadgeProps { children: ReactNode; variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray'; className?: string; }

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    green:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    yellow: 'bg-yellow-500/10  text-yellow-400  border border-yellow-500/20',
    red:    'bg-red-500/10     text-red-400     border border-red-500/20',
    blue:   'bg-blue-500/10   text-blue-400    border border-blue-500/20',
    gray:   'bg-white/5       text-white/50    border border-white/10',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────
interface CardProps { children: ReactNode; className?: string; hover?: boolean; }

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn(
      'bg-[#111111] border border-white/[0.06] rounded-2xl',
      hover && 'hover:border-[#00C853]/20 transition-colors cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────
interface AvatarProps { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string; }

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const initials = name?.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?';

  if (src) {
    return (
      <img src={src} alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)} />
    );
  }
  return (
    <div className={cn('rounded-full bg-[#00C853]/15 flex items-center justify-center text-[#00C853] font-bold flex-shrink-0', sizes[size], className)}>
      {initials}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white placeholder-white/30 outline-none',
            'focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/30 transition-all',
            error && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
            icon   ? 'pl-10' : 'pl-4',
            suffix ? 'pr-11' : 'pr-4',
            className,
          )}
          {...props}
        />
        {suffix && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none',
          'focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853]/30 transition-all appearance-none',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#111]">{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ─── Toggle ───────────────────────────────────────────────
interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label?: string; description?: string; }

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div>
          {label       && <p className="text-sm font-medium text-white">{label}</p>}
          {description && <p className="text-xs text-white/40">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0',
          checked ? 'bg-[#00C853]' : 'bg-white/10'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; maxWidth?: string; }

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-[#111111] border border-white/[0.08] rounded-2xl shadow-2xl', maxWidth)}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-white/[0.05] rounded-lg animate-pulse', className)} />;
}

// ─── Empty State ──────────────────────────────────────────
interface EmptyStateProps { icon?: ReactNode; title: string; description?: string; action?: ReactNode; }

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-4 text-white/20">{icon}</div>}
      <h3 className="text-white font-semibold text-xl mb-2">{title}</h3>
      {description && <p className="text-white/40 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ─── Star Rating ──────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'md' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={cn(sizes[size], i < Math.round(rating) ? 'text-[#00C853] fill-current' : 'text-white/10 fill-current')}
          viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-white/40">{rating > 0 ? rating.toFixed(1) : '—'}</span>
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <Loader2 className={cn('animate-spin text-[#00C853]', sizes[size], className)} />
  );
}

// ─── Divider ──────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/[0.06]" />
      {label && <span className="text-white/30 text-xs">{label}</span>}
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}
export { default as LocationAutocomplete } from './LocationAutocomplete';
export type { LocationResult } from './LocationAutocomplete';
