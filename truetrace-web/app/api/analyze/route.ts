import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/analyzer';
import { convertDocumentToImage } from '@/lib/document-converter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type - support images and documents
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const validTypes = [...imageTypes, ...documentTypes];

        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Please upload a JPEG, PNG image, or PDF/Word document.' },
                { status: 400 }
            );
        }

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer();
        let buffer = Buffer.from(new Uint8Array(arrayBuffer));

        // If it's a document, convert it to an image first
        if (documentTypes.includes(file.type)) {
            try {
                const convertedBuffer = await convertDocumentToImage(buffer, file.type);
                buffer = Buffer.from(convertedBuffer);
            } catch (conversionError) {
                console.error('Document conversion error:', conversionError);
                return NextResponse.json(
                    { error: 'Failed to process document. Please try a different file.' },
                    { status: 400 }
                );
            }
        }

        // Analyze the image (or converted document image)
        const analysisResult = await analyzeImage(buffer);

        return NextResponse.json(analysisResult);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze file' },
            { status: 500 }
        );
    }
}
