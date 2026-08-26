import React from 'react';

export function Button({
  className = '',
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}) {
  const Comp = asChild ? 'span' : 'button';

  // Base utility classes for the button, including focus rings and transitions
  const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

  // shadcn-like variants mapped to Yojsetu theme colors (slate and orange)
  const variants = {
    default: 'bg-orange-500 text-white shadow hover:bg-orange-600 active:scale-95 hover:shadow-md',
    destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-95',
    outline: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:scale-95',
    secondary: 'bg-slate-100 text-slate-950 shadow-sm hover:bg-slate-200 active:scale-95',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95',
    link: 'text-orange-500 underline-offset-4 hover:underline active:opacity-85',
  };

  // sizes for the button
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-md px-8 text-base',
    icon: 'h-10 w-10',
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.default;

  return (
    <Comp
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    />
  );
}
