import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Filter, 
  X, 
  Sparkles, 
  Eye, 
  Clock, 
  User, 
  Compass, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { fetchVideos } from '../firebase';
import { Video } from '../types';

interface VideosViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function VideosView({ onNavigate, userProfile }: VideosViewProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const defaultVideos: Video[] = [
    {
      id: 'vid-phy',
      title: 'Practical Physics: Jinsi ya kusoma Vernier Caliper na Micrometer Screw Gauge',
      subject: 'Physics',
      level: 'O-Level',
      teacher: 'Mwl. Joshua',
      duration: '12:45',
      youtubeId: '8_z6gD5pUoo', // Standard YouTube embed sample
      views: 450,
      createdAt: Date.now()
    },
    {
      id: 'vid-chem',
      title: 'Chemistry Solved Practical: Qualitative Analysis & Cation Identification',
      subject: 'Chemistry',
      level: 'O-Level',
      teacher: 'Mwl. Grace',
      duration: '18:10',
      youtubeId: 'b_X6fO3_Ooo',
      views: 310,
      createdAt: Date.now() - 3600000
    },
    {
      id: 'vid-math',
      title: 'Form IV Advanced Mathematics: Introduction to Integration and Differentiation',
      subject: 'Advanced Mathematics',
      level: 'A-Level',
      teacher: 'Dr. Joseph',
      duration: '24:30',
      youtubeId: 'c_D2f_S_Poo',
      views: 780,
      createdAt: Date.now() - 3600000 * 2
    },
    {
      id: 'vid-bio',
      title: 'Msingi Darasa la 6 Sayansi: Mfumo wa Uzazi wa Binadamu na Maisha yetu',
      subject: 'Science',
      level: 'Primary',
      teacher: 'Mwl. Amina',
      duration: '10:15',
      youtubeId: 'd_Z2o_P_Qoo',
      views: 120,
      createdAt: Date.now() - 3600000 * 5
    }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const fetched = await fetchVideos();
      setVideos(fetched.length > 0 ? fetched : defaultVideos);
    } catch (e) {
      console.error(e);
      setVideos(defaultVideos);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = !searchQuery || v.title.toLowerCase().includes(searchQuery.toLowerCase()) || (v.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubj = !selectedSubject || v.subject === selectedSubject;
    return matchesSearch && matchesSubj;
  });

  const subjects = Array.from(new Set(videos.map(v => v.subject).filter(Boolean)));

  return (
    <div id="videos-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* Header section */}
      <section className="bg-gradient-to-r from-red-600 via-red-800 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden border border-red-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-red-200 text-xs font-bold uppercase tracking-wider border border-white/10">
            <Play size={12} className="fill-current" />
            Lupa+ Video Classrooms
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Darasani (Video Tutorials)</h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Sikiliza na utazame walimu hodari na mabingwa wa masomo nchini Tanzania wakieleza mada ngumu, wakisuluhisha maswali ya mitihani ya NECTA kwa urahisi, na kufanya majaribio ya maabara kwa njia ya video.
          </p>
        </div>
      </section>

      {/* Categories Search bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Tafuta video za Physics, Chemistry, Biology, Practical..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/40 text-slate-800 placeholder-slate-400"
          />
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button 
              onClick={() => setSelectedSubject('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${!selectedSubject ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Vyote
            </button>
            {subjects.map(sub => (
              <button 
                key={sub}
                onClick={() => setSelectedSubject(sub || '')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedSubject === sub ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-600">
          <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Inapakua Orodha ya Video...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVideos.map((vid) => (
            <div 
              key={vid.id} 
              onClick={() => setActiveVideo(vid)}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-44 bg-black flex items-center justify-center overflow-hidden">
                <img src={vid.thumbnailUrl || `https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=2070&auto=format&fit=crop`} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
                <div className="absolute inset-0 bg-black/25"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform"><Play size={20} className="fill-current ml-0.5" /></div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold font-mono">{vid.duration || '10:00'}</span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] text-red-600 font-extrabold uppercase tracking-wider block">{vid.subject} &bull; {vid.level}</span>
                  <h3 className="font-bold text-slate-950 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">{vid.title}</h3>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 text-[10px] text-slate-400 font-bold">
                  <span>{vid.teacher || 'Mwalimu'}</span>
                  <span className="flex items-center gap-0.5"><Eye size={12} /> {vid.views || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center py-16 space-y-2">
          <Play size={36} className="mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-900 text-sm">Hakuna Video Iliyopatikana</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">Jaribu kufuta vichujio vyako au utafute neno jingine.</p>
        </div>
      )}

      {/* YOUTUBE EMBED IFRAME PLAYER MODAL OVERLAY */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveVideo(null)}></div>
          
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[210] animate-fade-in text-white">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all z-20"
            >
              <X size={20} />
            </button>

            {/* Embed 16:9 responsive frame */}
            <div className="relative pb-[56.25%] h-0 bg-black">
              <iframe 
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId || 'dQw4w9WgXcQ'}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-6 space-y-2">
              <span className="text-xs text-red-500 font-extrabold uppercase tracking-wider block">{activeVideo.subject} &bull; {activeVideo.level}</span>
              <h2 className="font-display font-extrabold text-lg sm:text-xl uppercase leading-snug">{activeVideo.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold pt-1">
                <span>Mwalimu: {activeVideo.teacher}</span>
                <span>•</span>
                <span>Muda: {activeVideo.duration}</span>
                <span>•</span>
                <span>Kusomwa: {activeVideo.views} mara</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
