import { ComponentType } from "react";

export interface WidgetConfig {
    i: string; // React-Grid-Layout uses 'i' for unique ID
    x: number;
    y: number;
    w: number;
    h: number;
    type: string; // The registered module type ID
    // Additional configuration options can go here
}

export interface WidgetProps {
    config: WidgetConfig;
    isEditing: boolean;
    onRemove?: (id: string) => void;
}

export interface WidgetModule {
    type: string;
    name: string;
    description: string;
    defaultWidth: number;
    defaultHeight: number;
    component: ComponentType<WidgetProps>;
}

export const widgetRegistry: Record<string, WidgetModule> = {};

export function registerWidget(module: WidgetModule) {
    if (widgetRegistry[module.type]) {
        console.warn(`Widget type ${module.type} already registered.`);
    }
    widgetRegistry[module.type] = module;
}

export function getWidget(type: string): WidgetModule | undefined {
    return widgetRegistry[type];
}

export function getAllWidgets(): WidgetModule[] {
    return Object.values(widgetRegistry);
}
