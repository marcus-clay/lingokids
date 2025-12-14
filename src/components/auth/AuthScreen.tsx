import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Envelope, ShieldCheck, SpinnerGap, CheckCircle, ArrowLeft } from '@phosphor-icons/react';
import { useStore } from '../../store/useStore';
import { signInWithGoogle, signInWithMagicLink } from '../../services/authService';

type AuthMode = 'choice' | 'magic-link' | 'magic-link-sent';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('choice');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setUser, setFamily, setChildren } = useStore();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      // Important: Set family BEFORE user to ensure it's available in onboarding
      setFamily(result.family);
      setChildren(result.children);
      setUser(result.user);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError('Erreur de connexion avec Google. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await signInWithMagicLink(email);
      setMode('magic-link-sent');
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError('Erreur lors de l\'envoi du lien. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      {/* Logo & Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white font-bold text-4xl mb-4 mx-auto shadow-xl shadow-blue-500/30 transform rotate-3">
          L
        </div>
        <h1 className="text-4xl font-rounded font-bold text-gray-900 mb-2">
          LingoKids
        </h1>
        <p className="text-gray-500 text-lg">
          L'anglais devient un jeu d'enfant !
        </p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 w-full max-w-md border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {mode === 'choice' && (
            <motion.div
              key="choice"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
                Bienvenue !
              </h2>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <SpinnerGap className="w-5 h-5 animate-spin" weight="bold" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuer avec Google
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Magic Link Button */}
              <button
                onClick={() => setMode('magic-link')}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Envelope className="w-5 h-5" weight="fill" />
                Continuer avec Email
              </button>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm text-center mt-4"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}

          {mode === 'magic-link' && (
            <motion.div
              key="magic-link"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={() => setMode('choice')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Connexion par email
              </h2>
              <p className="text-gray-500 mb-6">
                Nous vous enverrons un lien magique pour vous connecter sans mot de passe.
              </p>

              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <SpinnerGap className="w-5 h-5 animate-spin" weight="bold" />
                  ) : (
                    'Envoyer le lien magique'
                  )}
                </button>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </form>
            </motion.div>
          )}

          {mode === 'magic-link-sent' && (
            <motion.div
              key="magic-link-sent"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-8 h-8 text-green-600" weight="fill" />
              </motion.div>

              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Email envoyé !
              </h2>
              <p className="text-gray-500 mb-6">
                Vérifiez votre boîte de réception pour{' '}
                <span className="font-medium text-gray-700">{email}</span>
              </p>
              <p className="text-sm text-gray-400">
                Cliquez sur le lien dans l'email pour vous connecter.
              </p>

              <button
                onClick={() => {
                  setMode('choice');
                  setEmail('');
                }}
                className="mt-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                Utiliser une autre méthode
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-2 text-sm text-gray-400"
      >
        <ShieldCheck className="w-4 h-4" weight="fill" />
        <span>Connexion sécurisée pour les parents</span>
      </motion.div>
    </div>
  );
};
