import sharp from 'sharp';
import ExifParser from 'exif-parser';
import { DetectorResult } from '../types';

export async function analyzeMetadata(imageBuffer: Buffer): Promise<DetectorResult> {
    try {
        const metadata = await sharp(imageBuffer).metadata();

        // Try to parse EXIF data
        let exifData: any = null;
        try {
            const parser = ExifParser.create(imageBuffer);
            exifData = parser.parse();
        } catch (e) {
            // No EXIF data available
        }

        if (!exifData || !exifData.tags) {
            return {
                detector: 'Metadata',
                result: 'Warning',
                details: 'No EXIF metadata found. This could be a sign of tampering.',
                score: 20,
            };
        }

        const suspiciousSoftware = ['photoshop', 'gimp', 'canva', 'adobe'];
        const software = (exifData.tags.Software || '').toLowerCase();
        const createDate = exifData.tags.CreateDate;

        const warnings: string[] = [];
        let score = 0;

        if (suspiciousSoftware.some(s => software.includes(s))) {
            warnings.push(`Image was edited with suspicious software: ${software}`);
            score += 50;
        }

        if (!createDate) {
            warnings.push('Original creation date is missing.');
            score += 30;
        }

        if (warnings.length > 0) {
            return {
                detector: 'Metadata',
                result: 'Fail',
                details: warnings.join('\\n'),
                score: Math.min(100, score),
            };
        }

        return {
            detector: 'Metadata',
            result: 'Pass',
            details: 'No suspicious metadata found.',
            score: 0,
        };
    } catch (error) {
        return {
            detector: 'Metadata',
            result: 'Warning',
            details: `Could not read image or extract EXIF data: ${error}`,
            score: 10,
        };
    }
}
