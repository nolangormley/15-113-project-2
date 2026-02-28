"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Responsive, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { WidgetConfig, getAllWidgets, getWidget, WidgetModule } from "@/lib/registry";
import { Plus, X, Move, Pencil } from "lucide-react";

export default function DashboardGrid() {
    const [layout, setLayout] = useState<WidgetConfig[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [rowHeight, setRowHeight] = useState(400);
    const [containerWidth, setContainerWidth] = useState(1000);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const updateHeight = () => {
            const availableHeight = window.innerHeight - 150; // Account for header, padding, and gaps
            const isDesktop = window.innerWidth >= 1200;
            const divisor = isDesktop ? 2 : 1; // 1 row high on touchscreens, 2 rows high on desktops
            setRowHeight(Math.max(180, Math.floor(availableHeight / divisor)));

            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            } else {
                setContainerWidth(window.innerWidth - 40);
            }
        };

        // Initial setup
        updateHeight();
        setTimeout(updateHeight, 100);
        window.addEventListener('resize', updateHeight);

        fetch("/api/layout")
            .then((res) => res.json())
            .then((data) => {
                if (data.layout) {
                    setLayout(data.layout);
                } else {
                    setLayout([]);
                }
            });

        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    const saveLayout = useCallback(
        async (newLayout: WidgetConfig[]) => {
            setLayout(newLayout);
            await fetch("/api/layout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ layout: newLayout }),
            });
        },
        []
    );

    const onLayoutChange = (currentLayout: any[]) => {
        if (!mounted || !isEditing) return;
        const updated = layout.map((w) => {
            const match = currentLayout.find((l) => l.i === w.i);
            if (match) {
                return { ...w, x: match.x, y: match.y, w: match.w, h: match.h };
            }
            return w;
        });
        setLayout(updated);
        saveLayout(updated);
    };

    const removeWidget = (id: string) => {
        const newLayout = layout.filter((w) => w.i !== id);
        setLayout(newLayout);
        saveLayout(newLayout);
    };

    const addWidget = (mod: WidgetModule) => {
        const newId = `${mod.type}-${Date.now()}`;
        // Find the lowest current row and its rightmost edge
        let bottomY = 0;
        layout.forEach(w => {
            if (w.y >= bottomY) bottomY = w.y;
        });

        let rightX = 0;
        layout.forEach(w => {
            if (w.y === bottomY && w.x + w.w > rightX) {
                rightX = w.x + w.w;
            }
        });

        const newWidget: WidgetConfig = {
            i: newId,
            type: mod.type,
            x: rightX,
            y: bottomY,
            w: mod.defaultWidth,
            h: mod.defaultHeight,
        };
        const newLayout = [...layout, newWidget];
        setLayout(newLayout);
        saveLayout(newLayout);
        setShowAddModal(false);
    };

    if (!mounted) return null;

    // Map the layout to enforce static limits strictly per item.
    // react-grid-layout sometimes ignores global isDraggable depending on child node triggers.
    const strictLayout = layout.map(item => ({
        ...item,
        static: !isEditing,
        isDraggable: isEditing,
        isResizable: isEditing,
    }));

    return (
        <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto relative z-10">
            <header className="relative flex justify-center items-center py-[5px] mb-2 z-20 shrink-0">
                <div className="flex items-center">
                    <img src="/title.png" alt="Mnemosyne" className="h-[60px] lg:h-[80px] drop-shadow-[0_0_8px_var(--neon-cyan)] object-contain" />
                </div>
                <div className="absolute right-5 flex items-center">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-3 rounded-full transition-colors backdrop-blur-sm ${isEditing
                            ? 'text-neon-red hover:bg-neon-red/20 bg-black/40'
                            : 'text-neon-cyan hover:bg-neon-cyan/20 bg-black/40'
                            }`}
                        title={isEditing ? "Close Edit Mode" : "Edit Dashboard"}
                    >
                        {isEditing ? <X size={24} /> : <Pencil size={24} />}
                    </button>
                </div>
            </header>

            {/* Main Grid Area */}
            <div ref={containerRef} className="flex-1 overflow-auto relative rounded-xl pb-10">
                {layout.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-text-dim text-lg">
                        No widgets configured. Click Edit to add some!
                    </div>
                )}

                <Responsive
                    width={containerWidth}
                    className="layout min-h-[500px]"
                    layouts={{ lg: strictLayout, md: strictLayout, sm: strictLayout, xs: strictLayout, xxs: strictLayout }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 3, md: 2, sm: 2, xs: 2, xxs: 2 }} // Force 2 cols on all sub-desktop screens to ensure 1x1 widgets square up properly side-by-side
                    rowHeight={rowHeight} // Dynamically synced to mimic 50% vh based on older styles
                    onLayoutChange={onLayoutChange}
                    isDraggable={isEditing}
                    isResizable={isEditing}
                    compactType={null} // Force strict grid snapping, stop auto-moving widgets willy-nilly
                    draggableHandle=".drag-handle"
                    margin={[20, 20]} // Our old gap
                >
                    {strictLayout.map((conf) => {
                        const Mod = getWidget(conf.type);
                        if (!Mod) return <div key={conf.i}>Unknown Widget</div>;
                        const Component = Mod.component;

                        return (
                            <div key={conf.i} className={`tile group h-full overflow-visible transition-transform duration-200 ${isEditing ? 'scale-[0.96] ring-2 ring-dashed ring-neon-cyan/50 z-20' : 'z-10 hover:z-30'}`}>
                                {isEditing && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeWidget(conf.i); }}
                                            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); removeWidget(conf.i); }}
                                            className="absolute -top-3 -right-3 z-50 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-500 shadow-lg cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <X size={18} />
                                        </button>
                                        <div className="drag-handle absolute -top-3 -left-3 z-50 bg-neon-cyan/90 text-black rounded-full p-1.5 cursor-grab active:cursor-grabbing shadow-lg hover:bg-neon-cyan transition-transform hover:scale-110">
                                            <Move size={18} />
                                        </div>
                                    </>
                                )}
                                <div className={`w-full h-full relative z-0 flex flex-col ${isEditing ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                                    <Component config={conf} isEditing={isEditing} />
                                </div>
                            </div>
                        );
                    })}
                </Responsive>

                {isEditing && (
                    <div className="mt-8 flex justify-center pb-20 relative z-50">
                        <button
                            onClick={(e) => { e.preventDefault(); setShowAddModal(true); }}
                            className="px-6 py-3 bg-[rgba(0,0,0,0.6)] border-2 border-dashed border-neon-green text-neon-green rounded-xl hover:bg-neon-green/10 flex items-center gap-2 uppercase tracking-wide transition-colors cursor-pointer"
                        >
                            <Plus size={20} /> Add Widget
                        </button>
                    </div>
                )}
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[rgba(20,20,40,0.95)] border border-neon-cyan shadow-[0_0_30px_rgba(0,243,255,0.3)] rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
                            <h2 className="text-xl font-display text-white m-0 tracking-widest">WIDGET GALLERY</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-white/60 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                            {getAllWidgets().map(mod => (
                                <div key={mod.type} className="border border-white/20 p-5 rounded-lg bg-black/40 hover:border-neon-cyan hover:bg-neon-cyan/5 hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all flex flex-col cursor-pointer" onClick={() => addWidget(mod)}>
                                    <h3 className="text-neon-cyan font-bold mb-2 uppercase text-sm tracking-widest border-b border-white/10 pb-2">{mod.name}</h3>
                                    <p className="text-sm text-text-dim flex-1 mb-3">{mod.description}</p>
                                    <div className="text-xs text-white/40">Default Layout: {mod.defaultWidth} col x {mod.defaultHeight} row</div>
                                </div>
                            ))}
                            {getAllWidgets().length === 0 && (
                                <div className="col-span-full text-center text-text-dim py-12 text-lg">No widgets registered yet! (Check the registry)</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
