import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  FileText, 
  Play, 
  Sparkles, 
  Award,
  BookMarked,
  Printer,
  Compass,
  CheckCircle,
  HelpCircle,
  User,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface MasomoViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

interface Topic {
  title: string;
  subtopics: string[];
  content: string;
  notesSample: string;
}

interface ClassLevel {
  id: string;
  name: string;
  subjects: {
    name: string;
    topics: Topic[];
  }[];
}

export default function MasomoView({ onNavigate, userProfile }: MasomoViewProps) {
  const [openLevel, setOpenLevel] = useState<string | null>('olevel');
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  // Tanzanian Academic Structure: Levels -> Classes -> Subjects -> Topics & Content
  const academicData: ClassLevel[] = [
    {
      id: 'msingi',
      name: 'Elimu ya Msingi (Primary School - Darasa 5-7)',
      subjects: [
        {
          name: 'Hisabati (Mathematics)',
          topics: [
            {
              title: 'Sehemu na Desimali (Fractions & Decimals)',
              subtopics: [
                'Ufafanuzi wa sehemu (proper, improper and mixed fractions)',
                'Kubadili sehemu kuwa desimali na kinyume chake',
                'Kujumlisha na kutoa sehemu zenye asili tofauti',
                'Kuzidisha na kugawanya sehemu za hisabati'
              ],
              content: 'Sehemu inawakilisha sehemu ya kitu kizima. Ina namba ya juu (Kiasi) na namba ya chini (Asili). Desimali ni njia nyingine ya kuandika sehemu yenye asili ya 10, 100, 1000 n.k. Mfano, 1/2 inasomeka nusu, na kwa desimali ni 0.5.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Hisabati\nDarasa: Msingi\nMada: Sehemu na Desimali\n\n1. UTANGULIZI WA SEHEMU\nSehemu ni namba inayotaja sehemu ya kitu kizima ambacho kimegawanywa katika sehemu zilizo sawa. Sehemu huandikwa kwa kutumia namba mbili zilizotengwa kwa mstari mshazari au mlalo.\nNamba ya juu inaitwa kiasi (numerator) na namba ya chini inaitwa asili (denominator).\n\n2. AINA ZA SEHEMU\na) Sehemu Kawaida (Proper Fraction): Kiasi ni kidogo kuliko asili. Mfano: 2/3, 4/5.\nb) Sehemu Shazari (Improper Fraction): Kiasi ni kikubwa au sawa na asili. Mfano: 5/3, 7/4.\nc) Sehemu Mseto (Mixed Fraction): Inajumuisha namba nzima na sehemu ya kawaida. Mfano: 1 1/2, 2 3/4.\n\n3. KUBADILI SEHEMU KUWA DESIMALI\nIli kubadili sehemu kuwa desimali, gawa kiasi kwa asili. Mfano: 3/4 = 3 ÷ 4 = 0.75.'
            },
            {
              title: 'Maumbo ya Jometri (Geometric Shapes)',
              subtopics: [
                'Kutambua mstatili, mraba na duara',
                'Kutafuta eneo la mstatili na mraba',
                'Kutafuta mzingo wa maumbo mbalimbali'
              ],
              content: 'Jometri ni tawi la hisabati linalohusika na vipimo na sifa za mistari, pembe, na maumbo. Mstatili una pande nne, na pande zinazotazamana ziko sawa. Mraba una pande zote nne sawa na pembe zote ni nyuzi 90.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Hisabati\nMada: Maumbo ya Jometri\n\n1. MSTATILI (RECTANGLE)\nMstatili ni umbo lenye pande nne ambapo pande zinazotazamana zina urefu sawa na pembe zote nne ni pembe mraba (nyuzi 90).\nFormular za Mstatili:\n- Eneo (Area) = Urefu (L) x Upana (W)\n- Mzingo (Perimeter) = 2(Urefu + Upana) = 2(L + W)\n\n2. MRABA (SQUARE)\nMraba ni umbo lenye pande nne zinazolingana urefu na pembe zote nne ni pembe mraba (nyuzi 90).\nFormular za Mraba:\n- Eneo (Area) = Upande x Upande = S x S = S²\n- Mzingo (Perimeter) = Upande + Upande + Upande + Upande = 4S'
            }
          ]
        },
        {
          name: 'Sayansi na Teknolojia (Science & Tech)',
          topics: [
            {
              title: 'Mifumo ya Mwili wa Binadamu (Human Body Systems)',
              subtopics: [
                'Mfumo wa mmeng`enyo wa chakula (Digestive System)',
                'Mfumo wa upumuaji na viungo vyake',
                'Usafi na afya ya viungo vya mwili'
              ],
              content: 'Mwili wa binadamu umeundwa na mifumo mbalimbali inayofanya kazi kwa ushirikiano. Mfumo wa mmeng`enyo wa chakula huanzia kinywani na kuishia sehemu ya haja kubwa. Unahusika na kuvunja chakula kuwa virutubisho rahisi vinavyoweza kufyonzwa na mwili.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Sayansi na Teknolojia\nMada: Mfumo wa Mmeng`enyo wa Chakula\n\n1. UTANGULIZI\nMmeng`enyo wa chakula ni mchakato wa kuvunja chakula katika chembechembe ndogo zinazoweza kufyonzwa na mwili kwa matumizi ya nishati, ukuaji na ukarabati wa seli.\n\n2. SEHEMU KUU ZA MFUMO WA MMENG`ENYO\na) Kinywa (Mouth): Mmeng`enyo wa kimitambo huanza hapa kwa meno kutafuna chakula, na mmeng`enyo wa kemikali huanza kwa vimeng`enya (enzymes) vya mate.\nb) Umio (Esophagus): Njia ya kupitisha chakula kuelekea tumboni kwa mtindo wa msukumo wa peristalsis.\nc) Tumbo (Stomach): Chakula huchanganywa na asidi ya Hydrochloric (HCl) na vimeng`enya vya Pepsin kumeng`enya protini.\nd) Utumbo Mwembamba (Small Intestine): Sehemu kuu ya mmeng`enyo kukamilika na ufyonzaji wa virutubisho kufanyika.\ne) Utumbo Mkubwa (Large Intestine): Kufyonza maji na chumvichumvi na kutoa uchafu kama kinyesi.'
            }
          ]
        }
      ]
    },
    {
      id: 'olevel',
      name: 'Elimu ya Sekondari - Kidato cha 1-4 (Ordinary Level - O-Level)',
      subjects: [
        {
          name: 'Physics (Fizikia)',
          topics: [
            {
              title: 'Linear Motion (Mwendo Mnyoofu)',
              subtopics: [
                'Distance and Displacement (Umbali na Mvuto)',
                'Speed, Velocity and Acceleration',
                'Equations of Uniformly Accelerated Motion',
                'Graphs of Motion (S-T and V-T graphs)'
              ],
              content: 'Linear motion is a motion along a straight line. It can be described mathematically using 1D equations. Speed is a scalar quantity while velocity is a vector quantity containing both magnitude and direction. Acceleration is the rate of change of velocity.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Physics (Fizikia)\nKidato: Kidato cha Nne (Form IV)\nMada: Linear Motion (Mwendo Mnyoofu)\n\n1. KEY TERMS & DEFINITIONS\na) Distance (s): The actual path length covered by an object. Unit: meters (m). It is a scalar quantity.\nb) Displacement (d): The shortest distance from the initial position to the final position in a specified direction. Unit: meters (m). It is a vector quantity.\nc) Speed (v): Distance covered per unit time. Speed = Distance / Time. It is a scalar.\nd) Velocity (u, v): Displacement per unit time. Velocity = Displacement / Time. It is a vector.\ne) Acceleration (a): The rate of change of velocity. Acceleration = (Final Velocity - Initial Velocity) / Time. Unit: m/s².\n\n2. THREE EQUATIONS OF LINEAR MOTION\nUnder uniform acceleration, we use:\n1. v = u + at\n2. s = ut + 0.5at²\n3. v² = u² + 2as\nWhere: u = initial velocity, v = final velocity, a = acceleration, t = time, s = displacement.'
            },
            {
              title: 'Structure of the Atom (Muundo wa Atomu)',
              subtopics: [
                'Protons, Neutrons and Electrons',
                'Atomic Number and Mass Number',
                'Isotopes and Chemical Bonding foundations'
              ],
              content: 'An atom is the smallest particle of an element that can take part in a chemical reaction. It consists of a dense nucleus containing protons and neutrons, surrounded by electrons revolving in circular orbits called energy levels.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Physics / Chemistry\nKidato: Kidato cha Kwanza (Form I)\nMada: Structure of the Atom\n\n1. ATOMIC STRUCTURE BASICS\nEvery substance is made of tiny particles called atoms. An atom contains three main subatomic particles:\n- Proton: Positively charged (+1), mass = 1 amu, located in the nucleus.\n- Neutron: Neutral/No charge (0), mass = 1 amu, located in the nucleus.\n- Electron: Negatively charged (-1), mass = 1/1840 amu, revolving in electron shells.\n\n2. ATOMIC NUMBER (Z) & MASS NUMBER (A)\n- Atomic Number (Z): The number of protons in the nucleus of an atom.\n- Mass Number (A): The total number of protons and neutrons in the nucleus. (A = Z + N)\n- Representation: Mass Number is written at the top-left of the chemical symbol, and Atomic Number at the bottom-left.'
            }
          ]
        },
        {
          name: 'History (Historia)',
          topics: [
            {
              title: 'Colonial Economy in East Africa',
              subtopics: [
                'Objectives of colonial economy (Raw materials, Markets)',
                'Methods of establishing colonial agriculture and settler farms',
                'Colonial labor systems (Migrant, Forced and Contract labor)',
                'Colonial trade and infrastructure development'
              ],
              content: 'The establishment of colonial economy in East Africa was designed to satisfy the needs of industrial capitalists in Europe. Settler agriculture was heavily promoted in Kenya, while peasant agriculture was emphasized in Uganda. In Tanganyika, both plantation (sisal) and peasant (coffee/cotton) agriculture existed.',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: History (Historia)\nKidato: Kidato cha Tatu (Form III)\nMada: Colonial Economy in East Africa\n\n1. MOTIVES OF COLONIAL ECONOMY\nThe economic structures established by British, German, and French colonizers in East Africa had specific aims:\na) To extract raw materials for European home industries (cotton, sisal, coffee, rubber).\nb) To find investment areas for surplus European capital.\nc) To create markets for manufactured goods from Europe.\nd) To secure cheap source of manual labor.\n\n2. SECTORS OF THE COLONIAL ECONOMY\n- Agriculture: Settler farming (e.g. White Highlands in Kenya), Plantation economy (e.g. Sisal in Tanganyika), Peasant agriculture (Uganda cotton).\n- Mining: Extraction of gold, diamonds, and mica using cheap manual labor.\n- Infrastructure: Construction of railways (e.g., Uganda Railway, Central Line) and roads connecting resource areas to the ports (Dar es Salaam, Mombasa).'
            }
          ]
        }
      ]
    },
    {
      id: 'alevel',
      name: 'Elimu ya Sekondari ya Juu - Kidato cha 5-6 (Advanced Level - A-Level)',
      subjects: [
        {
          name: 'Advanced Mathematics',
          topics: [
            {
              title: 'Calculus: Differentiation & Integration',
              subtopics: [
                'Limits and Continuity of functions',
                'Differentiation from first principles',
                'Techniques of integration (Substitution, Parts, Partial fractions)',
                'Applications of calculus to physics and economics'
              ],
              content: 'Calculus is the mathematical study of continuous change. Differentiation is the process of finding the rate of change (derivative) of a function, while integration is the inverse process of accumulation (finding the area under a curve).',
              notesSample: 'LUPANULLA ACADEMIC NOTISI SERIES:\n\nSomo: Advanced Mathematics\nKidato: Kidato cha Tano na Sita (Form V & VI)\nMada: Calculus (Mnyambuliko)\n\n1. LIMITS AND CONTINUITY\nA limit is the value that a function approaches as the input approaches some value. \n\n2. DIFFERENTIATION FROM FIRST PRINCIPLES\nThe derivative of f(x) with respect to x is defined as:\nf`(x) = lim(h -> 0) [f(x+h) - f(x)] / h\n\n3. CORE DIFFERENTIATION RULES\n- Power Rule: d/dx(x^n) = n*x^(n-1)\n- Product Rule: d/dx(u*v) = u*dv/dx + v*du/dx\n- Quotient Rule: d/dx(u/v) = (v*du/dx - u*dv/dx) / v²\n- Chain Rule: dy/dx = dy/du * du/dx'
            }
          ]
        }
      ]
    }
  ];

  // Client-side PDF Notes generation using standard jsPDF from CDN loaded in index.html
  const handleGeneratePdf = (topic: Topic, subjectName: string) => {
    setPdfGenerating(true);
    setPdfSuccess(false);

    setTimeout(() => {
      try {
        // Access jsPDF from window because we imported it in index.html as a script
        const { jsPDF } = (window as any).jspdf;
        const doc = new jsPDF();

        // 1. Draw elegant border & decorative banners
        doc.setFillColor(8, 145, 178); // Cyan-600 banner color
        doc.rect(0, 0, 210, 35, 'F');

        // Tanzania Flag subtle corner decoration
        doc.setFillColor(34, 139, 34); // Green
        doc.rect(190, 5, 15, 3, 'F');
        doc.setFillColor(255, 215, 0); // Gold
        doc.rect(190, 8, 15, 1, 'F');
        doc.setFillColor(0, 0, 0); // Black
        doc.rect(190, 9, 15, 3, 'F');
        doc.setFillColor(255, 215, 0); // Gold
        doc.rect(190, 12, 15, 1, 'F');
        doc.setFillColor(30, 144, 255); // Blue
        doc.rect(190, 13, 15, 3, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('LUPANULLA ELIMU HUB', 15, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Kitovu cha Elimu ya Sekondari na Msingi Tanzania', 15, 26);

        // Content Frame Header
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`Somo: ${subjectName}`, 15, 48);
        doc.text(`Mada: ${topic.title}`, 15, 55);

        // Divider Line
        doc.setDrawColor(203, 213, 225); // Slate-300
        doc.setLineWidth(0.5);
        doc.line(15, 60, 195, 60);

        // Render Notisi Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // Slate-700

        const splitText = doc.splitTextToSize(topic.notesSample, 180);
        doc.text(splitText, 15, 70);

        // Elegant Footer
        doc.setFillColor(15, 23, 42); // Slate-900
        doc.rect(0, 282, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('© 2026 Lupanulla Foundation. Notisi hizi hutolewa bure kwa wanafunzi wa Kitanzania.', 15, 291);
        doc.text('Kurasa: 1 ya 1', 175, 291);

        // Save file
        doc.save(`Lupanulla_Notisi_${subjectName.replace(/\s+/g, '_')}_${topic.title.replace(/\s+/g, '_')}.pdf`);
        setPdfSuccess(true);
      } catch (err) {
        console.error('PDF Generation Failed:', err);
      } finally {
        setPdfGenerating(false);
      }
    }, 1500);
  };

  const handleLevelToggle = (levelId: string) => {
    setOpenLevel(prev => (prev === levelId ? null : levelId));
    setOpenSubject(null);
    setSelectedTopic(null);
  };

  const handleSubjectToggle = (subjName: string) => {
    setOpenSubject(prev => (prev === subjName ? null : subjName));
    setSelectedTopic(null);
  };

  return (
    <div id="masomo-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50">
      
      {/* Header section with Tanzanian colors */}
      <section className="bg-gradient-to-r from-cyan-600 via-cyan-800 to-indigo-950 p-6 sm:p-10 rounded-3xl text-white shadow-lg relative overflow-hidden border border-cyan-500/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Subtle Tanzania Flag Colored Corner Accent */}
        <div className="absolute top-0 right-0 w-32 h-2 flex">
          <div className="flex-1 bg-[#1e7c1e]"></div>
          <div className="w-2 bg-[#fcd116]"></div>
          <div className="w-6 bg-[#000000]"></div>
          <div className="w-2 bg-[#fcd116]"></div>
          <div className="flex-1 bg-[#00a3dd]"></div>
        </div>

        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1 bg-white/10 text-cyan-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
            <BookMarked size={12} className="text-amber-400" />
            Mtaala Kamili wa TIE &amp; NECTA
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold uppercase leading-none">Notisi za Masomo</h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Hapa utapata muhtasari mzuri, notes zilizochambuliwa kwa lugha rahisi ya Kiswahili na Kiingereza, mada kwa mada, tangu Shule ya Msingi hadi Kidato cha Sita. Pakua kama PDF au soma mtandaoni bure kabisa!
          </p>
        </div>
      </section>

      {/* Accordion List + Document Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Levels and Subjects Accordion */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-display font-extrabold text-lg text-slate-900 uppercase">Chagua Ngazi ya Masomo</h2>
          
          <div className="space-y-3">
            {academicData.map((level) => {
              const isLevelOpen = openLevel === level.id;
              return (
                <div key={level.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
                  <button 
                    onClick={() => handleLevelToggle(level.id)}
                    className={`w-full flex justify-between items-center p-4 text-left font-bold text-xs sm:text-sm uppercase transition-colors ${isLevelOpen ? 'bg-cyan-50/50 text-cyan-700' : 'text-slate-800 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen size={16} className={isLevelOpen ? 'text-cyan-600' : 'text-slate-400'} />
                      {level.name}
                    </span>
                    {isLevelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isLevelOpen && (
                    <div className="border-t border-slate-100 p-2 space-y-1 bg-slate-50/50">
                      {level.subjects.map((subj) => {
                        const isSubjOpen = openSubject === subj.name;
                        return (
                          <div key={subj.name} className="rounded-xl overflow-hidden">
                            <button 
                              onClick={() => handleSubjectToggle(subj.name)}
                              className={`w-full flex justify-between items-center px-4 py-2.5 text-xs text-left font-semibold transition-all ${isSubjOpen ? 'bg-cyan-600 text-white shadow-inner' : 'text-slate-700 hover:bg-slate-200/55'}`}
                            >
                              <span>{subj.name}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.2 rounded-md group-hover:bg-slate-200">{subj.topics.length} Mada</span>
                            </button>

                            {isSubjOpen && (
                              <div className="bg-white p-2 border-x border-b border-slate-100 space-y-1">
                                {subj.topics.map((topic) => {
                                  const isTopicSelected = selectedTopic?.title === topic.title;
                                  return (
                                    <button 
                                      key={topic.title}
                                      onClick={() => setSelectedTopic(topic)}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${isTopicSelected ? 'bg-cyan-50 border-l-4 border-cyan-600 text-cyan-800' : 'text-slate-600 hover:bg-slate-50'}`}
                                    >
                                      <FileText size={12} className={isTopicSelected ? 'text-cyan-600' : 'text-slate-400'} />
                                      <span className="truncate">{topic.title}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Topic Reader Workspace */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              
              {/* Reader Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] text-cyan-600 font-extrabold uppercase tracking-wider block">Ngazi: {academicData.find(l => l.id === openLevel)?.name.split(' (')[0]}</span>
                  <h3 className="font-display font-extrabold text-slate-950 text-xl sm:text-2xl uppercase leading-tight">{selectedTopic.title}</h3>
                  <span className="text-xs text-slate-400 font-semibold">Imeandaliwa na Lupanulla Academic Board &bull; Julai 2026</span>
                </div>
                
                {/* Download PDF client action button */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleGeneratePdf(selectedTopic, openSubject || 'Somo')}
                    disabled={pdfGenerating}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/10 flex items-center gap-1.5"
                  >
                    {pdfGenerating ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Inapakua...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} /> Pakua PDF (Bure)
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              {pdfSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-semibold p-3 rounded-2xl flex items-center gap-2 animate-fade-in">
                  <CheckCircle size={16} />
                  <span>Notisi imepakuliwa kwa urahisi kwenye kifaa chako! Angalia Downloads folder lako.</span>
                </div>
              )}

              {/* Core Content explanation */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-1.5">
                  <Award size={16} className="text-amber-500" />
                  Muhtasari wa Mada (Summary)
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-2xl font-medium">
                  {selectedTopic.content}
                </p>
              </div>

              {/* Syllabus Subtopics bulletpoints */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase">Mada Ndogo Zinazofundishwa (Syllabus Areas)</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedTopic.subtopics.map((sub, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-cyan-200 transition-all text-xs font-semibold text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                      <span className="truncate">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Notebook Preview (Text block representation) */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm uppercase flex items-center gap-1.5">
                  <FileText size={16} className="text-cyan-600" />
                  Kijitabu cha Notisi (Notebook Preview)
                </h4>
                <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl p-5 sm:p-6 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed shadow-inner max-h-[350px] overflow-y-auto">
                  {selectedTopic.notesSample}
                </div>
              </div>

              {/* Footer Note */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400 font-semibold">
                <span>Nyenzo: Free Education Initiative</span>
                <span>Id: LUPA-NOT-{(openSubject || 'S').substring(0, 3).toUpperCase()}-1</span>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
              <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mb-2">
                <BookOpen size={32} className="stroke-[1.5]" />
              </div>
              <h3 className="font-display font-extrabold text-slate-900 text-lg uppercase">Anza Kusoma Notisi Zetu</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-medium">
                Tafadhali chagua ngazi ya shule, kisha chagua somo lako mpendwa na mada katika orodha ya upande wa kushoto ili kufungua kijitabu chako cha masomo.
              </p>
              <button 
                onClick={() => setOpenLevel('olevel')}
                className="mt-2 py-2 px-5 text-xs font-bold bg-slate-950 text-white hover:bg-slate-800 transition-all rounded-xl"
              >
                FUNGUA KINDA CHETU
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
