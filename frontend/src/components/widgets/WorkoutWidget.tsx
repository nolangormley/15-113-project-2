"use client";

import React, { useState, useEffect } from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";
import { CONFIG } from "@/lib/config";
import { Activity, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function WorkoutWidget({ config, isEditing }: WidgetProps) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                const [recommendRes, statusRes] = await Promise.all([
                    fetch(`${CONFIG.STRAVA_API_URL}/recommend/${CONFIG.STRAVA_USER_ID}`),
                    fetch(`${CONFIG.STRAVA_API_URL}/status/${CONFIG.STRAVA_USER_ID}`)
                ]);

                if (!recommendRes.ok || !statusRes.ok) {
                    throw new Error('API Sync Failed');
                }

                const recommendData = await recommendRes.json();
                const statusData = await statusRes.json();
                setData({ recommend: recommendData, status: statusData });
            } catch (err) {
                console.error("Error fetching workout:", err);
                setError("Sync Error");
            }
        };
        fetchWorkout();
    }, []);

    if (error) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-neon-red p-4 border border-neon-red/30 rounded-xl bg-black/40">
                <Activity size={32} className="mb-2 opacity-50" />
                <div className="font-bold">{error}</div>
                <div className="text-xs opacity-70 text-center mt-2">Check API at {CONFIG.STRAVA_API_URL}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-full flex items-center justify-center text-neon-cyan animate-pulse">
                Loading Workout Data...
            </div>
        );
    }

    const { workout } = data.recommend;
    const category = data.recommend.recommended_category || 'General';
    const ctl = data.status.fitness_ctl || 0;
    const atl = data.status.fatigue_atl || 0;
    const tsb = data.status.form_tsb || 0;
    const acwr = data.status.acwr || 0; // ACWR metric from API
    const vo2Max = data.recommend.latest_vo2_max ?? data.status.vo2_max ?? data.status.vo2max ?? data.status.VO2_max;

    let statusColor = 'var(--neon-cyan)';
    if (tsb > 5) { statusColor = 'var(--neon-green)'; }
    else if (tsb < -20) { statusColor = 'var(--neon-red)'; }
    else if (tsb < -10) { statusColor = 'var(--neon-orange)'; }
    else { statusColor = 'var(--neon-magenta)'; }

    let vo2Color = 'var(--neon-magenta)';
    if (vo2Max !== undefined && vo2Max !== null) {
        if (vo2Max < 40) { vo2Color = 'var(--neon-red)'; }
        else if (vo2Max < 45) { vo2Color = 'var(--neon-orange)'; }
        else if (vo2Max < 50) { vo2Color = 'var(--neon-yellow)'; }
        else if (vo2Max < 55) { vo2Color = 'var(--neon-green)'; }
        else { vo2Color = 'var(--neon-cyan)'; }
    }

    let acwrColor = 'var(--neon-magenta)';
    if (acwr > 1.3) { acwrColor = 'var(--neon-red)'; } // Risking injury
    else if (acwr >= 0.8 && acwr <= 1.3) { acwrColor = 'var(--neon-green)'; } // Sweet spot
    else if (acwr > 0) { acwrColor = 'var(--neon-yellow)'; } // Decreasing fitness

    const createBar = (label: string, value: number, max: number, color: string) => {
        let percentage = Math.max(0, Math.min((value / max) * 100, 100));
        return (
            <div className="mb-1.5 flex flex-col justify-center">
                <div className="flex justify-between text-[0.8rem] mb-0.5">
                    <span className="opacity-80 leading-none">{label}</span>
                    <span className="font-bold leading-none" style={{ color }}>{typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : value}</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full relative cursor-pointer group" onClick={() => !isEditing && setShowOverlay(true)}>
            <h2 className="flex justify-between items-center text-neon-green font-display text-[1rem] border-b border-neon-green/30 pb-1 mb-1.5 uppercase tracking-wider shrink-0">
                <div className="flex items-center gap-2"><Activity size={16} /> Training Status</div>
            </h2>

            <div className="flex-1 overflow-hidden flex flex-col gap-1.5">
                <div className="border-b border-white/10 pb-1 hover:bg-white/5 transition-colors -mx-2 px-2 rounded-lg cursor-pointer shrink-0">
                    <div className="text-[0.85rem] font-bold uppercase mb-0.5" style={{ color: statusColor }}>{category} Focus</div>
                    <div className="text-[1rem] leading-tight text-text-color font-bold whitespace-nowrap overflow-hidden text-ellipsis">{workout?.name || "Rest Day"}</div>
                </div>

                <div className="grid grid-cols-[1.5fr_1fr] gap-3 flex-1 overflow-hidden">
                    <div className="flex flex-col justify-evenly">
                        {createBar('Fitness (CTL)', ctl, 160, 'var(--neon-cyan)')}
                        {createBar('Fatigue (ATL)', atl, 160, 'var(--neon-magenta)')}
                    </div>

                    <div className="flex flex-col gap-1.5 justify-center">
                        <div className="flex flex-col items-center justify-center bg-black/20 rounded-lg p-1.5 shadow-sm flex-1 min-h-0" style={{ border: `1px solid ${acwrColor}` }}>
                            <div className="text-[0.65rem] opacity-70 uppercase tracking-widest leading-none mb-1">ACWR</div>
                            <div className="text-[1.4rem] leading-none font-bold" style={{ color: acwrColor, textShadow: `0 0 10px ${acwrColor}` }}>
                                {typeof acwr === 'number' && Number.isFinite(acwr) ? acwr.toFixed(2) : acwr}
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-black/20 rounded-lg p-1.5 shadow-sm flex-1 min-h-0" style={{ border: `1px solid ${statusColor}` }}>
                            <div className="text-[0.65rem] opacity-70 uppercase tracking-widest leading-none mb-1">Form</div>
                            <div className="text-[1.4rem] leading-none font-bold" style={{ color: statusColor, textShadow: `0 0 10px ${statusColor}` }}>
                                {tsb > 0 ? '+' : ''}{tsb}
                            </div>
                        </div>
                        {vo2Max !== undefined && vo2Max !== null && (
                            <div className="flex flex-col items-center justify-center bg-black/20 rounded-lg p-1.5 shadow-sm flex-1 min-h-0" style={{ border: `1px solid ${vo2Color}` }}>
                                <div className="text-[0.65rem] opacity-70 uppercase tracking-widest leading-none mb-1">VO2 Max</div>
                                <div className="text-[1.4rem] leading-none font-bold" style={{ color: vo2Color, textShadow: `0 0 10px ${vo2Color}` }}>
                                    {typeof vo2Max === 'number' ? vo2Max.toFixed(1) : vo2Max}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showOverlay && typeof window !== "undefined" && window.document.body ? (
                require("react-dom").createPortal(
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-default" onClick={(e) => { e.stopPropagation(); setShowOverlay(false); }}>
                        <div className="border border-neon-cyan shadow-[0_0_30px_rgba(0,243,255,0.3)] rounded-xl max-w-[95vw] w-full p-6 flex flex-col h-[95vh]" style={{ background: 'var(--tile-bg)', backdropFilter: 'blur(12px)' }} onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-2xl shrink-0 font-display text-neon-cyan uppercase mb-4 border-b border-neon-cyan/30 pb-3 flex justify-between items-center gap-3">
                                <div className="flex items-center gap-3"><Activity /> {workout?.name || "Daily Protocol"}</div>
                                <button onClick={() => setShowOverlay(false)} className="text-white/50 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </h3>

                            <div className="flex-1 overflow-hidden flex flex-row gap-6">
                                <div className="flex-1 text-text-color text-[1.05rem] leading-relaxed overflow-y-auto pr-2" dangerouslySetInnerHTML={{ __html: data.recommend.ai_reasoning || data.status.ai_insight || workout?.description || "No details provided." }} />

                                <div className="flex-1 h-full border-l border-neon-cyan/30 pl-4 flex flex-col">
                                    <h4 className="text-neon-cyan mb-2 uppercase tracking-widest text-sm font-bold shrink-0">Historical Training Load</h4>
                                    <div className="flex-1 relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.status.history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                                <XAxis dataKey="date" stroke="#a0a0a0" tick={{ fontSize: 12 }} tickFormatter={(tick: string) => tick?.substring?.(5)} />
                                                <YAxis yAxisId="left" stroke="#a0a0a0" tick={{ fontSize: 12 }} />
                                                <YAxis yAxisId="right" orientation="right" stroke="#a0a0a0" tick={{ fontSize: 12 }} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'rgba(20,20,40,0.9)', border: '1px solid var(--neon-cyan)', borderRadius: '8px' }}
                                                    itemStyle={{ fontWeight: 'bold' }}
                                                />
                                                <Legend verticalAlign="top" height={36} />
                                                <Line yAxisId="left" type="monotone" dataKey="fitness" name="Fitness (CTL)" stroke="var(--neon-cyan)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                <Line yAxisId="left" type="monotone" dataKey="fatigue" name="Fatigue (ATL)" stroke="var(--neon-magenta)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                                <Line yAxisId="right" type="monotone" dataKey="form" name="Form (TSB)" stroke="var(--neon-yellow)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>, window.document.body as HTMLElement)
            ) : null}
        </div>
    );
}

// Automatically register this widget when the file is imported
registerWidget({
    type: "workout-status",
    name: "Training Status",
    description: "Displays your current Form, Fitness, Fatigue, VO2 Max, and an AI-generated daily workout recommendation.",
    defaultWidth: 1,
    defaultHeight: 1,
    component: WorkoutWidget,
});
