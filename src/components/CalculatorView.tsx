import React, { useState } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  RefreshCw, 
  Award, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SubjectScore {
  name: string;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | '';
}

export default function CalculatorView() {
  const defaultSubjects: SubjectScore[] = [
    { name: 'Civics', grade: '' },
    { name: 'History', grade: '' },
    { name: 'Geography', grade: '' },
    { name: 'Kiswahili', grade: '' },
    { name: 'English Language', grade: '' },
    { name: 'Physics', grade: '' },
    { name: 'Chemistry', grade: '' },
    { name: 'Biology', grade: '' },
    { name: 'Basic Mathematics', grade: '' }
  ];

  const [scores, setScores] = useState<SubjectScore[]>(defaultSubjects);
  const [result, setResult] = useState<{
    division: string;
    points: number;
    gpa: number;
    status: string;
  } | null>(null);

  const gradeValues = { A: 1, B: 2, C: 3, D: 4, F: 5 };

  const handleGradeChange = (index: number, gradeValue: any) => {
    const updated = [...scores];
    updated[index].grade = gradeValue;
    setScores(updated);
  };

  const handleReset = () => {
    setScores(defaultSubjects.map(s => ({ ...s, grade: '' })));
    setResult(null);
  };

  const calculateNectaPoints = () => {
    // 1. Get all subjects that have a grade
    const graded = scores.filter(s => s.grade !== '') as { name: string; grade: 'A' | 'B' | 'C' | 'D' | 'F' }[];
    
    if (graded.length < 7) {
      alert('Tafadhali weka alama kwa angalau masomo 7 ya mtaala ili kupiga hesabu.');
      return;
    }

    // 2. Map grades to values (A=1, B=2, C=3, D=4, F=5)
    const values = graded.map(s => gradeValues[s.grade]).sort((a, b) => a - b);

    // 3. Take the best 7 subjects
    const bestSeven = values.slice(0, 7);
    const pointsSum = bestSeven.reduce((acc, curr) => acc + curr, 0);

    // 4. Calculate GPA (Average of best seven)
    const gpa = Number((pointsSum / 7).toFixed(2));

    // 5. Determine Division based on NECTA standards
    let division = 'DARAJA LA SIFURI (Division 0)';
    let status = 'Pole! Inabidi uongeze bidii ili kufikia kiwango cha ufaulu.';

    if (pointsSum >= 7 && pointsSum <= 17) {
      division = 'DARAJA LA KWANZA (Division I)';
      status = 'Hongera sana! Umefaulu kwa kiwango cha juu sana cha ufaulu kitaifa.';
    } else if (pointsSum >= 18 && pointsSum <= 21) {
      division = 'DARAJA LA PILI (Division II)';
      status = 'Vizuri sana! Umefaulu vizuri sana na una sifa ya kujiunga na Kidato cha Tano au vyuo.';
    } else if (pointsSum >= 22 && pointsSum <= 25) {
      division = 'DARAJA LA TATU (Division III)';
      status = 'Safi! Umefaulu na una sifa nzuri sana za kujiunga na mafunzo mbalimbali.';
    } else if (pointsSum >= 26 && pointsSum <= 33) {
      division = 'DARAJA LA NNE (Division IV)';
      status = 'Umefaulu. Unahitaji kuangalia masomo yenye ufaulu wa D au zaidi ili kuendelea mbele.';
    }

    setResult({
      division,
      points: pointsSum,
      gpa,
      status
    });
  };

  return (
    <div id="calculator-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Calculator size={12} /> NECTA GPA Standards
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Kikokotoo cha Alama (GPA Calculator)</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Ingiza alama zako za majaribio au mitihani ya Mock kukokotoa kiwango chako cha ufaulu wa NECTA (Division) kulingana na masomo yako 7 bora.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Graded Forms table */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-slate-950 text-sm uppercase">Orodha ya Masomo (O-Level)</h3>
            <button onClick={handleReset} className="text-slate-400 hover:text-slate-700 text-xs font-semibold flex items-center gap-1"><RefreshCw size={12} /> Anza Upya</button>
          </div>

          <div className="space-y-3">
            {scores.map((subj, idx) => (
              <div key={subj.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs sm:text-sm font-semibold">
                <span className="text-slate-800">{subj.name}</span>
                <select 
                  value={subj.grade}
                  onChange={(e) => handleGradeChange(idx, e.target.value)}
                  className="bg-white border border-slate-250 rounded-xl px-4 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                >
                  <option value="">Weka Grade</option>
                  <option value="A">Grade A (Excellent)</option>
                  <option value="B">Grade B (Very Good)</option>
                  <option value="C">Grade C (Good)</option>
                  <option value="D">Grade D (Satisfactory)</option>
                  <option value="F">Grade F (Fail)</option>
                </select>
              </div>
            ))}
          </div>

          <button 
            onClick={calculateNectaPoints}
            className="w-full py-3.5 text-xs text-center font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase"
          >
            KOKOTOA DIVISION YANGU
          </button>
        </div>

        {/* Calculated results presentation */}
        <div className="md:col-span-1 space-y-6">
          {result ? (
            <div className="bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 animate-fade-in relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="text-center space-y-2">
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-widest block">Matokeo Yakoyaliyokokotolewa</span>
                <h4 className="font-display font-extrabold text-cyan-400 text-base sm:text-lg leading-tight uppercase">{result.division}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center border-y border-slate-800 py-5">
                <div className="space-y-1 border-r border-slate-800">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase">Jumla ya Pointi</span>
                  <p className="text-2xl font-display font-extrabold text-white">{result.points}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase">Wastani GPA</span>
                  <p className="text-2xl font-display font-extrabold text-white">{result.gpa}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed text-center">
                  {result.status}
                </p>
                <div className="flex items-center justify-center gap-1 bg-slate-900 border border-slate-850 rounded-xl p-2.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Award size={14} className="text-amber-500" />
                  Grade formula: A=1, B=2, C=3, D=4, F=5
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center py-10 space-y-3 shadow-sm h-full flex flex-col justify-center">
              <HelpCircle size={32} className="mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase">Matokeo Yatabadilika hapa</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs mx-auto">
                Tafadhali chagua alama za masomo yako katika orodha ya upande wa kushoto, kisha bofya &quot;Kokotoa&quot; ili kuona kiwango chako cha ufaulu hapa.
              </p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase">Viwango vya Division:</h4>
            <ul className="space-y-2 text-[10px] font-semibold text-slate-500">
              <li className="flex justify-between"><span>Division I:</span> <span className="font-bold text-slate-700">Pointi 7 - 17</span></li>
              <li className="flex justify-between"><span>Division II:</span> <span className="font-bold text-slate-700">Pointi 18 - 21</span></li>
              <li className="flex justify-between"><span>Division III:</span> <span className="font-bold text-slate-700">Pointi 22 - 25</span></li>
              <li className="flex justify-between"><span>Division IV:</span> <span className="font-bold text-slate-700">Pointi 26 - 33</span></li>
              <li className="flex justify-between"><span>Division 0:</span> <span className="font-bold text-red-600">Pointi 34 - 35</span></li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
