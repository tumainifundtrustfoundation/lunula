import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Megaphone, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Heart, 
  Award,
  Compass,
  User
} from 'lucide-react';
import { fetchAnnouncements } from '../firebase';
import { Announcement } from '../types';

/**
 * MhuniWalking Component
 * Animates a character walking from left to right
 */
function MhuniWalking() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-12 pointer-events-none overflow-hidden z-0">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '120%' }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="flex items-center gap-2 text-cyan-200/40"
      >
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <User size={32} strokeWidth={3} />
          </motion.div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Mhuni mtaalam</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function MatangazoView() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'HESLB Yafungua Rasmi Maombi ya Mikopo ya Elimu ya Juu 2026/2027',
      desc: 'Bodi ya Mikopo ya Wanafunzi wa Elimu ya Juu (HESLB) imetangaza rasmi kufunguliwa kwa mfumo wa maombi ya mikopo kwa ajili ya wanafunzi wanaotarajia kujiunga na vyuo vikuu na vyuo vya kati nchini Tanzania.',
      createdAt: Date.now()
    },
    {
      id: 'ann-2',
      title: 'Kalenda ya Mitihani ya NECTA kwa Shule za Sekondari na Msingi Yasasishwa',
      desc: 'Baraza la Mitihani la Tanzania (NECTA) limetoa ratiba rasmi ya kufanya mitihani ya kumaliza elimu ya sekondari Kidato cha Nne (CSEE) na Kidato cha Pili (FTNA) kwa mwaka 2026.',
      createdAt: Date.now() - 3600000 * 24
    }
  ];

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const fetched = await fetchAnnouncements();
      setAnnouncements(fetched.length > 0 ? fetched : defaultAnnouncements);
    } catch (e) {
      console.error(e);
      setAnnouncements(defaultAnnouncements);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="matangazo-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      {/* Announcements Banner */}
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <MhuniWalking />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Megaphone size={12} /> Lupanulla Foundations
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Kuhusu Sisi &amp; Matangazo (About)</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Soma matangazo ya hivi karibuni kutoka Lupanulla Foundation, baraza la mitihani la taifa, na bodi ya mikopo ya elimu ya juu Tanzania.
          </p>
        </div>
      </section>

      {/* Main Grid: Left About, Right Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left: About Us Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-slate-950 text-sm uppercase flex items-center gap-1.5">
            <Heart size={16} className="text-red-500" />
            Lupanulla Foundation
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed font-semibold">
            Lupanulla Elimu Hub ni jukwaa namba moja la kidijitali Tanzania linalounganisha mtaala mzima wa elimu - notisi, mitihani ya NECTA, video, duka la elimu na msaidizi wa AI (Fisi Maji AI) ili kurahisisha na kuboresha ufaulu wa wanafunzi nchini.
          </p>
          
          <div className="space-y-3.5 border-t border-slate-100 pt-5 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2.5">
              <Mail size={16} className="text-cyan-600" />
              <span>lupanulla.co.tz@gmail.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-cyan-600" />
              <span>+255 655 459 385</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="text-cyan-600" />
              <span>Dar es Salaam, Tanzania</span>
            </div>
          </div>
        </div>

        {/* Right: Announcements listing */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-slate-950 text-sm uppercase">Habari na Matukio ({announcements.length})</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-cyan-600">
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inapakua Matangazo...</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-slate-100">
              {announcements.map((ann, i) => (
                <div key={ann.id} className={`space-y-2 ${i > 0 ? 'pt-6' : ''}`}>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Clock size={12} />
                    <span>{new Date(ann.createdAt).toLocaleDateString('sw-TZ')}</span>
                  </div>
                  <h4 className="font-display font-extrabold text-slate-950 text-base leading-snug">{ann.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{ann.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
