"use client";

import React, { useState } from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";
import { Printer } from "lucide-react";

export function OctopiWidget({ config, isEditing }: WidgetProps) {
    // Using Dummy Data as originally implemented in script.js
    const [status, setStatus] = useState<any>({
        state: "Printing",
        file: "iron_man_mask.gcode",
        progress: 68,
        timeLeft: "45m"
    });

    let statusColor = "bg-neon-green text-neon-green shadow-[0_0_8px_var(--neon-green)]";
    if (status.state === "Printing") statusColor = "bg-neon-orange text-neon-orange shadow-[0_0_8px_var(--neon-orange)] animate-pulse";
    if (status.state === "Offline") statusColor = "bg-neon-red text-neon-red shadow-[0_0_8px_var(--neon-red)]";

    return (
        <div className="flex flex-col h-full">
            <h2 className="flex items-center gap-2 text-neon-orange font-display text-[1.05rem] border-b border-neon-orange/30 pb-2 mb-3 uppercase tracking-wider">
                <Printer size={18} /> OctoPi Status
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 pb-2">
                <div className="flex items-center mb-4 mt-2">
                    <div className={`w-3 h-3 rounded-full mr-3 ${statusColor}`}></div>
                    <span className="text-[1.2rem] font-bold text-text-color">{status.state}</span>
                </div>
                <div className="mb-2 text-text-color text-[1.05rem] truncate">{status.file}</div>
                <div className="text-[0.95rem] text-text-dim flex justify-between">
                    <span>{status.progress}%</span>
                    <span>{status.timeLeft} left</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full mt-3 overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-neon-orange transition-all duration-1000 shadow-[0_0_10px_var(--neon-orange)]"
                        style={{ width: `${status.progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

registerWidget({
    type: "octopi-status",
    name: "3D Printer Status",
    description: "Monitors the connected OctoPi instance for print progress and state.",
    defaultWidth: 1,
    defaultHeight: 1,
    component: OctopiWidget,
});
