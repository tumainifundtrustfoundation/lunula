import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  BookOpen, 
  FileText, 
  Users, 
  User, 
  Award, 
  Sparkles, 
  Search, 
  ChevronRight, 
  Volume2, 
  Zap, 
  Star,
  Flame,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { fetchDocuments } from '../firebase';
import { DocumentMetadata } from '../types';

interface DashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function DashboardView({ onNavigate, userProfile }: DashboardViewProps) {
  const [streakCount, setStreakCount] = useState(5);
  const [resultsNumber, setResultsNumber] = useState('');
  const [checkingResults, setCheckingResults] = useState(false);
  const [resultsOutput, setResultsOutput] = useState<string | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentMetadata[]>([]);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'darasa' | 'mkoa'>('darasa');

  useEffect(() => {
    loadRecentDocs();
  }, []);

  const loadRecentDocs = async () => {
    try {
      const docs = await fetchDocuments({ status: 'approved' });
      setRecentDocs(docs.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResultsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultsNumber.trim()) return;
    setCheckingResults(true);
    setResultsOutput(null);
    setTimeout(() => {
      setCheckingResults(false);
      // Mock results checking for Lupanulla in Kiswahili
      const regex = /^[sS]\d{4}\/\d{4}$/;
      if (regex.test(resultsNumber)) {
        setResultsOutput(`Matokeo ya Namba ${resultsNumber} (CSEE 2025):
- CIVICS: B
- HISTORY: B
- GEOGRAPHY: C
- KISWAHILI: A
- ENGLISH: B
- PHYSICS: C
- CHEMISTRY: B
- BIOLOGY: B
- BASIC MATH: B
Wastani: Daraja la Kwanza (Division I - Point 15). Hongera sana!`);
      } else {
        setResultsOutput(`Namba ${resultsNumber} Haikutambuliwa au Matokeo hayajapakiwa bado. Hakikisha format ni sahihi (Mfano: S0101/0001/2025).`);
      }
    }, 1500);
  };

  const currentStreakAngle = (streakCount / 7) * 360;

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* ── Welcome Banner with Floating Ambient Particles ── */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Floating Stars Particle Effect Simulation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute w-2 h-2 bg-white rounded-full top-1/4 left-1/3 animate-ping"></div>
          <div className="absolute w-1 h-1 bg-white rounded-full top-3/4 left-1/4 animate-pulse"></div>
          <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full top-1/2 left-2/3 animate-pulse"></div>
          <div className="absolute w-2 h-2 bg-purple-400 rounded-full top-1/3 left-4/5 animate-ping"></div>
        </div>

        <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-400/30">
            <Sparkles size={12} className="text-amber-400" />
            Dashibodi ya Mwanafunzi
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight leading-tight">
            Habari gani, <span className="text-cyan-400">{userProfile?.name || 'Mwanafunzi'}</span>!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Leo ni siku nzuri ya kujiendeleza kimasomo. Una streak ya siku {streakCount} mfululizo &mdash; endelea hivi hivi kufikia malengo yako!
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <button 
              onClick={() => onNavigate('masomo')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-full transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
            >
              <Compass size={16} /> Vinjari Notisi
            </button>
            <button 
              onClick={() => onNavigate('fisimaji')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3 rounded-full transition-all border border-slate-700/60"
            >
              Uliza Fisi Maji AI
            </button>
          </div>
        </div>

        {/* Dynamic Circular Streak Widget */}
        <div className="relative z-10 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center w-56">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="48" 
                stroke="#06b6d4" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * (streakCount / 7))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <Flame size={32} className="text-amber-500 animate-pulse" />
              <span className="text-2xl font-extrabold font-display leading-none">{streakCount}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SIKU STREAK</span>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white">Siku ya {streakCount} ya Elimu</h4>
            <p className="text-[10px] text-slate-400 font-semibold">Soma mada 1 zaidi leo kudumisha streak yako!</p>
          </div>
        </div>
      </section>

      {/* ── Core Statistics Counters ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-xl flex items-center justify-center mb-3"><BookOpen size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">12</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Notisi Nilizosoma</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-3"><FileText size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">8</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Past Papers Zilizopakuliwa</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mb-3"><Trophy size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">2,450 XP</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Pointi za Masomo (XP)</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-3"><Award size={20} /></div>
          <span className="text-2xl font-display font-extrabold text-slate-900 block leading-none">#42</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Nafasi yangu Kitaifa</span>
        </div>
      </div>

      {/* ── Active Courses, Leaderboard, Kiswahili Fasihi and Results Checker ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Left Content Column: Active courses & Fasihi section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Study Progress */}
          <div className="space-y-4">
            <h2 className="font-display font-extrabold text-xl text-slate-900 uppercase">Mfululizo wa Masomo Yangu</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div onClick={() => onNavigate('masomo')} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full uppercase">PHYSICS</span>
                    <h3 className="font-bold text-slate-950 text-sm mt-1">Linear Motion</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Form IV</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Mada imekamilika kwa 60%</span>
                    <span>Sura 3/5</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>

              <div onClick={() => onNavigate('masomo')} className="p-5 bg-white border border-slate-200 rounded-2xl hover:border-cyan-400 hover:shadow-sm cursor-pointer transition-all space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">HISTORY</span>
                    <h3 className="font-bold text-slate-950 text-sm mt-1">Colonial Economy</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Form III</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Mada imekamilika kwa 35%</span>
                    <span>Sura 2/6</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kiswahili Fasihi Featured Highlight Section (Audio styled player widget) */}
          <section className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl border border-teal-100 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-600/10">
              <Volume2 size={32} className="animate-pulse" />
            </div>
            <div className="flex-grow space-y-2 text-center sm:text-left">
              <span className="bg-teal-200 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">KISWAHILI FASIHI AUDIO</span>
              <h3 className="font-display font-extrabold text-slate-950 text-lg leading-tight uppercase">Mstahiki Meya (Uchambuzi wa Kitabu)</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                Sikiliza uchambuzi mkuu wa wahusika, mandhari, fani na maudhui ya mchezo wa kuigiza wa &quot;Mstahiki Meya&quot; na Mwandishi Timothy Arege. Inasaidia sana kujibu maswali ya fasihi andishi NECTA.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-600/10 flex items-center gap-1.5">
                  <Volume2 size={14} /> Sikiliza Sauti (5:42)
                </button>
                <button onClick={() => onNavigate('masomo')} className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all border border-slate-200">
                  Soma Notisi za Kitabu
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar Column: Results checker, leaderboards */}
        <div className="space-y-8">
          
          {/* NECTA Results Checker Form */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Compass size={18} /></div>
              <h3 className="font-display font-bold text-slate-950 text-base uppercase">Necta Results Checker</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Kagua matokeo ya mitihani ya NECTA (FTNA, CSEE, ACSEE) haraka na kwa urahisi kwa kuandika namba yako ya mtihani ya shule.
            </p>
            
            <form onSubmit={handleResultsSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Andika Namba ya Mtihani</label>
                <input 
                  type="text" 
                  required
                  placeholder="Mfano: S0101/0001/2025" 
                  value={resultsNumber}
                  onChange={(e) => setResultsNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 uppercase"
                />
              </div>
              <button 
                type="submit" 
                disabled={checkingResults}
                className="w-full py-2.5 text-xs text-center font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/15 flex items-center justify-center gap-1.5"
              >
                {checkingResults ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Inatafuta...</span>
                  </>
                ) : (
                  <>
                    <Compass size={14} /> Kagua Matokeo yangu
                  </>
                )}
              </button>
            </form>

            {resultsOutput && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-xs font-mono whitespace-pre-wrap leading-relaxed animate-fade-in shadow-inner max-h-60 overflow-y-auto">
                {resultsOutput}
              </div>
            )}
          </div>

          {/* National Leaderboard Rankings podium */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-base uppercase flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                Mashindano ya Wiki
              </h3>
              {/* Small tab selector */}
              <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/50">
                <button 
                  onClick={() => setActiveLeaderboard('darasa')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${activeLeaderboard === 'darasa' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Darasa
                </button>
                <button 
                  onClick={() => setActiveLeaderboard('mkoa')}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all ${activeLeaderboard === 'mkoa' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  Mkoa
                </button>
              </div>
            </div>

            {/* Podium Rank representation */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-extrabold text-amber-500 text-sm">#1</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center font-bold text-xs">AM</div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Aneth Mwanga</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">Mwanza Sec &bull; 1,840 XP</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full">Kinara</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-extrabold text-slate-400 text-sm">#2</span>
                  <div className="w-8 h-8 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-400 flex items-center justify-center font-bold text-xs">JM</div>
                  <div>
                    <h4 className="font-bold text-xs text-white">John Mapunda</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">Feza Boys &bull; 1,620 XP</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-slate-400/10 text-slate-400 border border-slate-400/20 px-2 py-0.5 rounded-full">Mshindi</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-cyan-500/40 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-display font-extrabold text-amber-700 text-sm">#3</span>
                  <div className="w-8 h-8 rounded-full bg-amber-700/10 border border-amber-700/30 text-amber-700 flex items-center justify-center font-bold text-xs">SK</div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Salma Kiboko</h4>
                    <span className="text-[9px] text-slate-400 font-semibold">St. Marys &bull; 1,450 XP</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-amber-700/10 text-amber-700 border border-amber-700/20 px-2 py-0.5 rounded-full">Mshindi</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
