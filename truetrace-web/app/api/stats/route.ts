/**
 * GET /api/stats
 * Proxies to the Python backend live statistics endpoint.
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
    try {
        const res = await fetch(`${PYTHON_API_URL}/api/stats`, {
            next: { revalidate: 60 }, // cache for 60 seconds
        });

        if (!res.ok) {
            throw new Error(`Backend returned ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Stats proxy error:', error);
        // Return zeros so the UI still renders
        return NextResponse.json({
            totalAnalyses: 0,
            avgAuthenticityScore: 0,
            manipulatedCount: 0,
            authenticCount: 0,
        });
    }
}
