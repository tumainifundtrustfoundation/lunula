import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  Globe,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface Job {
  id: string;
  title: string;
  school: string;
  location: string;
  salary: string;
  type: string;
  subjects: string[];
  description: string;
  sourceUrl?: string;
  publishedAt?: string;
}

export default function AjiraView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchJobs = async (isManualUpdate = false) => {
    if (isManualUpdate) {
      setUpdating(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch('/api/ai/crawl-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Imeshindwa kupata majibu kutoka kwenye seva yetu.');
      }
      const data = await response.json();
      if (data && data.jobs) {
        setJobs(data.jobs);
      } else {
        throw new Error('Data haikupatikana kwa usahihi.');
      }
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError('Shida imetokea wakati wa kuunganisha na Google Jobs. Hakikisha mtandao upo sawa na ufunguo wa AI umewekwa.');
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = (job: Job) => {
    if (job.sourceUrl) {
      window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Tafadhali tuma wasifu wako (CV) na nakala ya vyeti kwa barua pepe au kiungo cha shule: ${job.school}.\n\nUnaweza kuwasiliana nasi kwa usaidizi zaidi kupitia barua pepe: lupanulla.co.tz@gmail.com au Simu/WhatsApp: 0699479032.`);
    }
  };

  // Filter and search logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.subjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || job.type.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div id="ajira-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      
      {/* Jobs Jumbotron Banner */}
      <section className="bg-gradient-to-r from-emerald-600 via-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-emerald-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-black uppercase tracking-wider">
            <Briefcase size={12} className="animate-pulse" /> Ajira na Nafasi za Kazi za Walimu
          </span>
          <h1 className="text-2xl sm:text-4xl font-display font-extrabold uppercase tracking-tight">Google Jobs & Ajira Tanzania</h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Mfumo wetu unatumia AI na **Google Search Grounding** kutambua, kukusanya na kusasisha nafasi mpya za kazi za ualimu na sekta ya elimu kutoka kwenye hifadhidata ya **Google Jobs** na kurasa zote za elimu Tanzania automatically!
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={() => fetchJobs(true)}
              disabled={updating || loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <RefreshCw size={13} className={updating ? 'animate-spin' : ''} />
              {updating ? 'Inatafuta Mtandaoni...' : 'Sasisha Ajira Kiotomatiki'}
            </button>
            <span className="inline-flex items-center gap-1 text-[10px] bg-white/10 px-3 py-2 rounded-xl text-slate-300 font-bold border border-white/5">
              <CheckCircle2 size={12} className="text-emerald-400" /> Inajisasisha yenyewe kila unapotembelea
            </span>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tafuta kwa mkoa, shule, somo au jina la nafasi ya kazi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-600 cursor-pointer"
          >
            <option value="all">Aina Zote za Mikataba</option>
            <option value="full-time">Full-time (Kutwa Nzima)</option>
            <option value="part-time">Part-time (Muda Maalum)</option>
            <option value="contract">Contract (Mkataba)</option>
            <option value="temporary">Temporary (Muda Mfupi)</option>
          </select>
        </div>
      </div>

      {/* Main Jobs Listing section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
            Nafasi Zilizosomwa Kutoka Google Jobs ({filteredJobs.length})
          </h3>
          {updating && (
            <span className="text-[10px] text-indigo-600 font-extrabold animate-pulse uppercase">
              Inapakua matoleo ya hivi karibuni...
            </span>
          )}
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-xs text-amber-800">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="space-y-1">
              <p className="font-black">Hitilafu ya Mtandao</p>
              <p className="leading-relaxed font-semibold">{error}</p>
              <button 
                onClick={() => fetchJobs(false)}
                className="text-indigo-600 hover:underline font-extrabold mt-1 block"
              >
                Jaribu tena hivi sasa
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded"></div>
                  <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center py-16 space-y-4 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto border border-slate-150">
              <Briefcase size={32} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">Hakuna kazi zilizopatikana</h4>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">
              Hatujapata nafasi za kazi zinazoendana na utafutaji au vichujio vyako hivi sasa. Jaribu kubadilisha neno la utafutaji au bofya &quot;Sasisha Ajira Kiotomatiki&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
                key={job.id} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all space-y-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-2.5 flex-grow">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      {job.type}
                    </span>
                    <span className="bg-slate-50 text-slate-500 border border-slate-150 px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <Globe size={10} className="text-indigo-500" />
                      Google Jobs verified
                    </span>
                    {job.publishedAt && (
                      <span className="text-slate-400 font-bold">
                        <Clock size={11} className="inline mr-0.5" /> {job.publishedAt}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-0.5">
                    <h4 className="font-display font-black text-slate-950 text-base sm:text-lg leading-snug">
                      {job.title}
                    </h4>
                    <p className="text-indigo-900 font-extrabold text-xs">{job.school}</p>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed font-semibold">
                    {job.description}
                  </p>
                  
                  {/* Subjects badges */}
                  {job.subjects && job.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.subjects.map((sub, i) => (
                        <span key={i} className="bg-slate-50 border border-slate-150 font-bold text-[10px] text-slate-500 px-2.5 py-0.5 rounded-lg">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-bold pt-1 border-t border-slate-50">
                    <span className="flex items-center gap-0.5"><MapPin size={12} /> {job.location}</span>
                    <span>•</span>
                    <span className="text-emerald-600">{job.salary}</span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto">
                  <button 
                    onClick={() => handleApply(job)}
                    className="w-full py-2.5 px-5 text-xs text-center font-extrabold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.01]"
                  >
                    {job.sourceUrl ? (
                      <>
                        Omba Mtandaoni <ExternalLink size={13} />
                      </>
                    ) : (
                      <>
                        Omba Kazi <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
