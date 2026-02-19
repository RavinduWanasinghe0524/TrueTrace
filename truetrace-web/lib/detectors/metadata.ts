import sharp from 'sharp';
import ExifParser from 'exif-parser';
import { DetectorResult } from '../types';

/**
 * Metadata & EXIF Analysis - Improved Version
 * Analyzes EXIF metadata for signs of tampering without over-penalizing
 * legitimate processing software. Uses a weighted multi-signal approach.
 */

export async function analyzeMetadata(imageBuffer: Buffer): Promise<DetectorResult> {
    try {
        const sharpMeta = await sharp(imageBuffer).metadata();

        interface ParsedExifData {
            tags?: {
                Software?: string;
                CreateDate?: number;
                ModifyDate?: number;
                DateTimeOriginal?: number;
                Make?: string;
                Model?: string;
                GPSLatitude?: number;
                GPSLongitude?: number;
                Orientation?: number;
                ExifImageWidth?: number;
                ExifImageHeight?: number;
                PixelXDimension?: number;
                PixelYDimension?: number;
                YCbCrPositioning?: number;
            };
        }

        let exifData: ParsedExifData | null = null;
        try {
            const parser = ExifParser.create(imageBuffer);
            exifData = parser.parse();
        } catch {
            // No EXIF data
        }

        const signals: { label: string; score: number; suspicious: boolean }[] = [];

        if (!exifData || !exifData.tags) {
            // Missing EXIF is common for screenshots / web images — small penalty
            return {
                detector: 'Metadata',
                result: 'Warning',
                details: 'No EXIF metadata found. Could indicate screenshot, web download, or metadata stripping.',
                score: 10,
            };
        }

        const tags = exifData.tags;

        // --- Signal 1: Editing Software ---
        const softwareRaw = (tags.Software || '').toLowerCase();
        const heavyEditors = ['photoshop', 'gimp', 'affinity photo', 'pixelmator', 'lightroom'];
        const lightProcessors = ['canva', 'snapseed', 'vsco', 'instagram', 'facebook', 'whatsapp'];
        const cameraFirmware = ['nikon', 'canon', 'sony', 'fujifilm', 'olympus', 'pentax', 'apple'];

        if (heavyEditors.some(s => softwareRaw.includes(s))) {
            signals.push({ label: `Edited with ${tags.Software}`, score: 45, suspicious: true });
        } else if (lightProcessors.some(s => softwareRaw.includes(s))) {
            signals.push({ label: `Processed with ${tags.Software}`, score: 20, suspicious: true });
        } else if (cameraFirmware.some(s => softwareRaw.includes(s)) || softwareRaw === '') {
            signals.push({ label: 'Camera firmware or no software tag', score: 0, suspicious: false });
        } else if (softwareRaw.length > 0) {
            signals.push({ label: `Unknown software: ${tags.Software}`, score: 10, suspicious: false });
        }

        // --- Signal 2: Date Consistency ---
        const createDate = tags.CreateDate || tags.DateTimeOriginal;
        const modifyDate = tags.ModifyDate;

        if (!createDate) {
            signals.push({ label: 'Missing original creation date', score: 25, suspicious: true });
        } else if (modifyDate && createDate && modifyDate > createDate + 60) {
            const diffDays = Math.round((modifyDate - createDate) / 86400);
            signals.push({
                label: `Modified ${diffDays} days after creation — possible re-editing`,
                score: 30,
                suspicious: true,
            });
        } else {
            signals.push({ label: 'Timestamps consistent', score: 0, suspicious: false });
        }

        // --- Signal 3: Camera Info ---
        const hasMake = !!tags.Make;
        const hasModel = !!tags.Model;
        if (!hasMake && !hasModel && !!createDate) {
            signals.push({ label: 'No camera make/model — unusual for a real camera photo', score: 15, suspicious: true });
        } else if (hasMake && hasModel) {
            signals.push({ label: `Camera: ${tags.Make} ${tags.Model}`, score: 0, suspicious: false });
        }

        // --- Signal 4: Dimension Consistency ---
        const reportedW = tags.ExifImageWidth || tags.PixelXDimension;
        const reportedH = tags.ExifImageHeight || tags.PixelYDimension;
        if (reportedW && reportedH && sharpMeta.width && sharpMeta.height) {
            const wMismatch = Math.abs(reportedW - sharpMeta.width) > 4;
            const hMismatch = Math.abs(reportedH - sharpMeta.height) > 4;
            if (wMismatch || hMismatch) {
                signals.push({
                    label: `Dimension mismatch: EXIF says ${reportedW}×${reportedH} but actual is ${sharpMeta.width}×${sharpMeta.height}`,
                    score: 40,
                    suspicious: true,
                });
            } else {
                signals.push({ label: 'Dimensions match EXIF records', score: 0, suspicious: false });
            }
        }

        // Calculate total score (capped at 100)
        const totalScore = Math.min(100, signals.reduce((s, sig) => s + sig.score, 0));
        const suspiciousSignals = signals.filter(s => s.suspicious);

        let result: 'Pass' | 'Fail' | 'Warning';
        if (totalScore >= 50) {
            result = 'Fail';
        } else if (totalScore >= 20) {
            result = 'Warning';
        } else {
            result = 'Pass';
        }

        const detailLines: string[] = [];
        if (suspiciousSignals.length > 0) {
            detailLines.push(`⚠️ ${suspiciousSignals.length} suspicious metadata signal(s):`);
            suspiciousSignals.forEach(s => detailLines.push(`  • ${s.label}`));
        } else {
            detailLines.push('✓ No suspicious metadata signals found.');
        }

        const clean = signals.filter(s => !s.suspicious && s.label !== 'Camera firmware or no software tag');
        if (clean.length > 0) {
            detailLines.push('');
            detailLines.push('✓ Clean signals:');
            clean.forEach(s => detailLines.push(`  • ${s.label}`));
        }

        return {
            detector: 'Metadata',
            result,
            details: detailLines.join('\n'),
            score: totalScore,
        };

    } catch (error) {
        return {
            detector: 'Metadata',
            result: 'Warning',
            details: `Could not read image metadata: ${error}`,
            score: 10,
        };
    }
}
