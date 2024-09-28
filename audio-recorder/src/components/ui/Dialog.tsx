import React, { useState, useEffect, ReactNode } from 'react';

interface DialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative bg-[#1c1919] rounded-lg shadow-xl">
        {children}
      </div>
    </div>
  );
};

export const DialogTrigger: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const DialogContent: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const DialogHeader: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
};

export const DialogDescription: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <p className="text-sm text-gray-500">{children}</p>;
};