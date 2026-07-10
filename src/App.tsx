import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  X,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ShieldAlert,
  LogOut
} from 'lucide-react';

import { UserProfile, AppTheme } from './types';
import { 
  auth, 
  fetchUserProfile, 
  ensureUserProfile, 
  signInWithGoogle, 
  logoutUser,
  signInAsGuest 
} from './firebase';

import Navbar from './components/Navbar';
import Logo from './components/Logo';
import PortalView from './components/PortalView';
import DashboardView from './components/DashboardView';
import MasomoView from './components/MasomoView';
import MitihaniView from './components/MitihaniView';
import DukaView from './components/DukaView';
import FisiMajiView from './components/FisiMajiView';
import VideosView from './components/VideosView';
import CalculatorView from './components/CalculatorView';
import KamusiView from './components/KamusiView';
import MikoaView from './components/MikoaView';
import AjiraView from './components/AjiraView';
import MatangazoView from './components/MatangazoView';
import FeedbackModal from './components/FeedbackModal';
import WorkspaceView from './components/WorkspaceView';
import UploadView from './components/UploadView';
import ReaderView from './components/ReaderView';
import PremiumView from './components/PremiumView';

import ForumView from './components/ForumView';
import LiveClassesView from './components/LiveClassesView';
import CertificatesView from './components/CertificatesView';
import LeaderboardView from './components/LeaderboardView';
import AdminView from './components/AdminView';
import ResourcesView from './components/ResourcesView';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  const [theme, setTheme] = useState<AppTheme>((localStorage.getItem('lupanulla-theme') as AppTheme) || 'theme-tanzania-forest');
  const [language, setLanguage] = useState<'sw' | 'en'>((localStorage.getItem('lupanulla-lang') as 'sw' | 'en') || 'sw');

  // Synchronize language with localStorage
  useEffect(() => {
    localStorage.setItem('lupanulla-lang', language);
  }, [language]);

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Synchronize theme with localStorage and DOM body
  useEffect(() => {
    localStorage.setItem('lupanulla-theme', theme);
    const body = document.body;
    body.classList.remove('theme-tanzania-forest', 'theme-night-mode', 'theme-high-contrast');
    body.classList.add(theme);
  }, [theme]);

  // Routing State - defaults to 'portal' (the landing page)
  const [activeView, setActiveView] = useState<string>('portal');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login Modal State
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [activePolicyDoc, setActivePolicyDoc] = useState<'privacy' | 'terms' | null>(null);
  
  // Credentials
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Sync URL hash routing on load & navigation
  useEffect(() => {
    const handleHashRoute = () => {
      const hash = window.location.hash;
      if (!hash) {
        setActiveView('portal');
        setActiveDocumentId(null);
        return;
      }

      if (hash.startsWith('#reader')) {
        const params = new URLSearchParams(hash.replace('#reader?', ''));
        const docId = params.get('id');
        if (docId) {
          setActiveView('reader');
          setActiveDocumentId(docId);
        } else {
          setActiveView('portal');
        }
      } else {
        const cleanView = hash.replace('#', '');
        const validViews = [
          'portal', 'dashboard', 'masomo', 'mitihani', 'duka', 
          'fisimaji', 'videos', 'calculator', 'kamusi', 'mikoa', 
          'ajira', 'matangazo', 'upload', 'premium', 'workspace',
          'forum', 'live', 'certificates', 'leaderboard', 'resources'
        ];
        if (validViews.includes(cleanView)) {
          setActiveView(cleanView);
          setActiveDocumentId(null);
        } else {
          setActiveView('portal');
        }
      }
    };

    handleHashRoute();
    window.addEventListener('hashchange', handleHashRoute);
    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, []);

  // Sync state navigation back to hash
  const navigateTo = (view: string, documentId?: string) => {
    if (view === 'feedback') {
      setIsFeedbackOpen(true);
      return;
    }
    if (view === 'reader' && documentId) {
      window.location.hash = `#reader?id=${documentId}`;
    } else {
      window.location.hash = `#${view}`;
    }
  };

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await refreshProfile(currentUser.uid, currentUser.displayName || 'Mwanafunzi Lupanulla');
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async (uid: string, fallbackName?: string) => {
    setProfileLoading(true);
    try {
      let profile = await fetchUserProfile(uid);
      if (!profile && auth.currentUser) {
        profile = await ensureUserProfile(auth.currentUser, fallbackName || auth.currentUser.email?.split('@')[0] || 'User');
      }
      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      // Fallback to local profile based on auth state if Firestore is offline or fails
      if (auth.currentUser) {
        const fallbackProfile: UserProfile = {
          uid: uid,
          name: fallbackName || auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Mwanafunzi Lupanulla',
          email: auth.currentUser.email || '',
          role: 'student',
          subscription: 'premium',
          createdAt: Date.now()
        };
        setUserProfile(fallbackProfile);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      navigateTo('portal');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        await refreshProfile(result.user.uid, result.user.displayName || 'Mtumiaji wa Google');
        setShowSignInModal(false);
      }
    } catch (err: any) {
      console.error('Google authorization error:', err);
      setAuthError(err.message || 'Kuingia kwa Google kumeshindikana. Tafadhali jaribu tena.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const guestUser = await signInAsGuest();
      if (guestUser) {
        await refreshProfile(guestUser.uid, 'Mgeni Lupanulla');
        setShowSignInModal(false);
      }
    } catch (err: any) {
      console.error('Guest authorization error:', err);
      setAuthError('Kuingia kama mgeni kumeshindikana. Tafadhali jaribu kuingia na barua pepe au Google.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (authTab === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        await refreshProfile(userCredential.user.uid);
        setShowSignInModal(false);
      } else {
        if (!fullName.trim()) {
          setAuthError('Tafadhali jaza jina lako kamili kuanza.');
          setAuthLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, { displayName: fullName.trim() });
        await ensureUserProfile(userCredential.user, fullName.trim());
        await refreshProfile(userCredential.user.uid, fullName.trim());
        setShowSignInModal(false);
      }
      // Reset fields
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err: any) {
      console.error('Email Authentication Error:', err);
      let errorMsg = 'Mchakato wa uthibitishaji umeshindwa. Tafadhali thibitisha barua pepe na nenosiri.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Barua pepe hii inatumiwa tayari na mtumiaji mwingine.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Nenosiri linapaswa kuwa na angalau herufi 6 au namba.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'Barua pepe au nenosiri si sahihi.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Njia ya kuingia kwa Barua Pepe na Nenosiri haijawezeshwa bado kwenye Firebase Console. Tafadhali wasiliana na msimamizi kuiruhusu, au tumia kitufe cha "Endelea na Google" kuingia sasa.';
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div id="lupanulla-app" className={`min-h-screen flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-950 ${theme}`}>
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        user={user}
        userProfile={userProfile}
      />

      {/* Navigation Bar */}
      <Navbar 
        activeView={activeView} 
        onNavigate={navigateTo} 
        userProfile={userProfile}
        onSignInClick={() => {
          setAuthError(null);
          setShowSignInModal(true);
        }}
        onSignOut={handleSignOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onChangeTheme={setTheme}
        language={language}
        onChangeLanguage={setLanguage}
      />

      {/* Main Container Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Offline Notification Banner */}
        {isOffline && (
          <div className="mb-6 bg-amber-500/10 border-2 border-amber-500/20 text-amber-900 px-5 py-4 rounded-3xl flex items-start gap-3.5 shadow-sm animate-fade-in">
            <div className="bg-amber-500 text-slate-950 rounded-xl p-2 mt-0.5 flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 011.414-3.536m0 0L5.636 5.636m0 0L3 3m2.636 2.636a9 9 0 000 12.728m0 0l2.829-2.829" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-amber-950">
                {language === 'sw' ? 'Hali ya Nje ya Mtandao (Offline Mode)' : 'Offline Study Mode Active'}
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-900/85 font-semibold leading-relaxed">
                {language === 'sw' 
                  ? 'Uko nje ya mtandao au una mtandao dhaifu. Shukrani kwa mfumo wetu wa Service Worker, bado unaweza kusoma notisi zote, past papers za NECTA, na vyeti ambavyo uliwahi kuvifungua hapo awali.'
                  : 'You are currently offline or have a weak connection. Thanks to our Service Worker cache, you can still access all notes, NECTA papers, and certificates you have previously viewed.'}
              </p>
            </div>
          </div>
        )}

        {/* Profile/Auth Synchronization Spinner */}
        {profileLoading && user && (
          <div className="flex items-center justify-center py-6 gap-2 text-cyan-600 animate-pulse">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-wider">Inasawazisha akaunti ya Lupanulla...</span>
          </div>
        )}

        {/* View Switcher Router Dispatcher */}
        {userProfile?.isSuspended ? (
          <div className="bg-white border border-red-100 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-6 shadow-2xl mt-12 animate-fade-in text-slate-800">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-slate-900 uppercase">Akaunti Imesimamishwa</h2>
              <p className="text-xs text-red-600 font-extrabold uppercase tracking-wider">Account Suspended</p>
            </div>
            <div className="bg-red-50/50 rounded-2xl p-4.5 border border-red-100/50 text-left space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sababu ya Kusimamishwa:</p>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                "{userProfile.suspensionReason || 'Ukiukaji wa masharti ya matumizi ya mfumo.'}"
              </p>
              {userProfile.suspendedAt && (
                <p className="text-[10px] text-slate-400 font-medium">
                  Imesimamishwa mnamo: {new Date(userProfile.suspendedAt).toLocaleDateString('sw-TZ', { dateStyle: 'long' })}
                </p>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kama unahisi uamuzi huu si sahihi au unahitaji usaidizi wa kurejesha akaunti yako, tafadhali wasiliana na Lupanulla Foundation kupitia barua pepe rasmi au msimamizi mkuu wa mfumo.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Ondoka Kwenye Akaunti
            </button>
          </div>
        ) : (
          <>
            {activeView === 'portal' && (
              <PortalView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'dashboard' && (
              <DashboardView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'masomo' && (
              <MasomoView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'mitihani' && (
              <MitihaniView 
                onNavigate={navigateTo} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'duka' && (
              <DukaView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'fisimaji' && (
              <FisiMajiView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'videos' && (
              <VideosView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'calculator' && (
              <CalculatorView />
            )}

            {activeView === 'kamusi' && (
              <KamusiView />
            )}

            {activeView === 'mikoa' && (
              <MikoaView />
            )}

            {activeView === 'ajira' && (
              <AjiraView />
            )}

            {activeView === 'matangazo' && (
              <MatangazoView />
            )}

            {activeView === 'workspace' && (
              <WorkspaceView theme={theme} onChangeTheme={setTheme} />
            )}

            {activeView === 'upload' && (
              <UploadView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'reader' && activeDocumentId && (
              <ReaderView 
                documentId={activeDocumentId} 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'premium' && (
              <PremiumView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
                onProfileUpdate={() => refreshProfile(user?.uid || '')}
              />
            )}

            {activeView === 'resources' && (
              <ResourcesView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'forum' && (
              <ForumView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'live' && (
              <LiveClassesView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'certificates' && (
              <CertificatesView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'leaderboard' && (
              <LeaderboardView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'admin' && (
              <AdminView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}
          </>
        )}

      </main>

      {/* Unified Platform Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-white">
              <Logo size="sm" />
              <span className="font-display font-extrabold text-base tracking-wider uppercase">Lupanulla Elimu Hub</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs font-semibold">
              Notisi, mitihani, video, vitabu, miongozo ya walimu, na msaidizi mahiri wa akili ya bandia (Lupanulla AI) - vyote kwa ajili ya mafanikio yako kitaaluma Tanzania.
            </p>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-widest mb-4">Masomo &amp; Karatasi</h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><button onClick={() => navigateTo('masomo')} className="hover:text-cyan-400 transition-colors">Soma Notisi (Syllabus)</button></li>
              <li><button onClick={() => navigateTo('mitihani')} className="hover:text-cyan-400 transition-colors">Past Papers &amp; Exams</button></li>
              <li><button onClick={() => navigateTo('upload')} className="hover:text-cyan-400 transition-colors">Pakia Karatasi Mpya (Upload)</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-widest mb-4">Msaada &amp; Ziada</h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><button onClick={() => navigateTo('calculator')} className="hover:text-cyan-400 transition-colors">GPA Points Calculator</button></li>
              <li><button onClick={() => navigateTo('kamusi')} className="hover:text-cyan-400 transition-colors">Kamusi ya Elimu</button></li>
              <li><button onClick={() => navigateTo('mikoa')} className="hover:text-cyan-400 transition-colors">Viwango vya Shule Kitaifa</button></li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-widest mb-4">Mawasiliano yetu</h4>
            <p className="text-[11px] leading-relaxed font-semibold">
              Kama una maoni au unahitaji usaidizi wa haraka kujiunga na Premium, wasiliana nasi:
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-xl p-2.5 w-fit">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>Google Drive &amp; Firebase Secured</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px]">
          <p>© 2026 Lupanulla Foundation. Haki zote zimehifadhiwa.</p>
          <div className="flex gap-4">
            <span onClick={() => setActivePolicyDoc('privacy')} className="hover:underline cursor-pointer hover:text-cyan-400 transition-colors">Sera ya Faragha</span>
            <span onClick={() => setActivePolicyDoc('terms')} className="hover:underline cursor-pointer hover:text-cyan-400 transition-colors">Vigezo na Masharti</span>
          </div>
        </div>
      </footer>

      {/* SIGN IN MODAL */}
      {showSignInModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => {
              if (!authLoading) setShowSignInModal(false);
            }}
          ></div>
          
          <div className="relative bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-fade-in z-[160] text-slate-800">
            <button
              onClick={() => setShowSignInModal(false)}
              disabled={authLoading}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1.5">
              <Logo size="lg" className="mx-auto" />
              <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-none mt-2 uppercase">Lupanulla Hub</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kitovu cha Elimu ya Kidijitali Tanzania</p>
            </div>

            <div className="flex border-b border-slate-100 gap-1 pb-px">
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthTab('login');
                }}
                className={`flex-1 pb-2.5 text-xs font-extrabold uppercase border-b-2 text-center transition-all ${
                  authTab === 'login' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Ingia (Login)
              </button>
              <button
                onClick={() => {
                  setAuthError(null);
                  setAuthTab('signup');
                }}
                className={`flex-1 pb-2.5 text-xs font-extrabold uppercase border-b-2 text-center transition-all ${
                  authTab === 'signup' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Sajili (Sign Up)
              </button>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-[1.01]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.15-.31-.27-.64-.35-.97z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Endelea na Google</span>
              </button>

              <button
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:border-emerald-300 rounded-xl py-3 text-xs font-bold text-emerald-800 shadow-sm transition-all hover:scale-[1.01]"
              >
                <UserIcon size={16} className="text-emerald-600" />
                <span>Ingia Haraka kama Mgeni (Demo Login)</span>
              </button>

              <div className="flex items-center">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">au barua pepe</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>
            </div>

            <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
              {authTab === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <UserIcon size={12} className="text-slate-400" />
                    Jina Kamili
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" />
                  Barua pepe (Email)
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={12} className="text-slate-400" />
                  Nenosiri (Password)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full mt-4 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <LogIn size={14} />
                {authLoading ? 'Inaprosesi...' : authTab === 'login' ? 'Ingia Sasa' : 'Kamilisha Usajili'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── POLICY AND TERMS MODAL (Sera ya Faragha na Vigezo) ── */}
      {activePolicyDoc && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setActivePolicyDoc(null)}
          ></div>
          
          <div className="relative bg-white border border-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in z-[190] text-slate-800">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base uppercase text-slate-900 leading-none">
                    {activePolicyDoc === 'privacy' 
                      ? (language === 'sw' ? 'Sera ya Faragha' : 'Privacy Policy') 
                      : (language === 'sw' ? 'Vigezo na Masharti' : 'Terms & Conditions')
                    }
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    {language === 'sw' ? 'Marekebisho ya mwisho: Julai 2026' : 'Last updated: July 2026'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePolicyDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
              {activePolicyDoc === 'privacy' ? (
                // PRIVACY POLICY CONTENT
                language === 'sw' ? (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      Karibu kwenye Lupanulla Elimu Hub. Tunaheshimu sana faragha yako na tumejitolea kulinda taarifa zako binafsi unapotumia jukwaa letu. Sera hii ya faragha inaeleza jinsi tunavyokusanya, kutumia, na kulinda taarifa zako.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        1. Taarifa Tunazokusanya (Data Collection)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunapata taarifa binafsi kama barua pepe (email), jina kamili, na namba ya simu unapojisajili, unapotuma kazi, au unapojiunga na mpango vya Premium. Taarifa hizi huhifadhiwa kwa njia salama kwa kutumia mifumo iliyothibitishwa ya Google Firebase na Cloud Firestore.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        2. Matumizi ya Taarifa (How We Use It)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunatumia taarifa zako kukupa huduma stahiki, ikiwemo kukuruhusu kupakua nyaraka za mitaala, kuingiliana na msaidizi mahiri wa akili ya bandia (Lupanulla AI), kufuatilia maendeleo ya kimasomo kwenye "Leaderboard", na kukutumia ujumbe muhimu wa kiutendaji.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        3. Usalama wa Malipo na Miamala
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Malipo yote ya Premium na vitabu vya duka yanathibitishwa kupitia namba ya muamala (Transaction ID / Ref) pekee. Lupanulla Hub haihifadhi, haisomi, na haitakaa iitishe namba yako ya siri ya huduma za kifedha (M-Pesa, Tigo Pesa au Airtel Money). Malipo yanashughulikiwa salama kwa mawasiliano rasmi.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        4. Google AdSense na Washirika wa Matangazo
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunatumia matangazo ya Google AdSense na washirika wengine kuonyesha matangazo kwenye jukwaa ili kugharamia mitambo yetu (hosting servers) na kuendelea kutoa notisi bora bila malipo. Google inaweza kutumia kuki (cookies) kuonyesha matangazo yanayokidhi matakwa yako ya kivinjari.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        5. Mabadiliko ya Sera Hii
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunaweza kuboresha sera hii mara kwa mara ili kuendana na mabadiliko ya kisheria na teknolojia. Tutaweka tarehe ya maboresho juu ya ukurasa huu mara marekebisho yanapofanyika.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      Welcome to Lupanulla Elimu Hub. We highly respect your privacy and are committed to safeguarding your personal information. This privacy policy describes how we collect, use, and protect your data.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        1. Information We Collect
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        We collect personal information such as your email address, full name, and phone number when you sign up, upload content, or subscribe to our Premium packages. This data is securely stored using certified Google Firebase and Cloud Firestore infrastructure.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        2. How We Use Your Information
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Your information is used to provide you with school resources, allow unlimited downloads of academic notes and past papers, support interaction with our AI tutor (Lupanulla AI), track learning rewards on the Leaderboard, and communicate crucial account updates.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        3. Transaction and Mobile Money Security
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        All payments for premium materials are verified solely through the receipt of mobile money Transaction IDs. Lupanulla Hub never saves, intercepts, or asks for your mobile money secret PIN. All transactions are handled securely through trusted direct verification channels.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        4. Google AdSense and Third-Party Advertising
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        We display Google AdSense ads and work with external ad networks to monetize content. This revenue allows us to maintain cloud servers and keep core educational resources free. Google may use cookies to serve personalized ads based on your web activity.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                // TERMS AND CONDITIONS CONTENT
                language === 'sw' ? (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      Kwa kutumia jukwaa la Lupanulla Elimu Hub, unakubaliana na vigezo na masharti haya ya matumizi. Tafadhali soma kwa makini kabla ya kuendelea kutumia mifumo yetu.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        1. Matumizi ya Maudhui na Hakimiliki
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Nyaraka zote, mitihani, na notisi zinazopatikana kwenye jukwaa hili ni kwa ajili ya matumizi yako binafsi ya kimasomo tu. Ni marufuku kabisa kunakili, kuchapisha upya kibiashara, au kusambaza vitabu na notisi hizi kwenye mifumo mingine bila kupata kibali cha maandishi kutoka Lupanulla Foundation.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        2. Uanachama wa Premium na Malipo
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Unapojiunga na kifurushi cha Premium, utapata uwezo vya kudownload PDF bila kikomo na huduma ya msaidizi wa akili mnemba ya Lupanulla AI. Malipo yanayofanywa kwa ajili ya uanachama wa Premium au ununuzi vya vitabu ni ya mwisho na hayarudishwi (Non-refundable) pindi tu huduma inapowezeshwa kwenye akaunti yako.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        3. Sheria za Tabia na Michango (Forum Rules)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Watumiaji wanaweza kuchangia mijadala ya kimasomo au kupakia faili. Ni marufuku kupakia nyaraka zenye kashfa, lugha isiyo ya maadili, maudhui yasiyo ya kimasomo, au nyaraka zinazokiuka hakimiliki. Lupanulla Foundation ina haki ya kufuta maudhui hayo na kuzuia akaunti ya mtumiaji husika bila taarifa.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        4. Ukomo wa Dhima (Disclaimer)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Maudhui yote na notisi zimeandaliwa kwa uangalifu mkubwa na walimu wetu. Hata hivyo, mtaala unaweza kubadilika na msaidizi wetu wa Lupanulla AI anaweza kutoa majibu yenye hitilafu wakati mwingine. Mtumiaji anashauriwa kutumia maudhui haya sambamba na miongozo rasmi ya Wizara ya Elimu na Baraza la Mitihani la Tanzania (NECTA).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      By accessing and using Lupanulla Elimu Hub, you agree to comply with and be bound by the following terms and conditions of service. Please review them carefully.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        1. Use of Educational Resources and Copyrights
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        All examination materials, notes, booklets, and files provided on this hub are strictly for individual educational purposes. Commercial redistribution, unauthorized re-publishing, or mass sharing of these materials without written consent from Lupanulla Foundation is strictly prohibited.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        2. Premium Membership and Refund Policy
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Subscribing to a Premium package grants you unlimited downloads of PDFs and full interaction with our AI-powered tutor (Lupanulla AI). All payments made towards Premium plans or book orders are final and completely non-refundable once the service is activated.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        3. User Contributions & Upload Rules
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        When contributing to forums or uploading study papers, users are prohibited from uploading offensive content, non-educational files, or copyrighted material. We reserve the right to remove any inappropriate content and suspend accounts violating these terms.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        4. Disclaimer of Warranties & Liability
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        While our educators make every effort to keep materials accurate, curricula evolve and the Lupanulla AI assistant may occasionally output errors. Users are encouraged to utilize these tools in conjunction with official NECTA syllabus guidelines.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Footer buttons of Modal */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setActivePolicyDoc(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-tight transition-all cursor-pointer shadow-md"
              >
                {language === 'sw' ? 'Nimeelewa na Kukubali' : 'I Understand & Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
