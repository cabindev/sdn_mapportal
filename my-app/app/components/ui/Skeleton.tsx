// app/components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'map' | 'card' | 'text' | 'circle';
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200";
  
  let variantClasses = "";
  
  switch (variant) {
    case 'map':
      variantClasses = "w-full h-full min-h-[300px]";
      break;
    case 'card':
      variantClasses = "w-full h-32 rounded-lg";
      break;
    case 'text':
      variantClasses = "h-4 rounded";
      break;
    case 'circle':
      variantClasses = "rounded-full";
      break;
  }
  
  return <div className={`${baseClasses} ${variantClasses} ${className}`}></div>;
}