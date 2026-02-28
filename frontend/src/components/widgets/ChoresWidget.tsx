"use client";

import React, { useState, useEffect } from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";
import { CONFIG } from "@/lib/config";
import { CheckSquare } from "lucide-react";

export function ChoresWidget({ config, isEditing }: WidgetProps) {
    const [data, setData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChores = async () => {
            try {
                const response = await fetch(`${CONFIG.CHORE_CHART_URL}/api/chores`);
                if (!response.ok) throw new Error('Chores API Failed');
                const chores = await response.json();
                setData(chores.slice(0, 5));
            } catch (err) {
                console.error("Error fetching chores:", err);
                setError("Sync Error");
            }
        };
        fetchChores();
    }, []);

    if (error) {
        return (
            <div className="h-full flex flex-col justify-center items-center text-neon-red p-4 border border-neon-red/30 rounded-xl bg-black/40">
                <CheckSquare size={32} className="mb-2 opacity-50" />
                <div className="font-bold">{error}</div>
                <div className="text-[0.8rem] opacity-70 text-center mt-2">Check API at {CONFIG.CHORE_CHART_URL}</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <h2 className="flex items-center gap-2 text-neon-yellow font-display text-[1.05rem] border-b border-neon-yellow/30 pb-2 mb-3 uppercase tracking-wider">
                <CheckSquare size={18} /> Chores
            </h2>
            <div className="flex-1 overflow-y-auto pr-2">
                {data.length === 0 ? (
                    <div className="text-text-dim text-center mt-4">No active chores</div>
                ) : (
                    <ul className="flex flex-col m-0 p-0">
                        {data.map((chore, idx) => {
                            let pointColor = 'border-white/30 text-white/70 shadow-none';
                            if (chore.points >= 100) pointColor = 'border-neon-orange text-neon-orange shadow-[0_0_5px_rgba(255,153,0,0.5)]';
                            else if (chore.points >= 50) pointColor = 'border-neon-yellow text-neon-yellow shadow-[0_0_5px_rgba(255,230,0,0.5)]';

                            return (
                                <li key={idx} className={`flex justify-between items-center py-2.5 border-b border-white/5 ${idx === data.length - 1 ? 'border-b-0' : ''}`}>
                                    <div className="flex flex-col">
                                        <span className="text-text-color">{chore.title}</span>
                                        <span className="text-[1.05rem] text-text-dim line-clamp-1">{chore.description || ''}</span>
                                    </div>
                                    <span className={`border px-2 py-0.5 rounded font-bold min-w-[40px] text-center ${pointColor}`}>
                                        {chore.points}
                                    </span>
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
    type: "chores-list",
    name: "Daily Chores",
    description: "Displays the highest value chores remaining on your chore chart.",
    defaultWidth: 1,
    defaultHeight: 1,
    component: ChoresWidget,
});
