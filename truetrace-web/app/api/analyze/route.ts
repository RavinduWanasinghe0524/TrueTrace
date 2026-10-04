/**
 * POST /api/analyze
 *
 * Proxies image uploads to the TrueTrace Python backend (FastAPI).
 * The Python backend runs real forensic detectors (ELA, Noise Variance,
 * Metadata, AI Forensics) using OpenCV, NumPy, and ONNX Runtime.
 *
 * Falls back to a helpful error message if the backend is unreachable.
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload a JPEG or PNG image.' },
                { status: 400 }
            );
        }

        // Forward the file to the Python backend
        const backendForm = new FormData();
        backendForm.append('image', file);

        const backendResponse = await fetch(`${PYTHON_API_URL}/api/analyze`, {
            method: 'POST',
            body: backendForm,
            // No Content-Type header — let fetch set multipart boundary automatically
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error(`Backend error ${backendResponse.status}:`, errorText);

            if (backendResponse.status === 429) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. You can analyze up to 10 images per hour.' },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                { error: `Analysis failed (${backendResponse.status}). Please try again.` },
                { status: backendResponse.status }
            );
        }

        const analysisResult = await backendResponse.json();

        // Forward rate limit headers to the browser
        const headers: Record<string, string> = {};
        ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Cache'].forEach(h => {
            const v = backendResponse.headers.get(h);
            if (v) headers[h] = v;
        });

        return NextResponse.json(analysisResult, { headers });

    } catch (error: any) {
        console.error('Proxy error:', error);

        // Friendly error if Python backend is not running
        if (error?.cause?.code === 'ECONNREFUSED') {
            return NextResponse.json(
                { error: 'Analysis service is starting up. Please wait a moment and try again.' },
                { status: 503 }
            );
        }

        return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
    }
}
