import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1919] focus:ring-[#3a3131] transition-colors';
  
  const variantStyles = {
    default: 'bg-[#3a3131] text-white hover:bg-[#4a4141]',
    outline: 'bg-transparent border border-[#3a3131] text-white hover:bg-[#3a3131]',
    ghost: 'bg-transparent text-white hover:bg-[#3a3131]',
  };

  const sizeStyles = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (asChild) {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          className: `${child.props.className || ''} ${combinedClassName}`,
          ...props,
        } as React.HTMLAttributes<HTMLElement>);
      }
      return child;
    });
  }

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;