# Mnemosyne Module Documentation

Mnemosyne is built on Next.js and uses a centralized Widget Registry for injecting React components into the main dashboard grid.

## Creating a new Widget

A widget is simply a standard React Server/Client Component that conforms to the `WidgetProps` interface and registers itself globally on initialization.

### 1. Create your component
Create a file for your widget inside `frontend/src/components/widgets/YourWidget.tsx`.

It should take in `WidgetProps`, which tells it if the user is currently editing the grid or what its unique ID is.

```tsx
"use client";

import React from "react";
import { WidgetProps, registerWidget } from "@/lib/registry";

export function CustomGreetingWidget({ config, isEditing }: WidgetProps) {
  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl p-4 border border-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]">
       <h2 className="text-[1.2rem] text-[var(--neon-cyan)] font-bold mb-4">Hello World!</h2>
       <p className="text-[var(--text-color)]">This is a custom community widget.</p>
    </div>
  );
}

// 2. Register it automatically
registerWidget({
  type: "greeting-custom",
  name: "Custom Greeting",
  description: "A simple hello world example widget.",
  defaultWidth: 1,  // Grid columns (default is 3 columns on desktop)
  defaultHeight: 1, // Grid rows (default is ~300px per row)
  component: CustomGreetingWidget,
});
```

### 3. Add to the Global Scope
For your widget to appear in the "Add Widget" gallery menu, open `frontend/src/lib/widgets.ts` and import your new file so the `registerWidget` command executes when the dashboard loads:

```tsx
import "@/components/widgets/YourWidget";
```

### Styling
You have full access to Tailwind classes, inherited `lucide-react` icons, and custom global variables like `var(--neon-cyan)`, `var(--neon-magenta)`, and `var(--text-dim)`. You can also use Next.js tailwind extensions like `text-neon-cyan` if configured in `tailwind.config.ts`. See `frontend/src/app/globals.css` for a full list of theme tokens.
