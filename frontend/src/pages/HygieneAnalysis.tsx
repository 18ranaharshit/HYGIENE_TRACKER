import { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HygieneScoreWidget from '@/components/dashboard/HygieneScoreWidget';
import { analyzeHygiene, getLatestReport } from '@/services/aiService';
import { getToilets } from '@/services/toiletService';
import { fileToBase64, formatDate } from '@/utils/formatters';
import type { Toilet, AIReport } from '@/types';
import toast from 'react-hot-toast';

const riskVariant: Record<string, 'green' | 'amber' | 'red'> = {
  low: 'green', medium: 'amber', high: 'red', critical: 'red',
};

/**
 * HygieneAnalysis — AI-powered hygiene scorer with photo upload, score meter,
 * issue cards, recommendations, and historical reports accordion.
 */
export default function HygieneAnalysis() {
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getToilets().then(p => setToilets(p.data)); }, []);

  const handlePhotoChange = (file: File) => {
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const runAnalysis = async () => {
    if (!selectedId) { toast.error('Please select a toilet first'); return; }
    setIsAnalyzing(true);
    try {
      const base64 = photo ? await fileToBase64(photo) : undefined;
      const result = await analyzeHygiene(selectedId, base64);
      setReport(result);
      toast.success('AI analysis complete!');
    } catch { toast.error('Analysis failed. Please try again.'); }
    finally { setIsAnalyzing(false); }
  };

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    setReport(null);
    if (id) { const r = await getLatestReport(id); if (r) setReport(r); }
  };

  return (
    <div className="flex flex-col h-full">
      <Navbar title="AI Hygiene Analysis" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Controls */}
          <div className="card space-y-4">
            <h2 className="font-heading font-semibold text-slate-100 border-b border-surface-highest pb-3">Run Analysis</h2>
            <div>
              <label className="label" htmlFor="toilet-sel">Select Facility</label>
              <select id="toilet-sel" className="input" value={selectedId} onChange={e => void handleSelect(e.target.value)}>
                <option value="">Choose a toilet...</option>
                {toilets.map(t => <option key={t._id} value={t._id}>{t.name} — {t.address}</option>)}
              </select>
            </div>
            {/* Dropzone */}
            <div>
              <label className="label">Photo (Optional — enables Vision AI)</label>
              <div onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePhotoChange(f); }}
                onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-surface-highest rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="h-32 w-auto rounded-lg object-cover" />
                    <button onClick={e => { e.stopPropagation(); setPhoto(null); setPhotoPreview(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <><Upload size={28} className="text-slate-500" />
                    <p className="text-sm text-slate-400">Drag & drop, or <span className="text-primary">browse</span></p></>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoChange(f); }} />
              </div>
            </div>
            <Button onClick={() => void runAnalysis()} isLoading={isAnalyzing} className="w-full justify-center py-3">
              <Zap size={16} />{isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </Button>
          </div>

          {/* Results */}
          {report && (
            <div className="space-y-5 animate-fade-in">
              <div className="card flex flex-col md:flex-row items-center gap-8">
                <HygieneScoreWidget score={report.score} size={180} label="AI Hygiene Score" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="label mb-0">Risk Level</span>
                    <Badge variant={riskVariant[report.riskLevel]} className="text-sm px-3 py-1">{report.riskLevel.toUpperCase()}</Badge>
                  </div>
                  <p className="text-sm text-slate-400">Analyzed on {formatDate(report.createdAt, 'long')}</p>
                  <button onClick={() => window.print()} className="btn-secondary text-xs py-1.5">Export PDF Report</button>
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="font-heading font-semibold text-slate-100 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" /> Issues Detected
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                      <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-300">{issue}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card space-y-3">
                <h3 className="font-heading font-semibold text-slate-100 flex items-center gap-2">
                  <CheckCircle size={16} className="text-primary" /> AI Recommendations
                </h3>
                {report.recommendations.map((rec, i) => (
                  <label key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-high cursor-pointer">
                    <input type="checkbox" className="mt-0.5 accent-primary" />
                    <span className="text-sm text-slate-300">{rec}</span>
                  </label>
                ))}
              </div>

              <div className="card">
                <button onClick={() => setShowHistory(h => !h)} className="w-full flex items-center justify-between text-sm font-semibold text-slate-300">
                  Historical Reports {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showHistory && <p className="mt-4 text-sm text-slate-500 text-center py-4">No previous reports found.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
