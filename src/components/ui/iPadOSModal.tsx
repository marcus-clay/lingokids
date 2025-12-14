import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Diamond, Star } from '@phosphor-icons/react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

// iPadOS-style spring configurations
const modalSpring = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 30,
  mass: 0.8,
};

const backdropSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 35,
};

interface iPadOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  variant?: 'default' | 'celebration' | 'warning' | 'info';
}

export const IPadOSModal: React.FC<iPadOSModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  variant = 'default',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      hapticService.mediumTap();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    soundService.playClick();
    hapticService.lightTap();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-[95vw] max-h-[90vh]',
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white',
    celebration: 'bg-gradient-to-br from-amber-50 to-orange-50',
    warning: 'bg-gradient-to-br from-red-50 to-orange-50',
    info: 'bg-gradient-to-br from-blue-50 to-indigo-50',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropSpring}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop with blur - iPadOS style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{
              opacity: 0,
              scale: 0.85,
              y: 50,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 30,
            }}
            transition={modalSpring}
            className={`
              relative w-full ${sizeClasses[size]} ${variantStyles[variant]}
              rounded-3xl shadow-2xl shadow-black/20
              overflow-hidden
              border border-white/20
            `}
          >
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 pointer-events-none" />

            {/* Close Button - Always visible */}
            {showCloseButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, ...modalSpring }}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" weight="bold" />
              </motion.button>
            )}

            {/* Header */}
            {(title || subtitle) && (
              <div className="relative px-6 pt-6 pb-2">
                {title && (
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, ...modalSpring }}
                    className="text-2xl font-bold text-gray-900 pr-10"
                  >
                    {title}
                  </motion.h2>
                )}
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mt-1"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="relative px-6 py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Pre-built modal variants for common use cases
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
}) => {
  const handleConfirm = () => {
    soundService.playClick();
    hapticService.mediumTap();
    onConfirm();
    onClose();
  };

  return (
    <IPadOSModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      variant={variant === 'warning' ? 'warning' : 'default'}
    >
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
        >
          {cancelText}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
            variant === 'warning'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-[#58CC02] text-white hover:bg-[#4CAF00]'
          }`}
        >
          {confirmText}
        </motion.button>
      </div>
    </IPadOSModal>
  );
};

// Celebration Modal for achievements
interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rewards?: { type: 'xp' | 'gems' | 'stars'; amount: number }[];
  actionText?: string;
  onAction?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  rewards,
  actionText = 'Continuer',
  onAction,
}) => {
  const handleAction = () => {
    soundService.playSuccess();
    hapticService.success();
    onAction?.();
    onClose();
  };

  return (
    <IPadOSModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      variant="celebration"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <div className="text-center py-4">
        {/* Icon */}
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-orange-200 rounded-3xl flex items-center justify-center shadow-lg"
          >
            {icon}
          </motion.div>
        )}

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          {title}
        </motion.h2>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 mb-6"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Rewards */}
        {rewards && rewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 mb-6"
          >
            {rewards.map((reward, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 400 }}
                className={`px-4 py-2 rounded-full font-bold ${
                  reward.type === 'xp'
                    ? 'bg-purple-100 text-purple-600'
                    : reward.type === 'gems'
                    ? 'bg-pink-100 text-pink-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                +{reward.amount} {reward.type === 'xp' ? 'XP' : reward.type === 'gems' ? <Diamond className="w-4 h-4 inline-block" weight="fill" /> : <Star className="w-4 h-4 inline-block" weight="fill" />}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAction}
          className="w-full py-4 px-6 rounded-2xl bg-[#58CC02] text-white font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all"
        >
          {actionText}
        </motion.button>
      </div>
    </IPadOSModal>
  );
};

export default IPadOSModal;
