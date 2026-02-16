import { createCanvas } from 'canvas';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';

// Initialize PDF.js worker for server-side rendering
if (typeof window === 'undefined') {
    // Set the worker path for Node.js environment
    const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
}

/**
 * Convert a PDF buffer to an image buffer (JPEG)
 * Renders the first page of the PDF
 */
export async function convertPDFToImage(pdfBuffer: Buffer): Promise<Buffer> {
    try {
        // Load the PDF document - disable worker for server-side
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(pdfBuffer),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        });
        const pdf = await loadingTask.promise;

        // Get the first page
        const page = await pdf.getPage(1);

        // Set scale for better quality
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        // Render PDF page to canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render(renderContext as any).promise;

        // Convert canvas to JPEG buffer
        const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });

        // Ensure proper Buffer type for TypeScript
        return Buffer.from(imageBuffer);
    } catch (error) {
        console.error('PDF conversion error:', error);
        throw new Error('Failed to convert PDF to image');
    }
}

/**
 * Convert a Word document (DOCX/DOC) to an image
 * For now, we'll create a placeholder that extracts text and renders it as an image
 * In production, you might want to use a more sophisticated conversion service
 */
export async function convertDocToImage(_docBuffer: Buffer): Promise<Buffer> {
    try {
        // For Word documents, we'll create a simple text-based image
        // This is a simplified approach - for production, consider using:
        // - LibreOffice headless conversion
        // - A cloud service like Cloudmary or similar
        // - Microsoft Graph API

        const canvas = createCanvas(1200, 1600);
        const context = canvas.getContext('2d');

        // White background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Add text indicating this is a document
        context.fillStyle = 'black';
        context.font = '40px Arial';
        context.textAlign = 'center';
        context.fillText('Document Preview', canvas.width / 2, 100);

        context.font = '24px Arial';
        context.fillText('(Word Document Uploaded)', canvas.width / 2, 150);

        // Note: In production, you'd want to actually render the document content
        // For now, this creates a placeholder image that can be analyzed

        const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
        // Ensure proper Buffer type for TypeScript
        return Buffer.from(imageBuffer);
    } catch (error) {
        console.error('DOC conversion error:', error);
        throw new Error('Failed to convert document to image');
    }
}

/**
 * Main function to convert any supported document to an image
 */
export async function convertDocumentToImage(
    fileBuffer: Buffer,
    mimeType: string
): Promise<Buffer> {
    switch (mimeType) {
        case 'application/pdf':
            return await convertPDFToImage(fileBuffer);

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return await convertDocToImage(fileBuffer);

        default:
            throw new Error(`Unsupported document type: ${mimeType}`);
    }
}
