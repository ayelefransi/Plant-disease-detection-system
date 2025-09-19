"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Leaf, Download, TrendingUp, Activity, Target, BarChart3, PieChart as PieChartIcon, Eye, Filter, Home, Layers, FileText, Settings, HelpCircle } from "lucide-react";
import Link from "next/link";

// ---- Types & Mock ----

type Row = {
  predicted_disease: string;
  confidence_score: number; // 0..1
  created_at: string; // ISO
};

const mockData: Row[] = [
  { predicted_disease: "Early Blight (Potato)", confidence_score: 0.94, created_at: "2025-01-15T10:30:00Z" },
  { predicted_disease: "Late Blight (Tomato)", confidence_score: 0.87, created_at: "2025-01-14T14:22:00Z" },
  { predicted_disease: "Leaf Spot (Pepper)", confidence_score: 0.91, created_at: "2025-01-13T09:15:00Z" },
  { predicted_disease: "Early Blight (Tomato)", confidence_score: 0.89, created_at: "2025-01-12T16:45:00Z" },
  { predicted_disease: "Bacterial Spot (Tomato)", confidence_score: 0.76, created_at: "2025-01-11T11:20:00Z" },
  { predicted_disease: "Healthy", confidence_score: 0.98, created_at: "2025-01-10T13:30:00Z" },
  { predicted_disease: "Mosaic Virus (Pepper)", confidence_score: 0.82, created_at: "2025-01-09T08:45:00Z" },
  { predicted_disease: "Late Blight (Potato)", confidence_score: 0.85, created_at: "2025-01-08T15:10:00Z" },
];

// ---- Simple styles (no motion dependencies) ----

// ---- Component ----

export default function PlantDiseaseAnalytics({ serverData }: { serverData?: Row[] }) {
  const [localData, setLocalData] = useState<Row[]>(mockData);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [activeChart, setActiveChart] = useState<"bar" | "pie" | "radar" | "trend">("bar");
  const [isExporting, setIsExporting] = useState(false);

  // Export helpers (SVG → PNG)
  const exportChartAsPng = async (container: React.RefObject<HTMLDivElement | null>, filename: string) => {
    try {
      const root = container.current;
      if (!root) return;
      const svg = root.querySelector('svg');
      if (!svg) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      const bbox = (svg as SVGElement).getBoundingClientRect();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(bbox.width));
      canvas.height = Math.max(1, Math.floor(bbox.height));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background') || '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.warn('Export failed', e);
    }
  };

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage?.getItem("predictions") : null;
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        const mapped: Row[] = parsed.map((p) => ({
          predicted_disease: p.predicted_disease,
          confidence_score: Number(p.confidence_score) || 0,
          created_at: p.created_at,
        }));
        setLocalData(mapped);
      }
    } catch {}
  }, []);

  const rows = useMemo(() => (serverData?.length ? serverData : localData), [serverData, localData]);

  const filtered = useMemo(() => {
    if (range === "all") return rows;
    const now = Date.now();
    const windowDays = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const cutoff = now - windowDays * 24 * 60 * 60 * 1000;
    return rows.filter((r) => new Date(r.created_at).getTime() >= cutoff);
  }, [rows, range]);

  const diseaseCounts = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(r.predicted_disease, (map.get(r.predicted_disease) || 0) + 1));
    return map;
  }, [filtered]);

  const chartData = useMemo(() => {
    const labels = Array.from(diseaseCounts.keys());
    return labels.map((disease, index) => {
      const entries = filtered.filter((r) => r.predicted_disease === disease);
      const avg = entries.reduce((s, r) => s + (Number(r.confidence_score) || 0), 0) / (entries.length || 1);
      return {
        name: disease.length > 18 ? disease.slice(0, 18) + "…" : disease,
      fullName: disease,
      value: diseaseCounts.get(disease) || 0,
        confidence: avg * 100,
        color: `hsl(${(index * 47) % 360}, 45%, 45%)`,
      };
    });
  }, [diseaseCounts, filtered]);

  const timeSeriesData = useMemo(() => {
    const grouped = new Map<string, number>();
    const sorted = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    sorted.forEach((r) => {
      const date = new Date(r.created_at).toLocaleDateString();
      grouped.set(date, (grouped.get(date) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([date, count]) => ({ date, count }));
  }, [filtered]);

  const radarData = useMemo(() => chartData.slice(0, 6).map((i) => ({ disease: i.name, detections: i.value, confidence: i.confidence })), [chartData]);

  const total = filtered.length;
  const unique = diseaseCounts.size;
  const avgConfidence = filtered.length
    ? parseFloat(((filtered.reduce((s, r) => s + (Number(r.confidence_score) || 0), 0) / filtered.length) * 100).toFixed(1))
    : 0;
  const highConfidenceCount = filtered.filter((r) => r.confidence_score > 0.9).length;

  async function handleExport(type: string) {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 250));
    setIsExporting(false);
  }

  // Refs for export
  const lineRef = useRef<HTMLDivElement | null>(null);
  const trendRef = useRef<HTMLDivElement | null>(null);
  const radarRef = useRef<HTMLDivElement | null>(null);
  const donutRef = useRef<HTMLDivElement | null>(null);

  // ---- UI pieces ----

  const KPICard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <div className="relative group rounded-2xl border border-border bg-card p-5 shadow-plant transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 rounded-xl bg-primary/10 text-primary border border-border">
          <Icon className="w-6 h-6" />
          </div>
          {trend && (
          <div className="flex items-center text-primary text-sm">
            <span className="mr-1">+{trend}%</span>
            <TrendingUp className="w-4 h-4" />
            </div>
          )}
        </div>
      <div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="text-sm text-foreground/70">{title}</p>
        {subtitle && <p className="text-xs text-foreground/60 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const ChartCard = ({ title, children, onExport, isActive, onClick }: any) => (
    <div className={`relative rounded-2xl border border-border bg-card p-6 shadow-plant transition-transform hover:-translate-y-0.5 ${isActive ? "ring-1 ring-primary/30" : ""}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-primary" /> {title}
        </h3>
        <button
            onClick={(e) => {
            e.stopPropagation();
            onExport();
            }}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-2 shadow-plant"
          >
          <Download className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} /> Export
        </button>
        </div>
        {children}
      </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md p-2 shadow-plant">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${String(entry.dataKey).includes("confidence") ? "%" : ""}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex gap-4">
      {/* Modern vertical navbar */}
      <aside className="hidden md:flex flex-col gap-1 w-60 sticky top-4 h-max rounded-2xl bg-card border border-border shadow-plant p-4">
        <div className="text-sm font-semibold mb-2">Navigate</div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><Home className="w-4 h-4 text-primary" /> Home</Link>
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><BarChart3 className="w-4 h-4 text-primary" /> Dashboard</Link>
        <Link href="/dashboard/insights" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><PieChartIcon className="w-4 h-4 text-primary" /> Insights</Link>
        <Link href="/dashboard/crop" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><Layers className="w-4 h-4 text-primary" /> Crop Health</Link>
        <Link href="/dashboard/reports" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><FileText className="w-4 h-4 text-primary" /> Reports</Link>
        <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><Settings className="w-4 h-4 text-primary" /> Settings</Link>
        <Link href="/dashboard/help" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"><HelpCircle className="w-4 h-4 text-primary" /> Help</Link>
      </aside>

      <main className="w-full p-0 md:p-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Plant Disease AI Analytics</h1>
            <p className="text-sm text-foreground/70 mt-1">Real-time detection insights with a futuristic, minimalist UI.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                className="rounded-full border border-border px-4 py-2 w-72 md:w-80 bg-card shadow-plant"
                placeholder="Search detections, crops or fields..."
              />
              <div className="absolute right-3 top-2 text-primary">
                <Filter className="w-4 h-4" />
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              {["7d", "30d", "90d", "all"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r as any)}
                  className={`px-3 py-2 rounded-lg border text-sm ${range === r ? "bg-primary text-primary-foreground border-transparent" : "bg-card border-border"}`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <KPICard title="Detected Today" value={total} subtitle="Scans processed" icon={Activity} trend={12} />
          <KPICard title="Healthy Scans" value={rows.filter(r => r.predicted_disease === 'Healthy').length} subtitle="No disease detected" icon={Target} trend={5} />
          <KPICard title="Avg Confidence" value={`${avgConfidence}%`} subtitle="Model confidence" icon={TrendingUp} trend={8} />
          <KPICard title="Most Common" value={chartData[0]?.fullName ?? '—'} subtitle="Top detected" icon={Leaf} trend={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
              {activeChart === "bar" && (
              <div>
                  <ChartCard title="Disease Distribution (Line)" onExport={() => exportChartAsPng(lineRef, "disease-line.png")} isActive={activeChart === "bar"}>
                    <div ref={lineRef}>
                    <ResponsiveContainer width="100%" height={360}>
                      <LineChart data={chartData} margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="confLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--chart-4)" />
                            <stop offset="100%" stopColor="var(--primary)" />
                          </linearGradient>
                          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" stroke="var(--foreground)" fontSize={12} angle={-20} textAnchor="end" tickMargin={8} />
                        <YAxis yAxisId="left" stroke="var(--foreground)" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--foreground)" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        {/* Value series with subtle area fill and glow */}
                        <Area yAxisId="left" type="monotone" dataKey="value" stroke="transparent" fill="url(#lineFill)" />
                        <Line yAxisId="left" type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3.5} dot={{ r: 0 }} activeDot={{ r: 4 }} />
                        {/* Confidence series as gradient stroke, dashed */}
                        <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="url(#confLine)" strokeWidth={2} strokeDasharray="6 6" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </ChartCard>
              </div>
              )}

              {activeChart === "trend" && (
              <div>
                  <ChartCard title="Detections Over Time" onExport={() => exportChartAsPng(trendRef, "detections-trend.png")} isActive={activeChart === "trend"}>
                    <div ref={trendRef}>
                    <ResponsiveContainer width="100%" height={360}>
                      <AreaChart data={timeSeriesData} margin={{ left: -10 }}>
                        <defs>
                          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.06} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="5 5" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--foreground)" fontSize={12} />
                        <YAxis stroke="var(--foreground)" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fill="url(#areaG)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    </div>
                  </ChartCard>
              </div>
              )}

              {activeChart === "radar" && (
              <div>
                  <ChartCard title="Multi‑Dimensional" onExport={() => exportChartAsPng(radarRef, "multi-dimensional.png")} isActive={activeChart === "radar"}>
                    <div ref={radarRef}>
                    <ResponsiveContainer width="100%" height={360}>
                      <RadarChart data={radarData} outerRadius={120}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="disease" tick={{ fill: "var(--foreground)", fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fill: "var(--foreground)", fontSize: 10 }} />
                        <Radar name="Detections" dataKey="detections" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.22} strokeWidth={2} />
                        <Radar name="Confidence" dataKey="confidence" stroke="var(--chart-4)" fill="var(--chart-4)" fillOpacity={0.12} strokeWidth={2} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                    </div>
                  </ChartCard>
              </div>
              )}
          </div>

          <div>
            <ChartCard title="Disease Share (Donut)" onExport={() => exportChartAsPng(donutRef, "disease-share.png")} isActive={false}>
              <div ref={donutRef}>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const d = payload[0].payload as any;
                        return (
                          <div className="bg-card border border-border rounded-md p-2 shadow-plant">
                            <p className="text-foreground font-medium">{d.fullName}</p>
                            <p className="text-sm text-foreground/70">Count: {d.value}</p>
                            <p className="text-sm text-foreground/70">Confidence: {d.confidence.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {chartData.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div style={{ background: c.color }} className="w-3 h-3 rounded" />
                    <div>
                      <div className="text-foreground">{c.fullName}</div>
                      <div className="text-xs text-foreground/70">{c.value} detections</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-plant">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-primary" /> Recent Detections
          </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {filtered.slice(0, 12).map((row, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:shadow-plant transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{row.predicted_disease}</div>
                      <div className="text-xs text-foreground/70">{new Date(row.created_at).toLocaleString()}</div>
                    </div>
                </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    row.confidence_score > 0.9 
                          ? "bg-primary/10 text-primary border-transparent"
                      : row.confidence_score > 0.8 
                          ? "bg-[color:var(--chart-4)]/20 text-foreground border-transparent"
                          : "bg-amber-100 text-amber-800 border-transparent"
                      }`}
                    >
                    {(row.confidence_score * 100).toFixed(1)}%
                  </span>
                    <button className="px-3 py-1 text-xs rounded bg-primary text-primary-foreground">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-plant">
            <h3 className="text-lg font-semibold text-foreground mb-4">Crop Health Overview</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold">{Math.round((rows.filter(r=>r.predicted_disease!=='Healthy').length / Math.max(1, rows.length)) * 100)}%</div>
                <div className="text-sm text-foreground/70">Plants at risk</div>
                <div className="mt-4 text-sm text-foreground/80">Recommendations: inspect plots A3, B1; apply fungicide to tomatoes.</div>
              </div>
              <div className="w-36 h-36 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-16 h-16 text-primary" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="text-sm">
                <div className="text-xs text-emerald-700/70">Total scans</div>
                <div className="font-semibold">{rows.length}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs text-emerald-700/70">High confidence</div>
                <div className="font-semibold">{highConfidenceCount}</div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8">
          <div className="rounded-2xl border border-border bg-card p-6 text-foreground shadow-plant">
            <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
              <div>
                <h4 className="text-lg font-semibold">Share insights with your team</h4>
                <p className="text-foreground/70">Export visualizations and collaborate for rapid intervention.</p>
              </div>
              <button onClick={() => handleExport("dashboard")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground shadow-plant hover:opacity-90 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Dashboard
              </button>
            </div>
      </div>
        </footer>
      </main>
    </div>
  );
}
