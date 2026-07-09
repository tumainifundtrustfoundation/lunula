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
  BookOpen
} from 'lucide-react';

import { UserProfile } from './types';
import { 
  auth, 
  fetchUserProfile, 
  ensureUserProfile, 
  signInWithGoogle, 
  logoutUser 
} from './firebase';

import Navbar from './components/Navbar';
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
import UploadView from './components/UploadView';
import ReaderView from './components/ReaderView';
import PremiumView from './components/PremiumView';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  // Routing State - defaults to 'portal' (the landing page)
  const [activeView, setActiveView] = useState<string>('portal');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login Modal State
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  
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
          'ajira', 'matangazo', 'upload', 'premium'
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
          subscription: 'free',
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
      setAuthError('Kuingia kwa Google kumeshindikana. Tafadhali jaribu tena.');
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
    <div id="lupanulla-app" className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-950 text-slate-800">
      
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
      />

      {/* Main Container Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Profile/Auth Synchronization Spinner */}
        {profileLoading && user && (
          <div className="flex items-center justify-center py-6 gap-2 text-cyan-600 animate-pulse">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-wider">Inasawazisha akaunti ya Lupanulla...</span>
          </div>
        )}

        {/* View Switcher Router Dispatcher */}
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

      </main>

      {/* Unified Platform Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-white">
              <img 
                src="/src/assets/images/lupanulla_logo_1783623714916.jpg" 
                alt="Lupanulla Elimu Hub Logo" 
                referrerPolicy="no-referrer"
                className="w-8 h-8 object-cover rounded-lg shadow-md"
              />
              <span className="font-display font-extrabold text-base tracking-wider uppercase">Lupanulla Elimu Hub</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs font-semibold">
              Notisi, mitihani, video, vitabu, miongozo ya walimu, na msaidizi mahiri wa akili ya bandia (Fisi Maji AI) - vyote kwa ajili ya mafanikio yako kitaaluma Tanzania.
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
            <span className="hover:underline cursor-pointer">Sera ya Faragha</span>
            <span className="hover:underline cursor-pointer">Vigezo na Masharti</span>
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
              <img 
                src="/src/assets/images/lupanulla_logo_1783623714916.jpg" 
                alt="Lupanulla Elimu Hub Logo" 
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-cover rounded-2xl mx-auto shadow-md border border-slate-100"
              />
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

    </div>
  );
}
