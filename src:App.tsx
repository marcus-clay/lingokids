import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LessonView } from './components/LessonView';
import { ParentPortal } from './components/ParentPortal';
import { GeminiTutor } from './components/GeminiTutor';
import { LoginView } from './components/LoginView';
import { ViewState, Lesson, UserProfile, UserProgress } from './types';
import { storageService } from './services/storageService';
import { INITIAL_USER_PROGRESS, INITIAL_LESSONS } from './constants';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [progress, setProgress] = useState<UserProgress>(INITIAL_USER_PROGRESS);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Load user data when a profile is selected
  useEffect(() => {
    if (currentUser) {
        const loadUserData = async () => {
            const loadedProgress = await storageService.getUserProgress(currentUser.id);
            const loadedLessons = await storageService.getLessons(currentUser.id);
            setProgress(loadedProgress);
            setLessons(loadedLessons);
        };
        loadUserData();
    }
  }, [currentUser]);

  const handleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    storageService.setCurrentProfile(profile.id);
    if (profile.role === 'PARENT') {
        setCurrentView(ViewState.PARENT_PORTAL);
    } else {
        setCurrentView(ViewState.DASHBOARD);
    }
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentView(ViewState.LESSON);
  };

  const handleCompleteLesson = (stars: number) => {
    if (!activeLessonId || !currentUser) return;

    // 1. Calculate new state
    const updatedLessons = lessons.map(l => {
        if (l.id === activeLessonId) {
            return { ...l, completed: true, stars: Math.max(l.stars, stars) };
        }
        // Unlock next lesson roughly
        const currentNum = parseInt(activeLessonId.split('l')[1]);
        if (l.id === `u1-l${currentNum + 1}`) {
             return { ...l, locked: false };
        }
        return l;
    });

    const updatedProgress = {
        ...progress,
        xp: progress.xp + 50 + (stars * 10),
        lessonsCompleted: progress.lessonsCompleted + 1,
        gems: progress.gems + 10,
        level: Math.floor((progress.xp + 50) / 500) + 1
    };

    // 2. Update React State
    setLessons(updatedLessons);
    setProgress(updatedProgress);

    // 3. Persist to "DB"
    storageService.saveLessons(currentUser.id, updatedLessons);
    storageService.saveUserProgress(currentUser.id, updatedProgress);

    setCurrentView(ViewState.DASHBOARD);
    setActiveLessonId(null);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.LESSON:
        const lesson = lessons.find(l => l.id === activeLessonId);
        if (!lesson) return <div>Lesson not found</div>;
        return (
            <LessonView 
                lesson={lesson} 
                user={currentUser}
                onComplete={handleCompleteLesson} 
                onExit={() => setCurrentView(ViewState.DASHBOARD)} 
            />
        );
      case ViewState.AI_TUTOR:
        return <GeminiTutor user={currentUser} />;
      case ViewState.PARENT_PORTAL:
        return <ParentPortal />;
      case ViewState.DASHBOARD:
      default:
        return (
          <Dashboard 
            progress={progress} 
            lessons={lessons} 
            onStartLesson={handleStartLesson} 
          />
        );
    }
  };

  return (
    <Layout 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        currentUser={currentUser}
        onLogout={handleLogout}
    >
        {renderContent()}
    </Layout>
  );
}