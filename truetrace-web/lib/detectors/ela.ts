import sharp from 'sharp';
import { DetectorResult } from '../types';

export async function analyzeELA(
    imageBuffer: Buffer,
    quality: number = 90,
    brightnessThreshold: number = 10
): Promise<{ result: DetectorResult; elaImage: Buffer }> {
    try {
        // Get original image
        const original = await sharp(imageBuffer)
            .jpeg({ quality: 100 })
            .toBuffer();

        // Resave at specified quality
        const resaved = await sharp(original)
            .jpeg({ quality })
            .toBuffer();

        // Load both images to get pixel data
        const originalData = await sharp(original).raw().toBuffer({ resolveWithObject: true });
        const resavedData = await sharp(resaved).raw().toBuffer({ resolveWithObject: true });

        // Calculate differences
        const diffPixels = Buffer.alloc(originalData.data.length);
        let totalDiff = 0;
        let maxDiff = 0;

        for (let i = 0; i < originalData.data.length; i++) {
            const diff = Math.abs(originalData.data[i] - resavedData.data[i]);
            diffPixels[i] = diff;
            totalDiff += diff;
            maxDiff = Math.max(maxDiff, diff);
        }

        // Normalize and enhance brightness
        const enhancedPixels = Buffer.alloc(diffPixels.length);
        const scale = maxDiff > 0 ? 255 / maxDiff : 1;

        for (let i = 0; i < diffPixels.length; i++) {
            enhancedPixels[i] = Math.min(255, diffPixels[i] * scale);
        }

        // Create ELA image
        const elaImage = await sharp(enhancedPixels, {
            raw: {
                width: originalData.info.width,
                height: originalData.info.height,
                channels: originalData.info.channels,
            },
        })
            .jpeg()
            .toBuffer();

        // Calculate brightness ratio
        const brightnessRatio = totalDiff / diffPixels.length;

        if (brightnessRatio > brightnessThreshold) {
            return {
                result: {
                    detector: 'ELA',
                    result: 'Fail',
                    details: `High ELA brightness ratio: ${brightnessRatio.toFixed(2)} (Threshold: ${brightnessThreshold}). Potential manipulation.`,
                    score: 75,
                },
                elaImage,
            };
        }

        return {
            result: {
                detector: 'ELA',
                result: 'Pass',
                details: `ELA brightness ratio: ${brightnessRatio.toFixed(2)} (Threshold: ${brightnessThreshold}).`,
                score: 0,
            },
            elaImage,
        };
    } catch (error) {
        const fallbackEla = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 0, g: 0, b: 0 },
            },
        })
            .jpeg()
            .toBuffer();

        return {
            result: {
                detector: 'ELA',
                result: 'Warning',
                details: `Could not perform ELA analysis: ${error}`,
                score: 10,
            },
            elaImage: fallbackEla,
        };
    }
}
