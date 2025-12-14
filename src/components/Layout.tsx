import React from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, Settings, LogOut, UserCircle } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate, currentUser, onLogout }) => {
  return (
    <div className="flex h-[100dvh] bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold font-rounded text-xl">
            L
          </div>
          <span className="font-rounded font-bold text-lg tracking-tight text-gray-900">LingoKids</span>
        </div>

        {/* User Profile Mini Card */}
        <div className="mx-4 mt-6 p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
          <div className={`w-10 h-10 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-bold`}>
            {currentUser.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser.role === 'PARENT' ? 'Administrateur' : `Élève ${currentUser.grade}`}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Carte aventure"
            active={currentView === ViewState.DASHBOARD}
            onClick={() => onNavigate(ViewState.DASHBOARD)}
          />
          <NavItem
            icon={<GraduationCap size={20} />}
            label="Tuteur IA"
            active={currentView === ViewState.AI_TUTOR}
            onClick={() => onNavigate(ViewState.AI_TUTOR)}
          />
          {currentUser.role === 'PARENT' && (
            <NavItem
              icon={<UserCircle size={20} />}
              label="Espace parent"
              active={currentView === ViewState.PARENT_PORTAL}
              onClick={() => onNavigate(ViewState.PARENT_PORTAL)}
            />
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <NavItem icon={<Settings size={20} />} label="Paramètres" />
          <NavItem icon={<LogOut size={20} />} label="Déconnexion" variant="danger" onClick={onLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header - iOS style */}
        <div className="md:hidden bg-white/80 backdrop-blur-lg border-b border-gray-200/50 flex items-center justify-between px-4 z-20 shrink-0 safe-area-top">
          <div className="flex items-center gap-2 py-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
            <span className="font-rounded font-bold text-base">LingoKids</span>
          </div>
          <button
            onClick={onLogout}
            className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white text-sm font-bold active:scale-95 transition-transform`}
          >
            {currentUser.name[0]}
          </button>
        </div>

        {/* Content Area - Full height with safe areas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar relative">
          <div className="px-4 py-4 sm:px-6 md:px-8 md:py-6">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - iOS Tab Bar style */}
        <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200/50 flex justify-around shrink-0 safe-area-bottom z-20">
          <MobileNavItem
            icon={<LayoutDashboard size={22} />}
            label="Carte"
            active={currentView === ViewState.DASHBOARD || currentView === ViewState.LESSON}
            onClick={() => onNavigate(ViewState.DASHBOARD)}
          />
          <MobileNavItem
            icon={<GraduationCap size={22} />}
            label="Tuteur"
            active={currentView === ViewState.AI_TUTOR}
            onClick={() => onNavigate(ViewState.AI_TUTOR)}
          />
          {currentUser.role === 'PARENT' && (
            <MobileNavItem
              icon={<UserCircle size={22} />}
              label="Parent"
              active={currentView === ViewState.PARENT_PORTAL}
              onClick={() => onNavigate(ViewState.PARENT_PORTAL)}
            />
          )}
          <MobileNavItem
            icon={<Settings size={22} />}
            label="Plus"
            active={false}
            onClick={onLogout}
          />
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, variant = 'default', onClick }) => {
  const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer";
  const activeClasses = "bg-primary-50 text-primary-600 shadow-sm ring-1 ring-primary-100";
  const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  const dangerClasses = "text-red-500 hover:bg-red-50";

  let className = baseClasses;
  if (variant === 'danger') {
    className += ` ${dangerClasses}`;
  } else if (active) {
    className += ` ${activeClasses}`;
  } else {
    className += ` ${inactiveClasses}`;
  }

  return (
    <div onClick={onClick} className={className}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

const MobileNavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 py-2 px-4 min-w-[64px] transition-colors ${active ? 'text-primary-600' : 'text-gray-400'}`}
    >
      <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};
