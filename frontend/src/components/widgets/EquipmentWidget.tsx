"use client";

import React from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";
import { Wrench } from "lucide-react";

export function EquipmentWidget({ config, isEditing }: WidgetProps) {
    // Dummy Data from original script.js
    const tasks = [
        { item: "HVAC Filter", status: "Overdue", due: "-2 days" },
        { item: "Water Filter", status: "Due Soon", due: "3 days" },
        { item: "Smoke Alarm", status: "OK", due: "25 days" }
    ];

    return (
        <div className="flex flex-col h-full">
            <h2 className="flex items-center gap-2 text-neon-red font-display text-[1.05rem] border-b border-neon-red/30 pb-2 mb-3 uppercase tracking-wider">
                <Wrench size={18} /> Equipment Manager
            </h2>
            <div className="flex-1 overflow-y-auto pr-2">
                <ul className="flex flex-col m-0 p-0">
                    {tasks.map((task, idx) => {
                        let color = 'text-white';
                        if (task.status === 'Overdue') color = 'text-neon-red drop-shadow-[0_0_5px_rgba(255,51,51,0.5)]';
                        else if (task.status === 'Due Soon') color = 'text-neon-yellow drop-shadow-[0_0_5px_rgba(255,230,0,0.5)]';
                        else color = 'text-neon-green drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]';

                        return (
                            <li key={idx} className={`flex justify-between items-center py-2.5 border-b border-white/5 ${idx === tasks.length - 1 ? 'border-b-0' : ''}`}>
                                <span className="text-text-color">{task.item}</span>
                                <span className={`text-right flex flex-col items-end ${color}`}>
                                    <div className="font-bold opacity-90">{task.status}</div>
                                    <div className="text-[0.95rem] opacity-70">Due: {task.due}</div>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

registerWidget({
    type: "equipment-manager",
    name: "Equipment Manager",
    description: "Tracks appliance filters and maintenance schedules.",
    defaultWidth: 1,
    defaultHeight: 1,
    component: EquipmentWidget,
});
