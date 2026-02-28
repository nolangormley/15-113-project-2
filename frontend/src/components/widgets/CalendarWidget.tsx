"use client";

import React, { useState, useEffect } from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";
import { CONFIG } from "@/lib/config";
import { Calendar as CalendarIcon, Link as LinkIcon } from "lucide-react";

export function CalendarWidget({ config, isEditing }: WidgetProps) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const res = await fetch(`${CONFIG.CALENDAR_API_URL}/api/schedule/daily`, {
                    headers: { "Cache-Control": "no-cache" }
                });
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error("Error fetching calendar:", err);
                setError("API Sync Failed");
            } finally {
                setLoading(false);
            }
        };
        fetchCalendar();
    }, []);

    const handleLinkGoogle = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${CONFIG.CALENDAR_API_URL}/api/schedule/auth-url`);
            const urlData = await res.json();
            if (urlData.url) {
                window.location.href = urlData.url;
            }
        } catch (err) {
            console.error("Failed to get auth URL", err);
        }
    };

    if (error) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-neon-red p-4 border border-neon-red/30 rounded-xl bg-black/40">
                <CalendarIcon size={32} className="mb-2 opacity-50" />
                <div className="font-bold">{error}</div>
                <div className="text-[0.8rem] opacity-70 text-center mt-2">Check API at {CONFIG.CALENDAR_API_URL}</div>
            </div>
        );
    }

    if (loading) {
        return <div className="h-full flex items-center justify-center text-neon-magenta animate-pulse">Loading Calendar Data...</div>;
    }

    if (data?.message === 'NOT_AUTHENTICATED') {
        return (
            <div className="flex flex-col h-full">
                <h2 className="flex items-center gap-2 text-neon-magenta font-display text-[1.05rem] border-b border-neon-magenta/30 pb-2 mb-3 uppercase tracking-wider">
                    <CalendarIcon size={18} /> Schedule
                </h2>
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neon-magenta/40 rounded-lg bg-black/30 p-4">
                    <div className="text-[1.15rem] text-text-dim mb-4 text-center">Google Calendar not linked.</div>
                    <button onClick={handleLinkGoogle} onPointerDown={(e) => e.stopPropagation()} className="flex items-center gap-2 text-neon-magenta border border-neon-magenta/50 rounded-lg px-4 py-3 hover:bg-neon-magenta/10 transition-colors uppercase font-bold tracking-widest text-sm relative z-50">
                        <LinkIcon size={16} /> Link Google Account
                    </button>
                </div>
            </div>
        );
    }

    const events = data?.events || [];

    return (
        <div className="flex flex-col h-full">
            <h2 className="flex justify-between items-center text-neon-magenta font-display text-[1.05rem] border-b border-neon-magenta/30 pb-2 mb-3 uppercase tracking-wider">
                <div className="flex items-center gap-2"><CalendarIcon size={18} /> Schedule</div>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2">
                {events.length === 0 ? (
                    <div className="text-text-dim italic mt-2">No events scheduled.</div>
                ) : (
                    <ul className="flex flex-col m-0 p-0">
                        {events.map((event: any, i: number) => {
                            const start = new Date(event.start?.dateTime || event.start?.date);
                            const isPast = start < new Date();
                            const timeString = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                            return (
                                <li key={i} className={`flex justify-between items-center py-2.5 border-b border-white/5 ${isPast ? 'opacity-50' : 'opacity-100'} ${i === events.length - 1 ? 'border-b-0' : ''}`}>
                                    <div className="text-[1.05rem] text-text-color truncate mr-2">{event.summary || "Busy"}</div>
                                    <div className={`text-[0.95rem] min-w-[70px] text-right ${isPast ? 'text-text-dim' : 'text-neon-cyan font-bold drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]'}`}>
                                        {event.start?.dateTime ? timeString : "All Day"}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

registerWidget({
    type: "calendar-google",
    name: "Google Calendar",
    description: "Displays your daily agenda perfectly synced with your Google Account.",
    defaultWidth: 1,
    defaultHeight: 1,
    component: CalendarWidget,
});
