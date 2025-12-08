import React, { useState } from 'react';
import { UserProfile, GRADES, AVATAR_COLORS, Grade } from '../types';
import { GraduationCap } from 'lucide-react';

interface AddChildProfileProps {
  onCreateProfile: (profile: Omit<UserProfile, 'id'>) => void;
  onCancel: () => void;
}

export const AddChildProfile: React.FC<AddChildProfileProps> = ({ onCreateProfile, onCancel }) => {
  const [name, setName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<Grade>('CE2');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[3]); // green by default
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedGradeInfo = GRADES.find(g => g.grade === selectedGrade);

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Veuillez entrer le prénom de l\'enfant.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Le prénom doit contenir au moins 2 caractères.');
      return;
    }

    if (name.trim().length > 20) {
      setError('Le prénom ne peut pas dépasser 20 caractères.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newProfile: Omit<UserProfile, 'id'> = {
        name: name.trim(),
        role: 'CHILD',
        age: selectedGradeInfo?.age,
        grade: selectedGrade,
        avatarColor: selectedColor,
      };

      onCreateProfile(newProfile);
    } catch (err) {
      setError('Erreur lors de la création du profil. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-rounded font-bold text-gray-900 mb-2">
            Ajouter un enfant
          </h1>
          <p className="text-gray-500 text-lg">
            Créez le profil de votre enfant pour commencer l'apprentissage
          </p>
        </div>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-8">
          <div
            className={`w-24 h-24 rounded-full ${selectedColor} flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-colors duration-300`}
          >
            {name.trim() ? name.trim()[0].toUpperCase() : '?'}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 md:p-8 border border-gray-100">
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Prénom de l'enfant
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le prénom"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-gray-900 text-lg"
              maxLength={20}
            />
          </div>

          {/* Grade Selection */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-gray-700 font-medium mb-3">
              <GraduationCap size={18} />
              Classe
            </label>
            <div className="grid grid-cols-5 gap-2">
              {GRADES.map((gradeInfo) => (
                <button
                  key={gradeInfo.grade}
                  onClick={() => setSelectedGrade(gradeInfo.grade)}
                  className={`
                    py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center
                    ${selectedGrade === gradeInfo.grade
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <div className="font-bold text-sm">{gradeInfo.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{gradeInfo.age} ans</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-3">
              Couleur de l'avatar
            </label>
            <div className="flex flex-wrap justify-center gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-12 h-12 rounded-full ${color} transition-all duration-200
                    ${selectedColor === color
                      ? 'ring-4 ring-offset-2 ring-primary-300 scale-110'
                      : 'hover:scale-105'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-center text-red-500 font-medium animate-in fade-in">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`
              w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200
              ${isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-xl'
              }
            `}
          >
            {isSubmitting ? 'Création en cours...' : 'Créer le profil'}
          </button>

          {/* Cancel Link */}
          <button
            onClick={onCancel}
            className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Annuler
          </button>
        </div>

        {/* Pagination Dots (for visual consistency with screenshot) */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-primary-200" />
          <div className="w-2 h-2 rounded-full bg-primary-500" />
          <div className="w-2 h-2 rounded-full bg-primary-200" />
          <div className="w-2 h-2 rounded-full bg-primary-200" />
        </div>
      </div>
    </div>
  );
};
