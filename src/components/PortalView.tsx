import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Calendar, 
  TrendingUp, 
  Plus, 
  ArrowUp,
  Award,
  ChevronDown,
  ChevronUp,
  Mail,
  HelpCircle,
  Play,
  Heart,
  TrendingDown,
  Minus,
  CheckCircle,
  Cpu,
  BookOpen,
  FileText,
  User,
  Activity,
  Bot,
  MessageCircle,
  Phone
} from 'lucide-react';
import { fetchAnnouncements, fetchVideos } from '../firebase';
import { Announcement, Video } from '../types';
import QuoteWidget from './QuoteWidget';
import AdSenseWidget from './AdSenseWidget';

interface PortalViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function PortalView({ onNavigate, userProfile }: PortalViewProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [activeRankTab, setActiveRankTab] = useState<'shule' | 'mikoa' | 'acsee'>('shule');
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({ 0: true });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const anns = await fetchAnnouncements();
      setAnnouncements(anns.slice(0, 3));
      const vids = await fetchVideos();
      setVideos(vids.slice(0, 4));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterStatus('Umesajiliwa kikamilifu! Asante kwa kujiunga.');
      setNewsletterEmail('');
    }
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div id="portal-view" className="space-y-12 animate-fade-in font-sans text-slate-900 bg-slate-50">
      
      {/* ── Matukio Ticker (Continuous Horizontal Marquee) ── */}
      <div className="bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-purple-500/10 border border-slate-200/60 rounded-2xl p-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center overflow-hidden">
          <div className="flex-shrink-0 mr-4 pr-4 border-r border-slate-300 font-display font-extrabold text-red-600 flex items-center gap-2 whitespace-nowrap text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            MATUKIO MUHIMU
          </div>
          <div 
            className="flex-grow overflow-hidden relative"
            onMouseEnter={() => setTickerPaused(true)}
            onMouseLeave={() => setTickerPaused(false)}
          >
            <div className={`flex gap-8 whitespace-nowrap text-xs font-semibold text-slate-800 ${tickerPaused ? '' : 'animate-marquee'}`} style={{ animation: tickerPaused ? 'none' : 'marquee 25s linear infinite' }}>
              <span className="flex items-center gap-2"><Megaphone size={14} className="text-amber-500" /> Matokeo ya NECTA Kidato cha Nne 2025 yametoka &mdash; Angalia sasa!</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-cyan-500" /> Mtihani wa CSEE (Kidato cha Nne) utaanza Novemba 4 - 22, 2026</span>
              <span className="flex items-center gap-2"><Award size={14} className="text-amber-500" /> Lupa+ Video mpya zimeongezwa &mdash; anza kujifunza kwa vitendo</span>
              <span className="flex items-center gap-2"><Activity size={14} className="text-purple-500" /> Mashindano ya Kiongozi wa Wiki yanaendelea &mdash; fungua Dashibodi kuona rank</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Motivational Quote of the Day ── */}
      <QuoteWidget />

      {/* ── Google AdSense Responsive Ad Unit (Hero-top) ── */}
      <AdSenseWidget slotId="1000100101" className="my-4" />

      {/* ── Main Hero Section + Rankings Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Hero Story Banner */}
        <div 
          onClick={() => onNavigate('masomo')}
          className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 group cursor-pointer flex flex-col justify-end min-h-[480px] p-6 sm:p-10"
        >
          <img 
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop" 
            alt="Students Studying" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">Mtanange wa NECTA</span>
              <span className="text-slate-300 text-xs font-medium"><Calendar size={12} className="inline mr-1" /> Leo hii</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white leading-tight">
              Maandalizi ya Mitihani ya Taifa: Mbinu 5 za Kufaulu kwa Alama za Juu (A)
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl line-clamp-3">
              Wataalamu wa elimu na walimu wazoefu Tanzania wanashiriki siri za jinsi ya kupangilia muda wako, kutengeneza ratiba za wiki 6 kabla ya mtihani, na kujibu maswali ya mitihani ya NECTA kwa ufasaha mkubwa ili kuondokana na hofu ya kufeli.
            </p>
            <div className="pt-2">
              <button className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-full transition-all group shadow-lg shadow-cyan-500/20">
                Soma Miongozo <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* NECTA Rankings Standings Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-slate-900 uppercase">Viwango vya NECTA</h2>
              <button onClick={() => onNavigate('mikoa')} className="text-cyan-600 text-xs font-bold hover:underline">Ona Zote</button>
            </div>

            {/* Sub-tabs */}
            <div className="flex space-x-1 border-b border-slate-100 mb-5 pb-1">
              <button 
                onClick={() => setActiveRankTab('shule')}
                className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 ${activeRankTab === 'shule' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Shule (CSEE)
              </button>
              <button 
                onClick={() => setActiveRankTab('mikoa')}
                className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 ${activeRankTab === 'mikoa' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Mikoa (Avg)
              </button>
              <button 
                onClick={() => setActiveRankTab('acsee')}
                className={`flex-1 text-center pb-2 text-xs font-bold transition-all border-b-2 ${activeRankTab === 'acsee' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                ACSEE (Form VI)
              </button>
            </div>

            {/* Standings list */}
            <div className="space-y-3">
              {activeRankTab === 'shule' && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">1</span>
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">KM</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Kemebos Sec</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Kagera &bull; Gpa: 1.02</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp size={10} /> DIV I</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">2</span>
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">SF</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">St. Francis Girls</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Mbeya &bull; Gpa: 1.10</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp size={10} /> DIV I</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">3</span>
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">WS</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Waja Springs</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Geita &bull; Gpa: 1.25</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><TrendingUp size={10} /> DIV I</span>
                  </div>
                </>
              )}

              {activeRankTab === 'mikoa' && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">1</span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">DS</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Dar es Salaam</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Wastani: 84.5%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><TrendingUp size={10} /> Juu</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">2</span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">KL</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Kilimanjaro</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Wastani: 82.1%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><TrendingUp size={10} /> Juu</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">3</span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">MW</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Mwanza</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Wastani: 79.4%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><TrendingUp size={10} /> Juu</span>
                  </div>
                </>
              )}

              {activeRankTab === 'acsee' && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">1</span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">MZ</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Mzumbe Sec</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Morogoro &bull; PCM/PCB</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">DIV I</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">2</span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">IL</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Ilboru Sec</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Arusha &bull; PCM/PGM</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">DIV I</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-slate-500 w-5">3</span>
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">KK</div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 leading-none">Kilakala Girls</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Morogoro &bull; HGL/HGK</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">DIV I</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('mikoa')} 
            className="w-full mt-6 py-2.5 text-xs text-center font-extrabold bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-950/15"
          >
            ANGALIA VIWANGO VYOTE
          </button>
        </div>

      </div>

      {/* ── Highlighted Features Grid (Sports style cards) ── */}
      <div className="space-y-6">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 uppercase border-b-4 border-cyan-600 inline-block pb-1">
          Habari &amp; Rasilimali Mpya
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Study Notes Card */}
          <div 
            onClick={() => onNavigate('masomo')}
            className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-cyan-300 transition-all flex flex-col h-full"
          >
            <div className="h-44 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" alt="Books" />
              <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">NOTES</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider block mb-1">Mtaala Mpya &bull; O-Level</span>
                <h3 className="font-bold text-slate-950 text-base leading-snug group-hover:text-cyan-600 transition-colors">Notisi Zote za Physics Kidato cha 3 Zimepakiwa</h3>
                <p className="text-slate-500 text-xs mt-2 line-clamp-3">Notisi zilizochambuliwa kwa lugha rahisi sambamba na maswali na majibu kusaidia kufanya marudio rahisi.</p>
              </div>
              <span className="text-cyan-600 font-bold text-xs inline-flex items-center gap-1 pt-4">Soma Bure &rarr;</span>
            </div>
          </div>

          {/* Past Papers Card */}
          <div 
            onClick={() => onNavigate('mitihani')}
            className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-cyan-300 transition-all flex flex-col h-full"
          >
            <div className="h-44 overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" alt="Exams" />
              <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">MITIHANI</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider block mb-1">CSEE &bull; FTNA &bull; Mock</span>
                <h3 className="font-bold text-slate-950 text-base leading-snug group-hover:text-cyan-600 transition-colors">Mitihani ya Mock ya Mikoa 2024 Ipo Tayari</h3>
                <p className="text-slate-500 text-xs mt-2 line-clamp-3">Jipime uwezo wako kwa kujibu past papers za Mock kutoka mikoa ya Arusha, Mwanza, Kilmanjaro na Dar.</p>
              </div>
              <span className="text-cyan-600 font-bold text-xs inline-flex items-center gap-1 pt-4">Anza Mazoezi &rarr;</span>
            </div>
          </div>

          {/* Fisi Maji AI Card */}
          <div 
            onClick={() => onNavigate('fisimaji')}
            className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-cyan-300 transition-all flex flex-col h-full"
          >
            <div className="h-44 bg-gradient-to-br from-indigo-600 via-indigo-900 to-purple-950 flex items-center justify-center relative overflow-hidden">
              <Cpu size={56} className="text-indigo-400/40 animate-pulse" />
              <Bot size={48} className="absolute text-cyan-300 stroke-[1.5]" />
              <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">AI ASSISTANT</span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider block mb-1">Fisi Maji AI &bull; Smart Tutor</span>
                <h3 className="font-bold text-slate-950 text-base leading-snug group-hover:text-cyan-600 transition-colors">Uliza Swali Lolote la Masomo kwa Lugha ya Swahili</h3>
                <p className="text-slate-500 text-xs mt-2 line-clamp-3">Msaidizi wa akili ya bandia aliyebobea kwenye mtaala wa TIE, NECTA, TCU na HESLB atakusaidia kuelewa kila kitu.</p>
              </div>
              <span className="text-cyan-600 font-bold text-xs inline-flex items-center gap-1 pt-4">Ongea na AI &rarr;</span>
            </div>
          </div>

          {/* Static Bulletin Board for Announcements */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200/60 p-5 flex flex-col justify-between h-full shadow-inner">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2 mb-3">
                <Megaphone size={16} className="text-red-500 animate-bounce" />
                Matangazo Yetu
              </h3>
              <div className="space-y-3.5 divide-y divide-slate-200">
                <div className="pt-0">
                  <span className="text-[9px] text-slate-400 font-bold block">Leo hii</span>
                  <span className="text-xs font-bold text-slate-800 leading-tight block hover:text-cyan-600 cursor-pointer">HESLB yafungua rasmi dirisha la maombi ya mikopo ya elimu ya juu.</span>
                </div>
                <div className="pt-3">
                  <span className="text-[9px] text-slate-400 font-bold block">Jana</span>
                  <span className="text-xs font-bold text-slate-800 leading-tight block hover:text-cyan-600 cursor-pointer">Kalenda ya mitihani ya NECTA kwa shule za sekondari imesasishwa.</span>
                </div>
                <div className="pt-3">
                  <span className="text-[9px] text-slate-400 font-bold block">Siku 3 zilizopita</span>
                  <span className="text-xs font-bold text-slate-800 leading-tight block hover:text-cyan-600 cursor-pointer">Tanzania Institute of Education (TIE) yazindua vitabu vipya vya kidijitali.</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('matangazo')}
              className="mt-4 w-full py-2 text-center text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors border border-cyan-400/60 hover:border-cyan-500/80 rounded-xl"
            >
              ONA MATANGAZO YOTE
            </button>
          </div>

        </div>
      </div>

      {/* ── Learning Hub Highlights (Light bento-style highlights) ── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs text-cyan-600 font-extrabold uppercase tracking-widest">Jifunze Sehemu Moja</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 uppercase leading-none mt-2">
              Masomo, Notisi na Mitihani ya Zamani
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => onNavigate('masomo')} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-cyan-500/10">
              Anza Kusoma
            </button>
            <button onClick={() => onNavigate('mitihani')} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-sm transition-all border border-slate-200">
              Tafuta Mtihani
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div onClick={() => onNavigate('masomo')} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer">
            <div className="w-11 h-11 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-4"><BookOpen size={22} className="stroke-[2]" /></div>
            <h3 className="font-bold text-slate-950 text-sm">Masomo Makuu (Subjects)</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">Hisabati, Fizikia, Kemia, Biolojia, Kiswahili, Jiografia, Uraia kwa mitaala yote ya Tanzania.</p>
          </div>

          <div onClick={() => onNavigate('mitihani')} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer">
            <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mb-4"><FileText size={22} className="stroke-[2]" /></div>
            <h3 className="font-bold text-slate-950 text-sm">Mitihani (Past Papers)</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">Mitihani ya taifa ya NECTA, mock za mikoa, pre-NECTA, marking schemes, na majibu ya vitabu.</p>
          </div>

          <div onClick={() => onNavigate('videos')} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer">
            <div className="w-11 h-11 bg-red-100 text-red-700 rounded-xl flex items-center justify-center mb-4"><Play size={22} className="stroke-[2]" /></div>
            <h3 className="font-bold text-slate-950 text-sm">Darasani (Video Tutorials)</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">Tazama video za walimu mashuhuri wakisuluhisha maswali magumu na kuelezea mada kwa undani.</p>
          </div>

          <div onClick={() => onNavigate('duka')} className="p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer">
            <div className="w-11 h-11 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mb-4"><Bot size={22} className="stroke-[2]" /></div>
            <h3 className="font-bold text-slate-950 text-sm">Duka la Elimu</h3>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">Njia rahisi ya kununua vitabu vya miongozo na vifaa vya shule kwa checkout ya moja kwa moja WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* ── Live Video Lessons Preview Section (Dark theme showcase) ── */}
      <section className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs text-red-500 font-extrabold uppercase tracking-widest block mb-1">Lupa+ Streaming</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase">Jifunze kwa Vitendo</h2>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-xl">Video za mada na mafunzo mafupi kutoka kwa walimu wazoefu, somo kwa somo, darasa kwa darasa.</p>
          </div>
          <button onClick={() => onNavigate('videos')} className="bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold px-5 py-2.5 rounded-full transition-all border border-white/15">
            MAKTABA YA VIDEO &rarr;
          </button>
        </div>

        {/* Video Horizontal Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => onNavigate('videos')} className="bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all group cursor-pointer">
            <div className="relative h-36 bg-black flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" alt="" />
              <div className="absolute inset-0 bg-black/25"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"><Play size={18} className="fill-current ml-0.5" /></div>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mb-0.5">Biology &bull; Form III</span>
              <h4 className="font-bold text-xs text-white line-clamp-2">Muundo na Kazi ya Seli ya Mimea (Plant Cell Structure)</h4>
            </div>
          </div>

          <div onClick={() => onNavigate('videos')} className="bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all group cursor-pointer">
            <div className="relative h-36 bg-blue-900/40 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-blue-950 flex items-center justify-center text-slate-600 text-3xl"><BookOpen size={48} className="text-slate-700" /></div>
              <div className="absolute inset-0 bg-black/25"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"><Play size={18} className="fill-current ml-0.5" /></div>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mb-0.5">Mathematics &bull; Form IV</span>
              <h4 className="font-bold text-xs text-white line-clamp-2">Jinsi ya Kutatua Quadratic Equations kwa Njia ya Formular</h4>
            </div>
          </div>

          <div onClick={() => onNavigate('videos')} className="bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all group cursor-pointer">
            <div className="relative h-36 bg-black flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2069&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="" loading="lazy" />
              <div className="absolute inset-0 bg-black/30 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play size={18} className="fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mb-0.5">Chemistry &bull; O-Level</span>
              <h4 className="font-bold text-xs text-white line-clamp-2">Volumetric Analysis (Titration Practical)</h4>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl overflow-hidden transition-all group cursor-pointer" onClick={() => onNavigate('videos')}>
            <div className="relative w-full h-36 overflow-hidden bg-black">
              <img src="https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="" loading="lazy" />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play size={18} className="fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-wider block mb-0.5">Geography &bull; Msingi</span>
              <h4 className="font-bold text-xs text-white line-clamp-2">Mfumo wa Jua na Sayari Zake (Solar System)</h4>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Systems (Accordion layout) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <span className="text-xs text-cyan-600 font-extrabold uppercase tracking-wider">FAQ</span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 uppercase leading-none">
            Maswali Yanayoulizwa Sana
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Una maswali kuhusu Lupanulla Elimu Hub? Soma majibu hapa, au wasiliana na timu yetu kwa msaada zaidi.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 flex-wrap">
            <a href="mailto:lupanulla.co.tz@gmail.com" className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shrink-0">
              <Mail size={14} /> Barua Pepe
            </a>
            <a href="tel:0743548225" className="inline-flex items-center justify-center gap-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shrink-0">
              <Phone size={14} /> Pigia Simu
            </a>
            <a href="https://wa.me/255743548225" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shrink-0">
              <MessageCircle size={14} /> WhatsApp Chat
            </a>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all">
            <button 
              onClick={() => toggleFaq(0)}
              className="w-full flex justify-between items-center text-left font-bold text-slate-900 text-sm sm:text-base"
            >
              <span>Je, naweza kusoma notes na kupakua mitihani bila malipo?</span>
              {faqOpen[0] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {faqOpen[0] && (
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed border-t border-slate-100 pt-3">
                Ndiyo kabisa! Lupanulla inatoa upatikanaji wa bure kabisa kwa asilimia 100 kwa maudhui yote ya kielimu kama vile notes za masomo yote, past papers za NECTA na majaribio ya shule. Lengo letu ni kuwawezesha wanafunzi wote nchini kupata elimu bora bure.
              </p>
            )}
          </div>

          <div className="lupa-faq-item bg-white border border-gray-200 p-5 rounded-2xl shadow-sm transition-all">
            <button 
              onClick={() => toggleFaq(1)}
              className="w-full flex justify-between items-center text-left font-bold text-slate-900 text-sm sm:text-base"
            >
              <span>Fisi Maji AI ananisaidiaje katika masomo?</span>
              {faqOpen[1] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {faqOpen[1] && (
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed border-t border-slate-100 pt-3">
                Fisi Maji AI ni msaidizi wako binafsi wa masomo. Anaelewa mtaala wa Tanzania (TIE &amp; NECTA) kikamilifu. Unaweza kumuuliza kutatua maswali magumu ya hesabu, kueleza dhana za sayansi, kukutafutia maana ya maneno au kukusaidia kuandika insha kwa Swahili fasaha.
              </p>
            )}
          </div>

          <div className="lupa-faq-item bg-white border border-gray-200 p-5 rounded-2xl shadow-sm transition-all">
            <button 
              onClick={() => toggleFaq(2)}
              className="w-full flex justify-between items-center text-left font-bold text-slate-900 text-sm sm:text-base"
            >
              <span>Je, naweza kutumia tovuti hii kwenye simu yangu ya mkononi?</span>
              {faqOpen[2] ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>
            {faqOpen[2] && (
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed border-t border-slate-100 pt-3">
                Ndiyo. Jukwaa letu limetengenezwa likiwa responsive kikamilifu kwa simu ya mkononi, tablet na desktop. Unaweza kusoma notisi, kufanya mazoezi na kutazama video ukiwa popote pale kupitia simu yako ya mkononi ya aina yoyote.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Google AdSense Responsive Ad Unit (Portal-bottom) ── */}
      <AdSenseWidget slotId="2000200202" className="my-6" />

      {/* ── Beautiful Newsletter Section ── */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col lg:flex-row items-center gap-8 justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_26px]"></div>
        <div className="relative z-10 max-w-lg space-y-3 text-center lg:text-left">
          <span className="text-xs text-cyan-400 font-extrabold uppercase tracking-wider">Lupanulla Newsletter</span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl leading-none">
            Pokea Updates za Masomo &amp; Mitihani
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Jiunge na barua pepe yetu upokee taarifa za hivi karibuni za mitihani ya NECTA, notisi mpya za masomo, na updates kutoka Lupanulla Foundation moja kwa moja kwenye inbox yako kila wiki.
          </p>
        </div>

        <div className="relative z-10 w-full lg:w-96">
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input 
              type="email" 
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Andika barua pepe yako..." 
              className="flex-grow bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-1">
              <Mail size={16} /> Jiunge
            </button>
          </form>
          {newsletterStatus && (
            <p className="text-[11px] text-cyan-300 font-bold text-center lg:text-left mt-2 flex items-center justify-center lg:justify-start gap-1">
              <CheckCircle size={12} /> {newsletterStatus}
            </p>
          )}
        </div>
      </section>

    </div>
  );
}
