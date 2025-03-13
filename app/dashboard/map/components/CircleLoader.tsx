'use client'

import { motion } from 'framer-motion';

interface CircleLoaderProps {
  size?: string;
  thickness?: string;
  color?: string;
  duration?: number;
  message?: string;
  containerClassName?: string;
  variant?: 'circle' | 'dots' | 'pulse' | 'spinner' | 'bar' | 'skeleton';
  fullscreen?: boolean;
  overlay?: boolean;
}

export default function CircleLoader({
  size = '60px',
  thickness = '6px',
  color = '#F97316',
  duration = 1,
  message,
  containerClassName,
  variant = 'circle',
  fullscreen = false,
  overlay = false
}: CircleLoaderProps) {
  const defaultContainerClass = fullscreen 
    ? "fixed inset-0 z-50 flex items-center justify-center" 
    : "h-full w-full flex items-center justify-center";
  
  const containerClasses = `${defaultContainerClass} ${containerClassName || ''}`;
  const overlayClasses = overlay ? "bg-white/80 backdrop-blur-sm" : "";

  return (
    <div className={`${containerClasses} ${overlayClasses}`}>
      <div className="flex flex-col items-center justify-center">
        {variant === 'circle' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration,
              repeat: Infinity, 
              ease: "linear"
            }}
            style={{
              width: size,
              height: size,
              border: `${thickness} solid rgba(249, 115, 22, 0.1)`,
              borderTopColor: color,
              borderRadius: '50%'
            }}
          />
        )}
        
        {variant === 'dots' && (
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
                style={{
                  width: `calc(${size} / 3)`,
                  height: `calc(${size} / 3)`,
                  borderRadius: '50%',
                  backgroundColor: color
                }}
              />
            ))}
          </div>
        )}
        
        {variant === 'pulse' && (
          <div className="relative">
            <motion.div
              style={{ 
                width: size, 
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
                opacity: 0.2
              }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              style={{ 
                width: size, 
                height: size,
                borderRadius: '50%',
                backgroundColor: color,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 'auto'
              }}
              animate={{ scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        )}
        
        {/* Spinner - ทันสมัยกว่า */}
        {variant === 'spinner' && (
          <motion.div
            className="relative"
            style={{ width: size, height: size }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                border: `${thickness} solid rgba(249, 115, 22, 0.1)`,
                borderRadius: '50%',
              }}
            />
            <motion.div
              className="absolute inset-0"
              style={{
                borderRadius: '50%',
                borderTop: `${thickness} solid ${color}`,
                borderRight: `${thickness} solid transparent`,
                borderBottom: `${thickness} solid transparent`,
                borderLeft: `${thickness} solid transparent`,
              }}
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity, 
                ease: "linear"
              }}
            />
          </motion.div>
        )}
        
        {/* Bar - เรียบง่ายแบบมินิมอล */}
        {variant === 'bar' && (
          <div 
            className="relative overflow-hidden" 
            style={{ 
              width: typeof size === 'string' ? size : '120px', 
              height: typeof thickness === 'string' ? thickness : '4px',
              backgroundColor: `${color}30`,
              borderRadius: '8px'
            }}
          >
            <motion.div
              className="absolute top-0 left-0 bottom-0"
              style={{ backgroundColor: color, borderRadius: '8px' }}
              animate={{ 
                x: ['-100%', '100%'],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              initial={{ width: '50%' }}
            />
          </div>
        )}
        
        {/* Skeleton - ที่นิยมมากในปัจจุบัน */}
        {variant === 'skeleton' && (
          <div className="w-full max-w-sm">
            {/* รูปร่างของคอนเทนท์ที่กำลังโหลด */}
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <motion.div 
                  className="h-4 bg-gray-200 rounded"
                  animate={{ opacity: [0.7, 0.4, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                ></motion.div>
                <motion.div 
                  className="h-4 w-3/4 bg-gray-200 rounded"
                  animate={{ opacity: [0.7, 0.4, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                ></motion.div>
              </div>
            </div>
          </div>
        )}
        
        {message && (
          <motion.p 
            className="mt-4 text-slate-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
}