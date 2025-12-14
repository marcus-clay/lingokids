import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkle, ArrowsClockwise } from '@phosphor-icons/react';
import { useStore } from '../../../store/useStore';
import { updateChild } from '../../../services/authService';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

// Avatar customization options
const SKIN_COLORS = [
  { name: 'Clair', value: 'f2d3b1' },
  { name: 'Beige', value: 'ecad80' },
  { name: 'Moyen', value: 'd08b5b' },
  { name: 'Foncé', value: 'ae5d29' },
  { name: 'Très foncé', value: '614335' },
];

const HAIR_COLORS = [
  { name: 'Noir', value: '0e0e0e' },
  { name: 'Brun', value: '3a1a00' },
  { name: 'Châtain', value: '6a4e35' },
  { name: 'Blond', value: 'e8c46e' },
  { name: 'Roux', value: 'b55239' },
  { name: 'Rose', value: 'e493b3' },
  { name: 'Bleu', value: '6bd9e9' },
];

const HAIR_STYLES = [
  'short01', 'short02', 'short03', 'short04', 'short05',
  'long01', 'long02', 'long03', 'long04', 'long05',
  'long06', 'long07', 'long08', 'long09', 'long10',
];

const EYES_STYLES = [
  'variant01', 'variant02', 'variant03', 'variant04', 'variant05',
  'variant06', 'variant07', 'variant08', 'variant09', 'variant10',
  'variant11', 'variant12', 'variant13',
];

const MOUTH_STYLES = [
  'variant01', 'variant02', 'variant03', 'variant04', 'variant05',
  'variant06', 'variant07', 'variant08', 'variant09', 'variant10',
];

const EYEBROWS_STYLES = [
  'variant01', 'variant02', 'variant03', 'variant04', 'variant05',
  'variant06', 'variant07', 'variant08', 'variant09', 'variant10',
];

export const AvatarStep: React.FC = () => {
  const { selectedChild, updateChildInStore, updateOnboardingStep } = useStore();

  const [skinColor, setSkinColor] = useState(SKIN_COLORS[0].value);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[1].value);
  const [hairIndex, setHairIndex] = useState(0);
  const [eyesIndex, setEyesIndex] = useState(0);
  const [mouthIndex, setMouthIndex] = useState(0);
  const [eyebrowsIndex, setEyebrowsIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Generate avatar SVG
  const avatarSvg = useMemo(() => {
    const avatar = createAvatar(adventurer, {
      seed: selectedChild?.name || 'avatar',
      skinColor: [skinColor],
      hairColor: [hairColor],
      hair: [HAIR_STYLES[hairIndex]] as any,
      eyes: [EYES_STYLES[eyesIndex]] as any,
      mouth: [MOUTH_STYLES[mouthIndex]] as any,
      eyebrows: [EYEBROWS_STYLES[eyebrowsIndex]] as any,
      backgroundColor: ['transparent'],
    });
    return avatar.toDataUri();
  }, [selectedChild?.name, skinColor, hairColor, hairIndex, eyesIndex, mouthIndex, eyebrowsIndex]);

  const handleBack = () => {
    updateOnboardingStep('add-child');
  };

  const randomize = () => {
    setSkinColor(SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].value);
    setHairColor(HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].value);
    setHairIndex(Math.floor(Math.random() * HAIR_STYLES.length));
    setEyesIndex(Math.floor(Math.random() * EYES_STYLES.length));
    setMouthIndex(Math.floor(Math.random() * MOUTH_STYLES.length));
    setEyebrowsIndex(Math.floor(Math.random() * EYEBROWS_STYLES.length));
  };

  const handleContinue = async () => {
    if (!selectedChild) return;

    setIsLoading(true);

    const customization = {
      skinTone: skinColor,
      hairStyle: HAIR_STYLES[hairIndex],
      hairColor: hairColor,
      eyes: EYES_STYLES[eyesIndex],
      mouth: MOUTH_STYLES[mouthIndex],
      eyebrows: EYEBROWS_STYLES[eyebrowsIndex],
      accessories: [],
      outfit: 'casual',
    };

    try {
      await updateChild(selectedChild.id, {
        avatarCustomization: customization,
      });

      updateChildInStore(selectedChild.id, {
        avatarCustomization: customization,
      });

      updateOnboardingStep('first-lesson');
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cycleOption = (
    current: number,
    max: number,
    setter: (val: number) => void,
    direction: 'next' | 'prev' = 'next'
  ) => {
    if (direction === 'next') {
      setter((current + 1) % max);
    } else {
      setter(current === 0 ? max - 1 : current - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-purple-50 to-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-500" />
        </button>
        <button
          onClick={randomize}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
        >
          <ArrowsClockwise className="w-4 h-4" weight="bold" />
          <span className="text-sm font-medium">Hasard</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center max-w-lg mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cree ton avatar !
          </h1>
          <p className="text-gray-500">
            {selectedChild?.name}, personnalise ton personnage
          </p>
        </motion.div>

        {/* Avatar Preview */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="relative mb-6"
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-xl border-4 border-white overflow-hidden">
            <img
              src={avatarSvg}
              alt="Avatar"
              className="w-36 h-36"
            />
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkle className="w-8 h-8 text-yellow-400" weight="fill" />
          </motion.div>
        </motion.div>

        {/* Customization Options */}
        <div className="w-full space-y-5 bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
          {/* Skin Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de peau
            </label>
            <div className="flex justify-center gap-3">
              {SKIN_COLORS.map((skin) => (
                <button
                  key={skin.value}
                  onClick={() => setSkinColor(skin.value)}
                  className={`w-10 h-10 rounded-full transition-all border-2 ${
                    skinColor === skin.value
                      ? 'ring-4 ring-blue-500 ring-offset-2 scale-110 border-white'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: `#${skin.value}` }}
                  title={skin.name}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coiffure
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => cycleOption(hairIndex, HAIR_STYLES.length, setHairIndex, 'prev')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="px-6 py-2 bg-blue-50 rounded-full text-blue-700 font-medium min-w-[100px] text-center">
                Style {hairIndex + 1}
              </div>
              <button
                onClick={() => cycleOption(hairIndex, HAIR_STYLES.length, setHairIndex, 'next')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors rotate-180"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de cheveux
            </label>
            <div className="flex justify-center gap-2 flex-wrap">
              {HAIR_COLORS.map((hair) => (
                <button
                  key={hair.value}
                  onClick={() => setHairColor(hair.value)}
                  className={`w-9 h-9 rounded-full transition-all border-2 ${
                    hairColor === hair.value
                      ? 'ring-4 ring-blue-500 ring-offset-2 scale-110 border-white'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: `#${hair.value}` }}
                  title={hair.name}
                />
              ))}
            </div>
          </div>

          {/* Eyes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yeux
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => cycleOption(eyesIndex, EYES_STYLES.length, setEyesIndex, 'prev')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="px-6 py-2 bg-green-50 rounded-full text-green-700 font-medium min-w-[100px] text-center">
                Style {eyesIndex + 1}
              </div>
              <button
                onClick={() => cycleOption(eyesIndex, EYES_STYLES.length, setEyesIndex, 'next')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors rotate-180"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Mouth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bouche
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => cycleOption(mouthIndex, MOUTH_STYLES.length, setMouthIndex, 'prev')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="px-6 py-2 bg-pink-50 rounded-full text-pink-700 font-medium min-w-[100px] text-center">
                Style {mouthIndex + 1}
              </div>
              <button
                onClick={() => cycleOption(mouthIndex, MOUTH_STYLES.length, setMouthIndex, 'next')}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors rotate-180"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Sauvegarde...' : "C'est parfait !"}
        </motion.button>

        {/* Progress Dots */}
        <div className="flex gap-2 mt-6">
          <div className="w-3 h-3 bg-blue-200 rounded-full" />
          <div className="w-3 h-3 bg-blue-200 rounded-full" />
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
};
