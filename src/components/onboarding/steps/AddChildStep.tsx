import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, GraduationCap, SpinnerGap } from '@phosphor-icons/react';
import { useStore } from '../../../store/useStore';
import { createChild } from '../../../services/authService';
import type { Grade } from '../../../types';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-indigo-500',
];

const GRADES: { value: Grade; label: string; age: string }[] = [
  { value: 'CP', label: 'CP', age: '6 ans' },
  { value: 'CE1', label: 'CE1', age: '7 ans' },
  { value: 'CE2', label: 'CE2', age: '8 ans' },
  { value: 'CM1', label: 'CM1', age: '9 ans' },
  { value: 'CM2', label: 'CM2', age: '10 ans' },
];

export const AddChildStep: React.FC = () => {
  const { family, user, addChild, selectChild, updateOnboardingStep, setOnboardingState } = useStore();

  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade>('CE2');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log store state on mount
  console.log('[AddChildStep] Component mounted');
  console.log('[AddChildStep] Family:', family);
  console.log('[AddChildStep] User:', user);

  const handleBack = () => {
    updateOnboardingStep('welcome');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Family in store:', family);
    console.log('Name:', name);

    if (!name.trim()) {
      setError('Veuillez entrer un prénom');
      return;
    }

    if (!family) {
      console.error('[AddChildStep] Family is null in store. User:', user);
      console.error('[AddChildStep] Full store state:', useStore.getState());
      setError('Erreur: famille non trouvée. Veuillez vous déconnecter et vous reconnecter.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating child with familyId:', family.id);
      const child = await createChild(family.id, {
        name: name.trim(),
        grade,
        avatarColor,
      });

      addChild(child);
      selectChild(child);
      setOnboardingState({ step: 'avatar', childData: child });
    } catch (err: any) {
      console.error('Error creating child:', err);
      console.error('Error code:', err?.code);
      console.error('Error message:', err?.message);
      setError(`Erreur: ${err?.message || 'Veuillez réessayer.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-6"
    >
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-rounded font-bold text-gray-900 mb-2">
            Ajouter un enfant
          </h1>
          <p className="text-gray-500">
            Créez le profil de votre enfant pour commencer l'apprentissage
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="w-full space-y-6"
        >
          {/* Avatar Preview */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-24 h-24 ${avatarColor} rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-colors`}
            >
              {name ? name[0].toUpperCase() : <User className="w-10 h-10" weight="fill" />}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom de l'enfant
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Emma"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg"
              required
              autoFocus
            />
          </div>

          {/* Grade Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <GraduationCap className="w-4 h-4 inline mr-1" />
              Classe
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGrade(g.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    grade === g.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold">{g.label}</div>
                  <div className="text-xs text-gray-400">{g.age}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de l'avatar
            </label>
            <div className="flex flex-wrap gap-3 justify-center">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-10 h-10 ${color} rounded-full transition-all ${
                    avatarColor === color
                      ? 'ring-4 ring-offset-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <SpinnerGap className="w-5 h-5 animate-spin" weight="bold" />
            ) : (
              'Créer le profil'
            )}
          </button>
        </motion.form>

        {/* Progress Dots */}
        <div className="flex gap-2 mt-8">
          <div className="w-3 h-3 bg-blue-200 rounded-full" />
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
};
