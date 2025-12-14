import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Gear, SignOut, Crown, Flame } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';
import { logout } from '../../services/authService';
import type { Child } from '../../types';

export const ProfileSelector: React.FC = () => {
  const { user, children, selectChild, setCurrentView } = useStore();
  const { logout: logoutStore } = useStore();

  const handleSelectChild = (child: Child) => {
    selectChild(child);
  };

  const handleAddChild = () => {
    setCurrentView('ONBOARDING');
  };

  const handleParentPortal = () => {
    setCurrentView('PARENT_PORTAL');
  };

  const handleLogout = async () => {
    await logout();
    logoutStore();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <span className="font-rounded font-bold text-gray-800">LingoKids</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleParentPortal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Espace parent"
          >
            <Gear className="w-5 h-5 text-gray-500" weight="fill" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Déconnexion"
          >
            <SignOut className="w-5 h-5 text-gray-500" weight="bold" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-rounded font-bold text-gray-900 mb-2">
            Qui apprend aujourd'hui ?
          </h1>
          <p className="text-gray-500">
            Bonjour {user?.displayName?.split(' ')[0]} ! Choisissez un profil.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl"
        >
          {/* Child Profiles */}
          {children.map((child, index) => (
            <motion.button
              key={child.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectChild(child)}
              className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col items-center gap-4 group"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full ${child.avatarColor} flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:ring-4 ring-blue-100 transition-all`}
                >
                  {child.name[0].toUpperCase()}
                </div>
                {/* Streak Badge */}
                {child.streak > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md"
                  >
                    <Flame className="w-3 h-3" weight="fill" />
                    {child.streak}
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {child.grade} • Niveau {child.level}
                </p>
              </div>

              {/* XP Progress */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{child.xp % 500} XP</span>
                  <span>500 XP</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(child.xp % 500) / 5}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            </motion.button>
          ))}

          {/* Add Child Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddChild}
            className="bg-white rounded-3xl p-6 border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[220px]"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Plus className="w-8 h-8 text-gray-400" weight="bold" />
            </div>
            <span className="font-medium text-gray-500">Ajouter un enfant</span>
          </motion.button>
        </motion.div>

        {/* Parent Quick Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <button
            onClick={handleParentPortal}
            className="flex items-center gap-3 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-400" weight="fill" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Espace Parent</p>
              <p className="text-xs text-gray-500">Suivez les progrès</p>
            </div>
          </button>
        </motion.div>
      </main>
    </div>
  );
};
