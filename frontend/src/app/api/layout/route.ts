import { NextResponse } from 'next/server';
import { getLayout, saveLayout } from '@/lib/db';

export async function GET() {
    const layout = getLayout();
    return NextResponse.json({ layout });
}

export async function POST(req: Request) {
    try {
        const { layout } = await req.json();
        if (!Array.isArray(layout)) {
            return NextResponse.json({ error: 'Invalid layout' }, { status: 400 });
        }
        saveLayout(layout);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
