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
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
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
                <p className="text-xs text-gray-500 truncate">{currentUser.role === 'PARENT' ? 'Administrator' : `${currentUser.grade} Student`}</p>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Adventure Map" 
            active={currentView === ViewState.DASHBOARD}
            onClick={() => onNavigate(ViewState.DASHBOARD)}
          />
          <NavItem 
            icon={<GraduationCap size={20} />} 
            label="AI Tutor" 
            active={currentView === ViewState.AI_TUTOR}
            onClick={() => onNavigate(ViewState.AI_TUTOR)}
          />
          {currentUser.role === 'PARENT' && (
             <NavItem 
                icon={<UserCircle size={20} />} 
                label="Parent Portal" 
                active={currentView === ViewState.PARENT_PORTAL}
                onClick={() => onNavigate(ViewState.PARENT_PORTAL)}
            />
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <NavItem icon={<Settings size={20} />} label="Settings" />
           <NavItem icon={<LogOut size={20} />} label="Sign Out" variant="danger" onClick={onLogout} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shrink-0">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                <span className="font-rounded font-bold text-lg">LingoKids</span>
            </div>
            <div className={`w-8 h-8 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white text-sm font-bold`}>
                {currentUser.name[0]}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 no-scrollbar relative">
          <div className="max-w-5xl mx-auto h-full flex flex-col">
            {children}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden bg-white border-t border-gray-200 flex justify-around p-3 shrink-0">
            <MobileNavItem 
                icon={<LayoutDashboard size={24} />} 
                label="Map" 
                active={currentView === ViewState.DASHBOARD || currentView === ViewState.LESSON} 
                onClick={() => onNavigate(ViewState.DASHBOARD)}
            />
             <MobileNavItem 
                icon={<GraduationCap size={24} />} 
                label="Tutor" 
                active={currentView === ViewState.AI_TUTOR} 
                onClick={() => onNavigate(ViewState.AI_TUTOR)}
            />
            <MobileNavItem 
                icon={<Settings size={24} />} 
                label="Settings" 
                active={false} 
                onClick={onLogout} // Quick logout for demo
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
            className={`flex flex-col items-center gap-1 ${active ? 'text-primary-600' : 'text-gray-400'}`}
        >
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}