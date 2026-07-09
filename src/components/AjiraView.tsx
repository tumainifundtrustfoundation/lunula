import React from 'react';
import { 
  Compass, 
  MapPin, 
  Briefcase, 
  Clock, 
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  school: string;
  location: string;
  salary: string;
  type: string; // 'Full-time', 'Part-time', 'Contract'
  subjects: string[];
  description: string;
}

export default function AjiraView() {
  const jobs: Job[] = [
    {
      id: 'job-feza',
      title: 'Mwalimu wa Physics na Mathematics (O-Level & A-Level)',
      school: 'Feza Schools Tanzania',
      location: 'Dar es Salaam, Kawe',
      salary: 'TSh 1,200,000 - 1,800,000',
      type: 'Full-time',
      subjects: ['Physics', 'Mathematics'],
      description: 'Tunatafuta mwalimu mzoefu wa kufundisha masomo ya Physics na Advanced Mathematics kwa madarasa ya sekondari. Awe na uzoefu wa angalau miaka 3 katika matokeo ya Division I.'
    },
    {
      id: 'job-marian',
      title: 'A-Level Biology & Chemistry Teacher',
      school: 'Marian Girls High School',
      location: 'Pwani, Bagamoyo',
      salary: 'TSh 1,000,000 - 1,500,000',
      type: 'Full-time',
      subjects: ['Biology', 'Chemistry'],
      description: 'Marian Girls inakaribisha maombi ya kazi kwa nafasi ya mwalimu wa Kemia na Biolojia kwa ngazi ya Kidato cha Tano na Sita. Malazi na chakula hutolewa na shule.'
    },
    {
      id: 'job-stmarys',
      title: 'Primary School English Medium Teacher',
      school: 'St. Mary`s International School',
      location: 'Mbeya',
      salary: 'TSh 700,000 - 950,000',
      type: 'Contract',
      subjects: ['English', 'Social Studies'],
      description: 'Tunahitaji mwalimu hodari wa kufundisha somo la Kiingereza na Maarifa ya Jamii kwa madarasa ya msingi (Class 4-7). Awe na stashahada au shahada ya elimu.'
    }
  ];

  return (
    <div id="ajira-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      {/* Jobs Banner */}
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Briefcase size={12} /> Ajira Sekta ya Elimu
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Nafasi za Kazi za Walimu (Ajira)</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Vinjari fursa na nafasi mpya za kazi za ualimu, ukufunzi, na usaidizi wa masomo kutoka shule mbalimbali za sekondari na msingi zenye sifa bora Tanzania.
          </p>
        </div>
      </section>

      {/* Jobs catalog listing */}
      <div className="space-y-6">
        <h3 className="font-display font-extrabold text-lg text-slate-900 uppercase">Nafasi Zinazopatikana Sasa ({jobs.length})</h3>
        
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-cyan-300 hover:shadow-md transition-all space-y-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2 flex-grow">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-2.5 py-0.5 rounded-full">{job.type}</span>
                  <span className="text-slate-400"><Clock size={12} className="inline mr-0.5" /> Leo hii</span>
                </div>
                <h4 className="font-display font-extrabold text-slate-950 text-base sm:text-lg leading-snug">{job.title}</h4>
                <p className="text-slate-600 font-bold text-xs">{job.school}</p>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{job.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-bold pt-1">
                  <span className="flex items-center gap-0.5"><MapPin size={12} /> {job.location}</span>
                  <span>•</span>
                  <span className="text-cyan-600">{job.salary}</span>
                </div>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                <button 
                  onClick={() => alert(`Tafadhali tuma wasifu wako (CV) na nakala ya vyeti kwa barua pepe ya shule ya kufanyia maombi ya kazi. Unaweza kuwasiliana nasi kwa usaidizi: lupanulla.co.tz@gmail.com`)}
                  className="w-full py-2.5 px-5 text-xs text-center font-extrabold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  Omba Kazi <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
