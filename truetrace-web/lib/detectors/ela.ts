import sharp from 'sharp';
import { DetectorResult } from '../types';

/**
 * Error Level Analysis (ELA) - Improved Multi-Quality Version
 * Detects manipulation by comparing ELA responses at multiple compression levels.
 * Edited regions respond differently to re-compression than original regions.
 */

export async function analyzeELA(
    imageBuffer: Buffer
): Promise<{ result: DetectorResult; elaImage: Buffer }> {
    try {
        // Normalize to PNG first to avoid prior compression influence
        const normalized = await sharp(imageBuffer)
            .png()
            .toBuffer();

        // Run ELA at multiple quality levels
        const qualities = [75, 85, 95];
        const elaBuffers: { data: Buffer; info: sharp.OutputInfo }[] = [];

        for (const q of qualities) {
            const recompressed = await sharp(normalized)
                .jpeg({ quality: q })
                .toBuffer();
            const raw = await sharp(recompressed).raw().toBuffer({ resolveWithObject: true });
            elaBuffers.push(raw);
        }

        const originalRaw = await sharp(normalized).raw().toBuffer({ resolveWithObject: true });
        const { data: origData, info } = originalRaw;
        const pixelCount = info.width * info.height;
        const channels = info.channels;

        // Compute per-pixel difference at each quality level
        const diffs: number[][] = qualities.map((_, qi) => {
            const compressed = elaBuffers[qi].data;
            const d: number[] = [];
            for (let i = 0; i < origData.length; i++) {
                d.push(Math.abs(origData[i] - compressed[i]));
            }
            return d;
        });

        // For each pixel, check variance across quality levels
        // Edited regions show higher variance across quality levels
        const elaVariance: number[] = new Array(pixelCount).fill(0);
        let totalVariance = 0;
        let maxVariance = 0;

        for (let p = 0; p < pixelCount; p++) {
            let channelVar = 0;
            for (let c = 0; c < Math.min(channels, 3); c++) {
                const idx = p * channels + c;
                const vals = diffs.map(d => d[idx] || 0);
                const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
                const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / vals.length;
                channelVar += variance;
            }
            elaVariance[p] = channelVar / Math.min(channels, 3);
            totalVariance += elaVariance[p];
            if (elaVariance[p] > maxVariance) maxVariance = elaVariance[p];
        }

        const avgVariance = totalVariance / pixelCount;
        const stdDev = Math.sqrt(
            elaVariance.reduce((s, v) => s + Math.pow(v - avgVariance, 2), 0) / pixelCount
        );

        // Count pixels that are statistically anomalous (> mean + 2 stddev)
        const anomalyThreshold = avgVariance + 2 * stdDev;
        const anomalousPixels = elaVariance.filter(v => v > anomalyThreshold).length;
        const anomalyRatio = anomalousPixels / pixelCount;

        // Build visualization (enhanced brightness map)
        const elaVisData = Buffer.alloc(pixelCount * 3);
        const scale = maxVariance > 0 ? 255 / maxVariance : 1;
        for (let p = 0; p < pixelCount; p++) {
            const bright = Math.min(255, Math.round(elaVariance[p] * scale * 3));
            const anomaly = elaVariance[p] > anomalyThreshold;
            elaVisData[p * 3] = anomaly ? Math.min(255, bright * 2) : bright;      // R: highlight anomalies
            elaVisData[p * 3 + 1] = anomaly ? 0 : bright;                           // G
            elaVisData[p * 3 + 2] = anomaly ? 0 : Math.min(255, bright * 0.5);     // B
        }

        const elaImage = await sharp(elaVisData, {
            raw: { width: info.width, height: info.height, channels: 3 },
        }).jpeg({ quality: 90 }).toBuffer();

        // Score based on anomaly ratio and variance patterns
        let score = 0;
        let result: 'Pass' | 'Fail' | 'Warning';
        let details: string;

        if (anomalyRatio > 0.15) {
            score = Math.min(100, Math.round(anomalyRatio * 400));
            result = 'Fail';
            details = `ELA detected ${(anomalyRatio * 100).toFixed(1)}% anomalous pixels across compression levels — strong manipulation signature. Avg variance: ${avgVariance.toFixed(2)}, StdDev: ${stdDev.toFixed(2)}.`;
        } else if (anomalyRatio > 0.05) {
            score = Math.round(anomalyRatio * 300);
            result = 'Warning';
            details = `ELA detected ${(anomalyRatio * 100).toFixed(1)}% anomalous pixels — possible light editing or image processing. Avg variance: ${avgVariance.toFixed(2)}.`;
        } else {
            score = Math.round(anomalyRatio * 100);
            result = 'Pass';
            details = `ELA shows consistent compression response (${(anomalyRatio * 100).toFixed(1)}% anomaly ratio). Image appears unmodified.`;
        }

        return { result: { detector: 'ELA', result, details, score }, elaImage };

    } catch (error) {
        const fallbackEla = await sharp({
            create: { width: 100, height: 100, channels: 3, background: { r: 20, g: 20, b: 30 } },
        }).jpeg().toBuffer();

        return {
            result: {
                detector: 'ELA',
                result: 'Warning',
                details: `Could not perform ELA analysis: ${error}`,
                score: 15,
            },
            elaImage: fallbackEla,
        };
    }
}
