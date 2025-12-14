import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, ChartBar, Gear, Plus, Crown } from '@phosphor-icons/react';
import { useStore } from '../store/useStore';

export const ParentPortal: React.FC = () => {
  const { user, children, setCurrentView } = useStore();

  const handleBack = () => {
    setCurrentView('PROFILE_SELECT');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-400" weight="fill" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Espace Parent</h1>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <ChartBar className="w-5 h-5 text-blue-500" weight="fill" />
            Vue d'ensemble
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-600">{children.length}</p>
              <p className="text-sm text-gray-500">Enfant(s)</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-600">
                {children.reduce((acc, c) => acc + c.totalXp, 0)}
              </p>
              <p className="text-sm text-gray-500">XP Total</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <p className="text-3xl font-bold text-orange-600">
                {Math.max(...children.map(c => c.streak), 0)}
              </p>
              <p className="text-sm text-gray-500">Meilleure série</p>
            </div>
          </div>
        </motion.div>

        {/* Children List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" weight="fill" />
              Profils enfants
            </h2>
            <button
              onClick={() => setCurrentView('ONBOARDING')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" weight="bold" />
              Ajouter
            </button>
          </div>

          {children.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Aucun enfant ajouté. Cliquez sur "Ajouter" pour commencer.
            </p>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${child.avatarColor} rounded-full flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {child.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{child.name}</p>
                      <p className="text-sm text-gray-400">
                        {child.grade} • Niveau {child.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{child.totalXp} XP</p>
                    <p className="text-sm text-gray-400">
                      Série: {child.streak} jours
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Gear className="w-5 h-5 text-gray-500" weight="fill" />
            Paramètres
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-800">Notifications</p>
              <p className="text-sm text-gray-400">Gérer les alertes de progression</p>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-800">Code PIN parental</p>
              <p className="text-sm text-gray-400">Protéger l'accès à cet espace</p>
            </button>
            <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-800">Abonnement</p>
              <p className="text-sm text-gray-400">Plan gratuit</p>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
