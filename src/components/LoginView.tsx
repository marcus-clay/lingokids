import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, Plus } from 'lucide-react';
import { storageService } from '../services/storageService';
import { AddChildProfile } from './AddChildProfile';

interface LoginViewProps {
  onLogin: (profile: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'LOGIN' | 'PROFILE' | 'ADD_CHILD'>('LOGIN');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Load profiles from storage
    const loadedProfiles = storageService.getProfiles();
    setProfiles(loadedProfiles);
  }, []);

  const handleGoogleLogin = () => {
    // Simulate auth delay
    setTimeout(() => {
        setStep('PROFILE');
    }, 800);
  };

  const handleCreateProfile = (profileData: Omit<UserProfile, 'id'>) => {
    storageService.createProfile(profileData);
    setProfiles(storageService.getProfiles());
    setStep('PROFILE');
  };

  if (step === 'LOGIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-12 w-full max-w-md text-center border border-gray-100">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-6 mx-auto shadow-lg shadow-primary-500/30">
                L
            </div>
            <h1 className="text-3xl font-rounded font-bold text-gray-900 mb-2">Welcome to LingoKids</h1>
            <p className="text-gray-500 mb-8 text-lg">The fun way for children to master English.</p>

            <button 
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800 font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
                <div className="w-6 h-6">
                    <svg viewBox="0 0 24 24">
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
                </div>
                Continue with Google
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
                <ShieldCheck size={16} />
                <span>Secure Parent Authentication</span>
            </div>
        </div>
      </div>
    );
  }

  // Add Child Profile View
  if (step === 'ADD_CHILD') {
    return (
      <AddChildProfile
        onCreateProfile={handleCreateProfile}
        onCancel={() => setStep('PROFILE')}
      />
    );
  }

  // Profile Selection View
  const childProfiles = profiles.filter(p => p.role === 'CHILD');
  const parentProfile = profiles.find(p => p.role === 'PARENT');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl text-center">
            <h2 className="text-3xl font-rounded font-bold text-gray-900 mb-8 animate-in fade-in slide-in-from-bottom-4">
              Qui apprend aujourd'hui ?
            </h2>

            {/* Child Profiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {childProfiles.map((profile, idx) => (
                    <button
                        key={profile.id}
                        onClick={() => onLogin(profile)}
                        className={`
                            bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 group
                            flex flex-col items-center justify-center gap-4 animate-in zoom-in-50 fill-mode-both
                        `}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className={`w-24 h-24 rounded-full ${profile.avatarColor} flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-lg group-hover:ring-4 ring-primary-100 transition-all`}>
                            {profile.name[0]}
                        </div>
                        <div>
                            <div className="font-bold text-xl text-gray-900">{profile.name}</div>
                            <div className="text-sm font-medium text-gray-400 mt-1">{profile.grade} • {profile.age} ans</div>
                        </div>
                    </button>
                ))}

                {/* Add Child Button */}
                <button
                    onClick={() => setStep('ADD_CHILD')}
                    className={`
                        bg-white rounded-3xl p-6 border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-300 group
                        flex flex-col items-center justify-center gap-4 animate-in zoom-in-50 fill-mode-both
                    `}
                    style={{ animationDelay: `${childProfiles.length * 100}ms` }}
                >
                    <div className="w-24 h-24 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center text-gray-400 group-hover:text-primary-500 transition-all">
                        <Plus size={40} />
                    </div>
                    <div>
                        <div className="font-bold text-xl text-gray-500 group-hover:text-primary-600">Ajouter un enfant</div>
                    </div>
                </button>
            </div>

            {/* Parent Profile */}
            {parentProfile && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => onLogin(parentProfile)}
                        className="inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-all duration-200"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
                            {parentProfile.name[0]}
                        </div>
                        <span className="font-medium">Espace Parent</span>
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};