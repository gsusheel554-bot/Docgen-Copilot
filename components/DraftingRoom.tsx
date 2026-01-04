
import React, { useState } from 'react';
import { generateExecutiveSummary } from '../services/gemini';
import { ExecutiveSummary, Metric, BulletPoint } from '../types';
import { ICONS } from '../constants';

type SourceContext = {
  title: string;
  snippet: string;
  page: number | string;
};

const DraftingRoom: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [activeSource, setActiveSource] = useState<SourceContext | null>(null);

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      // Inject page markers so Gemini can track page numbers
      fullText += `[PAGE ${i}]\n${pageText}\n`;
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsReading(true);
    setSummary(null);
    setActiveSource(null);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const extractedText = await extractTextFromPDF(arrayBuffer);
        setFileContent(extractedText);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFileContent(ev.target?.result as string);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      console.error("Error reading file:", err);
      alert("Failed to read file content. Ensure it's a valid text or PDF file.");
    } finally {
      setIsReading(false);
    }
  };

  const handleGenerate = async () => {
    if (!fileContent || fileContent.trim().length < 10) {
      alert("The document appears to be empty or contains too little text to analyze.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await generateExecutiveSummary(fileContent);
      setSummary(result);
    } catch (e) {
      console.error(e);
      alert("Error generating summary. Please try again with a different document.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const markdown = `# Executive Summary: ${fileName}\n\n## Key Highlights\n${summary.bullets.map(b => `- ${b.text} (Pg ${b.pageNumber})`).join('\n')}\n\n## Metrics\n| Label | Value | Confidence |\n|---|---|---|\n${summary.metrics.map(m => `| ${m.label} | ${m.value} | ${m.confidence} |`).join('\n')}\n\n## Risks\n${summary.risks.map(r => `### ${r.impact} Risk: ${r.description}\nMitigation: ${r.mitigation}`).join('\n\n')}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Summary_${fileName.replace(/\.[^/.]+$/, "")}.md`;
    a.click();
  };

  const setMetricSource = (m: Metric) => {
    setActiveSource({
      title: m.label,
      snippet: m.source,
      page: summary?.sourceReference || "Unknown"
    });
  };

  const setBulletSource = (b: BulletPoint) => {
    setActiveSource({
      title: "Executive Highlight",
      snippet: b.sourceSnippet,
      page: b.pageNumber
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">PDF/Memo Drafting Workspace</h2>
          <p className="text-slate-500 mt-1">AI-driven document transformation into structured executive drafts.</p>
        </div>
        {summary && (
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            <ICONS.Download />
            <span className="font-semibold text-sm">Export Draft</span>
          </button>
        )}
      </div>

      {!summary && !isAnalyzing ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="flex flex-col items-center">
            <ICONS.Upload />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload PDF Source Document</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm">
              Upload your PDF files to extract and summarize content using AI, complete with page-level references.
            </p>
            <input 
              type="file" 
              accept=".txt,.md,.pdf" 
              onChange={handleFileUpload}
              className="hidden" 
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-200 transition-all inline-block active:scale-95"
            >
              {isReading ? "Reading PDF..." : "Select Document"}
            </label>
            
            {fileContent && (
              <div className="mt-8 w-full max-w-lg animate-in fade-in slide-in-from-top-4">
                <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 border border-slate-200 overflow-hidden relative">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Context: {fileName}</p>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">Ready</span>
                  </div>
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed bg-white p-3 rounded border border-slate-100 italic">
                    {fileContent.substring(0, 1000)}...
                  </p>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isReading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span className="text-blue-400">✧</span>
                  <span>Analyze & Build Memo</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : isAnalyzing ? (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-r-4 border-transparent"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 font-black text-[10px] uppercase tracking-tighter">Parsing</div>
          </div>
          <p className="text-slate-900 font-bold text-xl">Drafting Copilot activated and is processing....</p>
          <p className="text-slate-400 text-sm mt-2">Extracting cross-page evidence and quantifying performance...</p>
        </div>
      ) : summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-8">
            {/* Highlights */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center uppercase tracking-wider">
                Executive Summary
              </h3>
              <ul className="space-y-6">
                {summary.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start group">
                    <span className="text-blue-500 font-black mr-3 mt-1.5 text-xs">0{idx + 1}</span>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {bullet.text}
                      <button 
                        onClick={() => setBulletSource(bullet)}
                        className="ml-2 inline-flex items-center text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest border border-slate-100 rounded px-1.5 py-0.5 hover:bg-blue-50 hover:border-blue-200"
                      >
                        [Pg {bullet.pageNumber}]
                      </button>
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Metrics Table */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center uppercase tracking-wider">
                Performance Extraction
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="pb-3 px-2">Metric Label</th>
                      <th className="pb-3 px-2">Value</th>
                      <th className="pb-3 px-2 text-center">Confidence</th>
                      <th className="pb-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {summary.metrics.map((metric, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-4 px-2 font-bold text-slate-900 text-sm">{metric.label}</td>
                        <td className="py-4 px-2">
                          <span className={`flex items-center font-black text-base ${metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-rose-600' : 'text-slate-700'}`}>
                            {metric.value}
                            {metric.trend === 'up' && <span className="ml-1 text-xs">↑</span>}
                            {metric.trend === 'down' && <span className="ml-1 text-xs">↓</span>}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${metric.confidence === 'Strong' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {metric.confidence}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button 
                            onClick={() => setMetricSource(metric)}
                            className="text-[10px] font-black text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded transition-all uppercase tracking-widest border border-blue-100"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Risks */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center uppercase tracking-wider">
                Risk Vectors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.risks.map((risk, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:border-rose-200 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${risk.impact === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {risk.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-2">{risk.description}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Mitigation Strategy</p>
                       <p className="text-xs text-slate-600 leading-relaxed italic">{risk.mitigation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Source Viewer */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl shadow-slate-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 border-b border-slate-800 pb-2 flex items-center">
                   <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                   Source Verification Engine
                </h4>
                
                {activeSource ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Context For</p>
                      <p className="text-sm font-bold text-white leading-tight">{activeSource.title}</p>
                    </div>
                    
                    <div className="bg-slate-800/50 p-5 rounded-xl font-mono text-[11px] leading-relaxed text-slate-300 border border-slate-700 italic relative">
                       <span className="absolute -top-2 left-4 px-2 bg-slate-900 text-[9px] font-black text-slate-500 border border-slate-700 rounded">RAW DATA</span>
                      "...{activeSource.snippet}..."
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                       <div>
                         <p className="text-[9px] text-slate-500 font-black uppercase">Ref Page</p>
                         <p className="text-lg font-black text-blue-400 text-[9px]">{activeSource.page}</p>
                       </div>
                       <button 
                        onClick={() => setActiveSource(null)}
                        className="py-2 px-4 bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-16 text-center text-slate-600">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                       <ICONS.Document />
                    </div>
                    <p className="text-xs font-bold leading-relaxed px-4 text-slate-400">
                      Click a <span className="text-blue-400 font-black">[Pg #]</span> or <span className="text-blue-400 font-black">Verify</span> to inspect the document lineage and raw data markers.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm">
                <h4 className="text-xs font-black text-slate-900 mb-3 uppercase tracking-widest">Report Controls</h4>
                <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">
                  The generated summary is indexed by page. Exporting will include these page references in your final Markdown report.
                </p>
                <button 
                   onClick={() => {
                     setSummary(null);
                     setFileContent("");
                     setFileName("");
                     setActiveSource(null);
                   }}
                   className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all uppercase tracking-[0.1em]"
                >
                  Clear Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftingRoom;
