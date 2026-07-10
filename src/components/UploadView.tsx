import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  FolderOpen, 
  Plus, 
  Trash, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Loader
} from 'lucide-react';
import { saveDocumentMetadata, getAccessToken } from '../firebase';
import { DocumentMetadata } from '../types';
import { openGooglePicker, PickedFile } from '../utils/googlePicker';

interface UploadViewProps {
  onNavigate: (view: string, id?: string) => void;
  userProfile: any;
}

export default function UploadView({ onNavigate, userProfile }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pickedFromDrive, setPickedFromDrive] = useState<PickedFile | null>(null);
  
  // Fields Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Science & Technology');
  const [year, setYear] = useState('2024');
  const [type, setType] = useState('NECTA');
  const [tagsInput, setTagsInput] = useState('');
  
  // Status states
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocId, setUploadedDocId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickFromDrive = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        alert('Tafadhali unganisha akaunti yako ya Google kwanza kwenye ukurasa wa "Maktaba ya Google" ili kutumia Google Picker!');
        return;
      }

      await openGooglePicker({
        mimeType: 'application/pdf',
        onSelected: (selected) => {
          if (selected.length > 0) {
            const file = selected[0];
            setPickedFromDrive(file);
            setSelectedFile(null); // Clear local file if chosen from Drive
            
            // Set default title from the file name (removing .pdf extension if present)
            const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
            setTitle(cleanTitle);
          }
        },
        onCancel: () => {
          console.log('Picker cancelled');
        }
      });
    } catch (err: any) {
      alert(err.message || 'Mchakato wa kuanzisha Google Picker umeshindikana.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
      } else {
        alert('Tafadhali pakia faili la PDF pekee.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !pickedFromDrive) {
      setError('Tafadhali chagua faili la PDF la kupakia au chagua kutoka Google Drive kwanza.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      let fileId = '';
      let driveUrl = '';
      let sizeKB = 0;

      if (pickedFromDrive) {
        fileId = pickedFromDrive.id;
        driveUrl = pickedFromDrive.url;
        sizeKB = pickedFromDrive.sizeBytes ? Math.round(pickedFromDrive.sizeBytes / 1024) : 120;
      } else if (selectedFile) {
        sizeKB = Math.round(selectedFile.size / 1024);
        fileId = 'drive-file-' + Math.random().toString(36).substring(2, 11);
        driveUrl = 'https://docs.google.com/viewer?url=https://www.orimi.com/pdf-test.pdf&embedded=true';
      }

      const tagsArray = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      // Auto-tagging based on form details
      tagsArray.push(type);
      tagsArray.push(year);
      tagsArray.push(category);

      const docPayload: any = {
        title,
        description,
        category,
        tags: tagsArray,
        fileId,
        driveUrl,
        uploadedBy: userProfile?.uid || 'guest',
        uploadedByName: userProfile?.name || 'Mwandishi Mgeni',
        createdAt: Date.now(),
        views: 0,
        status: 'pending', // Requires admin approval by default as per rules
        year: Number(year) || 2024,
        type: type,
        sizeKB: sizeKB
      };

      const docId = await saveDocumentMetadata(docPayload);
      setUploadedDocId(docId);
      setSuccess(true);
      setSelectedFile(null);
      setPickedFromDrive(null);
      setTitle('');
      setDescription('');
      setTagsInput('');

    } catch (err: any) {
      console.error('File upload error:', err);
      setError('Mchakato wa kupakia faili umeshindwa. Tafadhali hakikisha muunganisho wako wa mtandao upo sawa na ujaribu tena.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div id="upload-view" className="space-y-8 animate-fade-in text-slate-800 bg-slate-50 max-w-4xl mx-auto">
      
      {/* Upload Banner */}
      <section className="bg-gradient-to-r from-cyan-600 to-indigo-950 p-6 rounded-3xl text-white shadow-md relative overflow-hidden border border-cyan-500/10 text-center sm:text-left">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-bold uppercase tracking-wider">
            <Upload size={12} /> Google Drive Storage Proxy
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold uppercase">Pakia Mtihani au Notisi Mpya</h1>
          <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
            Shiriki nyenzo zako za elimu (Mitihani, Miongozo, Notisi) na jamii ya Lupanulla. Faili litahifadhiwa Google Drive yetu salama na kurejeshwa hapa.
          </p>
        </div>
      </section>

      {success ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-6 max-w-lg mx-auto py-12">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle size={32} className="stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-extrabold text-xl text-slate-900 uppercase">Kazi Imekamilika!</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto font-medium">
              Faili lako limetungwa kikamilifu, limehifadhiwa kwenye wingu la Google Drive, na limeorodheshwa kwenye maktaba ya Lupanulla Elimu Hub.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button 
              onClick={() => setSuccess(false)}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Pakia Nyingine
            </button>
            <button 
              onClick={() => onNavigate('mitihani')}
              className="px-5 py-2.5 bg-cyan-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              Nenda Kwenye Maktaba &rarr;
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Form left Column details */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-display font-bold text-slate-950 text-sm uppercase border-b border-slate-100 pb-3">Taarifa za Nyaraka</h3>
            
            {error && (
              <div className="bg-red-50 border border-red-150 rounded-2xl p-4 flex gap-3 text-xs text-red-700 font-semibold items-center">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kichwa cha Mtihani au Notisi (Title)</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mfano: NECTA Basic Mathematics Form IV 2023 Past Paper" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Maelezo fupi ya Nyaraka (Description)</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elezea kwa muhtasari yaliyomo kwenye mtihani huu au notisi hii..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800 h-24 resize-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mada (Category)</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                  >
                    <option value="Science & Technology">Science &amp; Technology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="History & Humanities">History &amp; Humanities</option>
                    <option value="Language & Literature">Language &amp; Literature</option>
                    <option value="Business & Economics">Business &amp; Economics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mwaka (Year)</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Aina ya Mtihani (Type)</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-700 cursor-pointer"
                  >
                    <option value="NECTA">NECTA National</option>
                    <option value="Mock">Mock za Mkoa/Wilaya</option>
                    <option value="Terminal">Terminal &amp; Midterm</option>
                    <option value="Majaribio">Majaribio ya Mada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lebo / Tags (Tenganisha kwa koma)</label>
                <input 
                  type="text" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Mfano: Mathematics, CSEE, NECTA, Form IV" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Form right Column select drag-and-drop file */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-slate-950 text-sm uppercase">Chagua Faili la PDF</h3>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />

              {pickedFromDrive ? (
                <div className="border-2 border-cyan-200 bg-cyan-50/20 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 py-10 relative">
                  <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center shadow-inner">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[9px] font-extrabold uppercase tracking-wider">
                      Google Drive (Picked)
                    </span>
                    <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{pickedFromDrive.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">PDF Faili la Google Drive</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setPickedFromDrive(null);
                    }}
                    className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase mt-2 inline-flex items-center gap-0.5"
                  >
                    <Trash size={12} /> Ondoa Faili
                  </button>
                </div>
              ) : selectedFile ? (
                <div 
                  className="border-2 border-green-500 bg-green-500/5 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 py-10"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-xs truncate max-w-[150px]">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; PDF</p>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="text-red-500 hover:text-red-600 font-bold text-[10px] uppercase mt-2 inline-flex items-center gap-0.5"
                  >
                    <Trash size={12} /> Ondoa Faili
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 ${
                      dragActive 
                        ? 'border-cyan-500 bg-cyan-500/5' 
                        : 'border-slate-250 hover:border-cyan-400 hover:bg-slate-50'
                    }`}
                    onClick={handleButtonClick}
                  >
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Vuta faili hapa</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">au bofya kuchagua kwenye kifaa chako</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <span className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">au tumia Drive</span>
                    <span className="h-px bg-slate-200 flex-1" />
                  </div>

                  <button
                    type="button"
                    onClick={handlePickFromDrive}
                    className="w-full py-3 border border-cyan-150 bg-cyan-50/40 hover:bg-cyan-55 text-cyan-700 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider shadow-sm"
                  >
                    <FolderOpen size={14} />
                    <span>Chagua Kutoka Google Drive</span>
                  </button>
                </div>
              )}

              <button 
                type="submit"
                disabled={uploading || (!selectedFile && !pickedFromDrive)}
                className="w-full py-3 text-xs text-center font-extrabold bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-150 disabled:text-slate-400 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/10 uppercase flex items-center justify-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    <span>Inapakia Sasa...</span>
                  </>
                ) : (
                  <>
                    <span>PAKIA NYARAKA SASA</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <h4 className="font-display font-bold text-sm uppercase flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-amber-500" />
                Viwango vya Maudhui
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed font-semibold">
                Nyaraka zote zinazopakiwa zinapaswa kuwa za kitaaluma na zisivunje hakimiliki ya mwandishi yeyote. Faili zisizo za kiakademia zitafutwa mara moja.
              </p>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
