import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { hapticService } from '../../services/hapticService';
import { soundService } from '../../services/soundService';

// ============================================
// iPadOS / Liquid Glass Style Interactive Elements
// ============================================

// Spring configurations for fluid animations
const liquidSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const gentleSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

const softSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 15,
};

// ============================================
// GLASS BUTTON - Primary action button with liquid glass effect
// ============================================

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  haptic?: boolean;
  sound?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  loading = false,
  haptic = true,
  sound = true,
  onClick,
  disabled,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
    secondary: 'bg-white/80 backdrop-blur-xl text-gray-800 border border-white/50 shadow-lg hover:bg-white/90',
    success: 'bg-gradient-to-br from-[#58CC02] to-[#4CAF00] text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
    ghost: 'bg-gray-100/80 backdrop-blur-sm text-gray-700 hover:bg-gray-200/80',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-xl gap-1.5',
    md: 'px-6 py-3 text-base rounded-2xl gap-2',
    lg: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
    xl: 'px-10 py-5 text-xl rounded-3xl gap-3',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    if (haptic) hapticService.mediumTap();
    if (sound) soundService.playClick();
    onClick?.(e);
  };

  return (
    <motion.button
      whileHover={{
        scale: disabled ? 1 : 1.03,
        y: disabled ? 0 : -2,
      }}
      whileTap={{
        scale: disabled ? 1 : 0.97,
        y: 0,
      }}
      transition={liquidSpring}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        font-bold flex items-center justify-center
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        active:transition-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  );
};

// ============================================
// GLASS CARD - Container with liquid glass effect
// ============================================

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  interactive?: boolean;
  intensity?: 'light' | 'medium' | 'strong';
  glow?: boolean;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  interactive = false,
  intensity = 'medium',
  glow = false,
  glowColor = 'blue',
  onClick,
  className = '',
  ...props
}) => {
  const intensityStyles = {
    light: 'bg-white/60 backdrop-blur-md border-white/30',
    medium: 'bg-white/80 backdrop-blur-xl border-white/50',
    strong: 'bg-white/95 backdrop-blur-2xl border-white/70',
  };

  const glowStyles = glow
    ? `shadow-xl shadow-${glowColor}-500/20 hover:shadow-2xl hover:shadow-${glowColor}-500/30`
    : 'shadow-lg hover:shadow-xl';

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      hapticService.lightTap();
    }
    onClick?.(e);
  };

  return (
    <motion.div
      whileHover={interactive ? {
        scale: 1.02,
        y: -4,
      } : undefined}
      whileTap={interactive ? {
        scale: 0.98,
        y: 0,
      } : undefined}
      transition={gentleSpring}
      onClick={handleClick}
      className={`
        rounded-3xl border p-5
        transition-shadow duration-300
        ${intensityStyles[intensity]}
        ${glowStyles}
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// ============================================
// INTERACTIVE OPTION - For quiz/selection options
// ============================================

interface InteractiveOptionProps {
  children: React.ReactNode;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const InteractiveOption: React.FC<InteractiveOptionProps> = ({
  children,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  onClick,
  icon,
  className = '',
}) => {
  const getVariantStyles = () => {
    if (correct) {
      return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-800 shadow-lg shadow-green-500/20';
    }
    if (incorrect) {
      return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 text-red-800 shadow-lg shadow-red-500/20';
    }
    if (selected) {
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-800 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/50';
    }
    return 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-800 hover:border-blue-300 hover:bg-blue-50/50';
  };

  const handleClick = () => {
    if (disabled) return;
    hapticService.lightTap();
    soundService.playClick();
    onClick?.();
  };

  return (
    <motion.button
      whileHover={!disabled ? {
        scale: 1.02,
        x: 4,
      } : undefined}
      whileTap={!disabled ? {
        scale: 0.98,
        x: 0,
      } : undefined}
      transition={liquidSpring}
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full p-4 rounded-2xl border-2
        flex items-center gap-3
        font-medium text-left
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${getVariantStyles()}
        ${className}
      `}
    >
      {icon && (
        <motion.span
          initial={false}
          animate={{
            scale: selected || correct || incorrect ? 1.1 : 1,
            rotate: correct ? [0, -10, 10, 0] : 0,
          }}
          transition={softSpring}
          className="flex-shrink-0"
        >
          {icon}
        </motion.span>
      )}
      <span className="flex-1">{children}</span>
      {(selected || correct || incorrect) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={liquidSpring}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center
            ${correct ? 'bg-green-500' : incorrect ? 'bg-red-500' : 'bg-blue-500'}
          `}
        >
          {correct && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {incorrect && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {selected && !correct && !incorrect && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </motion.div>
      )}
    </motion.button>
  );
};

// ============================================
// FLOATING ACTION BUTTON
// ============================================

interface FloatingButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  onClick,
  color = 'blue',
  size = 'md',
  pulse = false,
  className = '',
}) => {
  const colorStyles = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/40',
    green: 'bg-gradient-to-br from-[#58CC02] to-[#4CAF00] shadow-green-500/40',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/40',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/40',
  };

  const sizeStyles = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const handleClick = () => {
    hapticService.mediumTap();
    soundService.playClick();
    onClick?.();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={liquidSpring}
      onClick={handleClick}
      className={`
        ${sizeStyles[size]}
        ${colorStyles[color]}
        rounded-full shadow-xl
        flex items-center justify-center
        text-white
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <motion.span
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.span>
    </motion.button>
  );
};

// ============================================
// ICON BUTTON - Small circular button
// ============================================

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'solid';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'default',
  size = 'md',
  label,
  disabled = false,
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
    glass: 'bg-white/60 backdrop-blur-md hover:bg-white/80 text-gray-700 border border-white/50',
    solid: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/30',
  };

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const handleClick = () => {
    if (disabled) return;
    hapticService.lightTap();
    onClick?.();
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.9 } : undefined}
      transition={liquidSpring}
      onClick={handleClick}
      disabled={disabled}
      title={label}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        rounded-full
        flex items-center justify-center
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {icon}
    </motion.button>
  );
};

// ============================================
// PROGRESS PILL - Animated progress indicator
// ============================================

interface ProgressPillProps {
  current: number;
  total: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  showNumbers?: boolean;
  className?: string;
}

export const ProgressPill: React.FC<ProgressPillProps> = ({
  current,
  total,
  color = 'blue',
  showNumbers = true,
  className = '',
}) => {
  const percentage = Math.min((current / total) * 100, 100);

  const colorStyles = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-[#58CC02] to-[#4CAF00]',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-3 bg-gray-200/80 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ ...gentleSpring, duration: 0.5 }}
          className={`h-full bg-gradient-to-r ${colorStyles[color]} rounded-full`}
        />
      </div>
      {showNumbers && (
        <motion.span
          key={current}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-sm font-bold text-gray-600 min-w-[40px] text-right"
        >
          {current}/{total}
        </motion.span>
      )}
    </div>
  );
};

// ============================================
// REWARD BURST - Animated reward display
// ============================================

interface RewardBurstProps {
  value: number | string;
  icon: React.ReactNode;
  color?: 'yellow' | 'purple' | 'blue' | 'green';
  label?: string;
  className?: string;
}

export const RewardBurst: React.FC<RewardBurstProps> = ({
  value,
  icon,
  color = 'yellow',
  label,
  className = '',
}) => {
  const colorStyles = {
    yellow: 'from-yellow-400 to-orange-500 shadow-yellow-500/40',
    purple: 'from-purple-400 to-pink-500 shadow-purple-500/40',
    blue: 'from-blue-400 to-indigo-500 shadow-blue-500/40',
    green: 'from-green-400 to-emerald-500 shadow-green-500/40',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        ...liquidSpring,
        delay: 0.1,
      }}
      className={`
        inline-flex flex-col items-center gap-1
        ${className}
      `}
    >
      <motion.div
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        }}
        className={`
          w-16 h-16 rounded-2xl
          bg-gradient-to-br ${colorStyles[color]}
          shadow-xl
          flex items-center justify-center
          text-white
        `}
      >
        {icon}
      </motion.div>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-800"
      >
        +{value}
      </motion.span>
      {label && (
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      )}
    </motion.div>
  );
};
