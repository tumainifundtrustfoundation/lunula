import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Crown, 
  User, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  Search, 
  Menu, 
  X,
  Sparkles,
  Bot,
  Play,
  Calculator,
  Compass,
  Briefcase,
  Megaphone,
  Book,
  Trophy,
  Store,
  LayoutDashboard,
  Bell,
  MessageSquare,
  Library,
  Palette,
  Video,
  Award,
  Globe
} from 'lucide-react';
import { UserProfile, AppNotification, AppTheme } from '../types';
import { subscribeNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../firebase';
import Logo from './Logo';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string, documentId?: string) => void;
  userProfile: UserProfile | null;
  onSignInClick: () => void;
  onSignOut: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  language: 'sw' | 'en';
  onChangeLanguage: (lang: 'sw' | 'en') => void;
}

export default function Navbar({
  activeView,
  onNavigate,
  userProfile,
  onSignInClick,
  onSignOut,
  searchQuery,
  onSearchChange,
  theme,
  onChangeTheme,
  language,
  onChangeLanguage
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [extraToolsOpen, setExtraToolsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    if (!userProfile?.uid) {
      setNotifications([]);
      return;
    }

    const unsubscribe = subscribeNotifications(userProfile.uid, (list) => {
      setNotifications(list);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userProfile?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Sasa hivi';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Dakika ${mins} zilizopita`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Saa ${hrs} zilizopita`;
    const days = Math.floor(hrs / 24);
    return `Siku ${days} zilizopita`;
  };

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setExtraToolsOpen(false);
    setNotifDropdownOpen(false);
  };

  const primaryMenuItems = [
    { id: 'portal', label: 'Nyumbani', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Maktaba Kuu', icon: Library },
    { id: 'masomo', label: 'Masomo', icon: Book },
    { id: 'mitihani', label: 'Mitihani (Past Papers)', icon: FileText },
    { id: 'duka', label: 'Duka (Books)', icon: Store },
    { id: 'fisimaji', label: 'Lupanulla AI', icon: Bot, highlight: true },
    { id: 'workspace', label: 'Maktaba ya Google', icon: Globe },
    { id: 'videos', label: 'Lupa+ Videos', icon: Play },
  ];

  const toolsMenuItems = [
    { id: 'combinations', label: 'Kombination 2025/2026', icon: Award },
    { id: 'resources', label: 'Hub ya Vyanzo vya Elimu', icon: Globe },
    { id: 'forum', label: 'Jukwaa la Jamii', icon: MessageSquare },
    { id: 'live', label: 'Kipindi cha Video', icon: Video },
    { id: 'certificates', label: 'Vyeti Vyangu', icon: Award },
    { id: 'leaderboard', label: 'Viwango vya Tuzo', icon: Trophy },
    { id: 'calculator', label: 'GPA Calculator', icon: Calculator },
    { id: 'kamusi', label: 'Kamusi', icon: BookOpen },
    { id: 'mikoa', label: 'Viwango vya NECTA', icon: Trophy },
    { id: 'ajira', label: 'Ajira za Walimu', icon: Briefcase },
    { id: 'matangazo', label: 'Habari & Kuhusu', icon: Megaphone },
    { id: 'feedback', label: 'Toa Maoni', icon: MessageSquare },
  ];

  const getThemeLabel = (themeId: AppTheme) => {
    switch (themeId) {
      case 'theme-tanzania-forest':
        return '🌲 Tanzania Forest';
      case 'theme-night-mode':
        return '🌙 Night Mode';
      case 'theme-high-contrast':
        return '👁️ High Contrast';
      default:
        return '🌲 Tanzania Forest';
    }
  };

  return (
    <nav id="app-navbar" className="bg-slate-950 text-white sticky top-0 z-50 shadow-md border-b border-cyan-500/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - Tanzanian Educational Pride */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('portal')}>
            <Logo size="md" />
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight block leading-none uppercase">
                Lupanulla
              </span>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mt-0.5">
                Elimu Hub 🇹🇿
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-3xl mx-6">
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 tracking-wide ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : item.highlight
                      ? 'text-purple-400 hover:text-purple-300 font-extrabold border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Extra tools dropdown */}
            <div className="relative">
              <button 
                onClick={() => setExtraToolsOpen(!extraToolsOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-150 tracking-wide text-slate-300 hover:bg-slate-900 hover:text-white`}
              >
                <Compass size={14} />
                <span>Ziada</span>
                <span className="text-[9px] text-cyan-400">▼</span>
              </button>

              {extraToolsOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  {toolsMenuItems.map(tool => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleNavClick(tool.id)}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                      >
                        <ToolIcon size={14} className="text-cyan-400" />
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User profile action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => onChangeLanguage('sw')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                  language === 'sw'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Soma kwa Kiswahili"
              >
                🇹🇿 SW
              </button>
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Read in English"
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold uppercase"
                title="Badili Mada (Themes)"
              >
                <Palette className="w-4 h-4 text-cyan-400" />
                <span className="hidden xl:inline">{getThemeLabel(theme)}</span>
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-fade-in text-white">
                  <div className="px-3 py-1 border-b border-slate-800 mb-1 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Badili Mada / Theme
                  </div>
                  {[
                    { id: 'theme-tanzania-forest', label: 'Tanzania Forest 🌲', desc: 'Teal/Green asili' },
                    { id: 'theme-night-mode', label: 'Night Mode 🌙', desc: 'Mwangaza hafifu' },
                    { id: 'theme-high-contrast', label: 'High Contrast 👁️', desc: 'Uso safi kwa uoni' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onChangeTheme(t.id as any);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-slate-800 flex flex-col ${
                        theme === t.id ? 'text-cyan-400' : 'text-slate-300'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[9px] text-slate-500 font-normal">{t.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {userProfile && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl relative transition-all"
                  title="Taarifa"
                >
                  {unreadCount > 0 ? (
                    <>
                      <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[8px] font-extrabold text-white rounded-full flex items-center justify-center border border-slate-950">
                        {unreadCount}
                      </span>
                    </>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-3 z-50 text-white max-h-[480px] flex flex-col"
                    >
                      <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Arifa za Lupanulla</h3>
                          {unreadCount > 0 && <p className="text-[10px] text-slate-400">{unreadCount} mpya hazijasomwa</p>}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead(userProfile.uid, notifications)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-extrabold uppercase border border-cyan-500/20 px-2 py-1 rounded-lg bg-cyan-500/5 transition-all"
                          >
                            Soma Zote
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1 divide-y divide-slate-850 max-h-[350px]">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                            <Bell className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                            <p className="text-xs font-semibold">Hakuna taarifa mpya kwa sasa</p>
                          </div>
                        ) : (
                          notifications.map((notif, index) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              key={notif.id}
                              onClick={async () => {
                                await markNotificationAsRead(notif.id);
                                if (notif.link) {
                                  handleNavClick(notif.link);
                                }
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-3.5 hover:bg-slate-850 cursor-pointer transition-all flex gap-3 relative ${
                                !notif.read ? 'bg-cyan-950/10 hover:bg-cyan-950/20' : ''
                              }`}
                            >
                              {!notif.read && (
                                <span className="absolute top-4 right-4 w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                              )}
                              
                              <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-slate-850 border border-slate-800 text-sm">
                                {notif.type === 'approval' ? '🎉' : notif.type === 'ai_response' ? '🤖' : '📢'}
                              </div>
                              
                              <div className="flex-1 space-y-0.5 pr-2">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-xs font-bold leading-tight ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                                    {notif.title}
                                  </h4>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider pt-0.5">
                                  {getRelativeTime(notif.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 rounded-xl p-1.5 border border-slate-800 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-extrabold text-sm uppercase">
                    {userProfile.name.charAt(0)}
                  </div>
                  <div className="pr-2 hidden sm:block">
                    <p className="text-xs font-bold text-white line-clamp-1 max-w-[120px]">{userProfile.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        (userProfile.subscription === 'premium' || userProfile.role === 'admin' || userProfile.role === 'super_admin')
                          ? 'bg-amber-400 text-amber-950' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {(userProfile.subscription === 'premium' || userProfile.role === 'admin' || userProfile.role === 'super_admin') ? '★ Premium' : 'Bure'}
                      </span>
                    </div>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50 text-white">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400 font-semibold">Umeingia kama</p>
                      <p className="text-sm font-bold text-white truncate">{userProfile.email}</p>
                    </div>
                    
                    <button
                      onClick={() => handleNavClick('upload')}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                    >
                      <Upload size={14} className="text-cyan-400" />
                      <span>Pakia faili (Upload)</span>
                    </button>

                    <button
                      onClick={() => handleNavClick('premium')}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2"
                    >
                      <Crown size={14} className="text-amber-400 animate-pulse" />
                      <span>Jiunge na Premium</span>
                    </button>

                    {(userProfile.role === 'admin' || userProfile.role === 'super_admin') && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-slate-800 text-rose-400 hover:text-rose-300 flex items-center gap-2"
                      >
                        <ShieldAlert size={14} />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <hr className="my-1 border-slate-800" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide hover:bg-red-950/20 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>Ondoka (Sign Out)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onSignInClick}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wide shadow-md hover:scale-[1.01] transition-all"
              >
                <LogIn size={14} />
                Ingia (Sign In)
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-2 lg:hidden">
            {userProfile && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl relative transition-all"
                  title="Taarifa"
                >
                  {unreadCount > 0 ? (
                    <>
                      <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[8px] font-extrabold text-white rounded-full flex items-center justify-center border border-slate-950">
                        {unreadCount}
                      </span>
                    </>
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </button>

                <AnimatePresence>
                  {notifDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-3 z-50 text-white max-h-[400px] flex flex-col"
                    >
                      <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Arifa</h3>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead(userProfile.uid, notifications)}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 font-extrabold uppercase border border-cyan-500/20 px-2 py-0.5 rounded-md bg-cyan-500/5"
                          >
                            Soma Zote
                          </button>
                        )}
                      </div>

                      <div className="overflow-y-auto flex-1 divide-y divide-slate-850 max-h-[300px]">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-slate-500 flex flex-col items-center justify-center gap-1">
                            <Bell className="w-6 h-6 text-slate-600 animate-pulse" />
                            <p className="text-[11px] font-semibold">Hakuna taarifa mpya</p>
                          </div>
                        ) : (
                          notifications.map((notif, index) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                              key={notif.id}
                              onClick={async () => {
                                await markNotificationAsRead(notif.id);
                                if (notif.link) {
                                  handleNavClick(notif.link);
                                }
                                setNotifDropdownOpen(false);
                              }}
                              className={`p-2.5 hover:bg-slate-850 cursor-pointer transition-all flex gap-2 relative ${
                                !notif.read ? 'bg-cyan-950/10' : ''
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-850 border border-slate-800 text-xs">
                                {notif.type === 'approval' ? '🎉' : notif.type === 'ai_response' ? '🤖' : '📢'}
                              </div>
                              
                              <div className="flex-1 space-y-0.5 min-w-0">
                                <h4 className="text-[11px] font-bold truncate">
                                  {notif.title}
                                </h4>
                                <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-[8px] text-slate-500">
                                  {getRelativeTime(notif.createdAt)}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {!userProfile && (
              <button
                onClick={onSignInClick}
                className="px-3 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-extrabold uppercase"
              >
                Ingia
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 hover:bg-slate-900 rounded-xl"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 py-3 px-4 space-y-1">
          {primaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="border-t border-slate-800 pt-2 my-2">
            <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-1">Vifaa vya ziada</p>
            {toolsMenuItems.map((tool) => {
              const ToolIcon = tool.icon;
              const isActive = activeView === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleNavClick(tool.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ToolIcon size={16} className="text-cyan-400" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-3 my-2">
            <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-2">Lugha / Language</p>
            <div className="px-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeLanguage('sw')}
                className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-xl border text-center transition-all ${
                  language === 'sw'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                🇹🇿 Kiswahili
              </button>
              <button
                onClick={() => onChangeLanguage('en')}
                className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-xl border text-center transition-all ${
                  language === 'en'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 my-2">
            <p className="px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest pb-2">Mada / Theme</p>
            <div className="px-4 grid grid-cols-3 gap-2">
              {[
                { id: 'theme-tanzania-forest', label: 'Forest 🌲' },
                { id: 'theme-night-mode', label: 'Night 🌙' },
                { id: 'theme-high-contrast', label: 'Contrast 👁️' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeTheme(t.id as any)}
                  className={`py-2 px-1 text-[10px] font-extrabold uppercase rounded-xl border text-center transition-all ${
                    theme === t.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {userProfile && (
            <div className="pt-3 mt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 px-4 py-1.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                  {userProfile.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{userProfile.name}</p>
                  <p className="text-[10px] text-slate-400">{userProfile.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleNavClick('upload')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase hover:bg-slate-800 text-slate-300 rounded-lg"
              >
                <Upload size={16} /> Pakia karatasi mpya
              </button>

              {(userProfile.role === 'admin' || userProfile.role === 'super_admin') && (
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase hover:bg-slate-800 text-rose-400 rounded-lg"
                >
                  <ShieldAlert size={16} /> Admin Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase text-red-400 hover:bg-red-950/20 rounded-lg"
              >
                <LogOut size={16} /> Ondoka (Sign Out)
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
