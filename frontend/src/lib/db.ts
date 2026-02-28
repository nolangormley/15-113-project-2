import fs from 'fs';
import path from 'path';
import { WidgetConfig } from './registry';

// We use a local JSON file to act as our Document DB / SQLite proxy for this Refactor.
const DB_PATH = path.join(process.cwd(), 'data', 'layout.json');

if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

export function saveLayout(layout: WidgetConfig[]) {
    fs.writeFileSync(DB_PATH, JSON.stringify(layout, null, 2));
}

export function getLayout(): WidgetConfig[] | null {
    if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        try {
            return JSON.parse(data) as WidgetConfig[];
        } catch {
            return null;
        }
    }
    return null;
}
