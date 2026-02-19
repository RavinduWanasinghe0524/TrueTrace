import sharp from 'sharp';
import { DetectorResult } from '../types';

/**
 * Noise Variance Analysis - Improved IQR-based Version
 * Detects splicing by finding blocks with statistically anomalous noise profiles.
 * Uses Interquartile Range (IQR) to identify true outliers instead of a fixed ratio.
 */

export async function analyzeNoiseVariance(
    imageBuffer: Buffer
): Promise<{ result: DetectorResult; noiseMap: Buffer }> {
    try {
        const { data, info } = await sharp(imageBuffer)
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;
        const height = info.height;

        // Laplacian filter to extract noise residual
        const noiseResidual = Buffer.alloc(data.length);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const lap = Math.abs(
                    -1 * data[(y - 1) * width + x] +
                    -1 * data[(y + 1) * width + x] +
                    -1 * data[y * width + (x - 1)] +
                    -1 * data[y * width + (x + 1)] +
                    4 * data[idx]
                );
                noiseResidual[idx] = Math.min(255, lap);
            }
        }

        const blockSize = 32; // Smaller blocks for better spatial resolution
        const blockVariances: number[] = [];
        const blockPositions: { x: number; y: number; variance: number }[] = [];

        for (let y = 0; y < height - blockSize; y += blockSize) {
            for (let x = 0; x < width - blockSize; x += blockSize) {
                let sum = 0;
                let count = 0;

                for (let by = 0; by < blockSize; by++) {
                    for (let bx = 0; bx < blockSize; bx++) {
                        sum += noiseResidual[(y + by) * width + (x + bx)];
                        count++;
                    }
                }

                const mean = sum / count;
                let variance = 0;
                for (let by = 0; by < blockSize; by++) {
                    for (let bx = 0; bx < blockSize; bx++) {
                        variance += Math.pow(noiseResidual[(y + by) * width + (x + bx)] - mean, 2);
                    }
                }

                const v = variance / count;
                blockVariances.push(v);
                blockPositions.push({ x, y, variance: v });
            }
        }

        if (blockVariances.length < 4) {
            const fallbackNoise = await sharp({
                create: { width: 100, height: 100, channels: 3, background: { r: 20, g: 20, b: 30 } },
            }).jpeg().toBuffer();

            return {
                result: {
                    detector: 'Noise Variance',
                    result: 'Warning',
                    details: 'Image is too small for block noise analysis.',
                    score: 10,
                },
                noiseMap: fallbackNoise,
            };
        }

        // IQR-based outlier detection (more robust than mean ± fixed ratio)
        const sorted = [...blockVariances].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;

        // Blocks outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR] are anomalous
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const anomalousBlocks = blockPositions.filter(
            b => b.variance < lowerBound || b.variance > upperBound
        );

        // Also check for gradient discontinuities between neighboring blocks
        let discontinuityScore = 0;
        const gridWidth = Math.floor((width - blockSize) / blockSize);
        for (let i = 0; i < blockPositions.length; i++) {
            const right = blockPositions[i + 1];
            const below = blockPositions[i + gridWidth];
            if (right) {
                const diff = Math.abs(blockPositions[i].variance - right.variance);
                if (diff > upperBound * 0.8) discontinuityScore++;
            }
            if (below) {
                const diff = Math.abs(blockPositions[i].variance - below.variance);
                if (diff > upperBound * 0.8) discontinuityScore++;
            }
        }

        const anomalyRatio = anomalousBlocks.length / blockVariances.length;
        const discontinuityRatio = discontinuityScore / (blockVariances.length * 2);

        // Build enhanced noise map (color-coded: red=anomalous, blue=normal)
        const noiseMapData = Buffer.alloc(width * height * 3, 0);
        for (let p = 0; p < noiseResidual.length; p++) {
            noiseMapData[p * 3] = noiseResidual[p];
            noiseMapData[p * 3 + 1] = noiseResidual[p];
            noiseMapData[p * 3 + 2] = noiseResidual[p];
        }

        // Highlight anomalous blocks in the map
        for (const block of anomalousBlocks) {
            for (let by = 0; by < blockSize; by++) {
                for (let bx = 0; bx < blockSize; bx++) {
                    const p = (block.y + by) * width + (block.x + bx);
                    noiseMapData[p * 3] = Math.min(255, noiseMapData[p * 3] * 2 + 80);
                    noiseMapData[p * 3 + 1] = Math.max(0, noiseMapData[p * 3 + 1] - 20);
                    noiseMapData[p * 3 + 2] = Math.max(0, noiseMapData[p * 3 + 2] - 20);
                }
            }
        }

        const noiseMap = await sharp(noiseMapData, {
            raw: { width, height, channels: 3 },
        }).jpeg({ quality: 90 }).toBuffer();

        // Compute final score
        const combinedScore = Math.min(100, Math.round(
            (anomalyRatio * 60 + discontinuityRatio * 40) * 100
        ));

        let result: 'Pass' | 'Fail' | 'Warning';
        let details: string;

        if (anomalyRatio > 0.20 || discontinuityRatio > 0.15) {
            result = 'Fail';
            details = `Found ${anomalousBlocks.length}/${blockVariances.length} anomalous noise blocks (${(anomalyRatio * 100).toFixed(1)}%) with ${discontinuityScore} sharp discontinuities — strong splicing indicator.`;
        } else if (anomalyRatio > 0.08 || discontinuityRatio > 0.05) {
            result = 'Warning';
            details = `Found ${anomalousBlocks.length}/${blockVariances.length} mildly anomalous blocks (${(anomalyRatio * 100).toFixed(1)}%) — possible light editing or different source regions.`;
        } else {
            result = 'Pass';
            details = `Noise profile is consistent across all ${blockVariances.length} analyzed blocks. IQR: ${iqr.toFixed(1)}, no significant discontinuities.`;
        }

        return {
            result: {
                detector: 'Noise Variance',
                result,
                details,
                score: combinedScore,
            },
            noiseMap,
        };

    } catch (error) {
        const fallbackNoise = await sharp({
            create: { width: 100, height: 100, channels: 3, background: { r: 20, g: 20, b: 30 } },
        }).jpeg().toBuffer();

        return {
            result: {
                detector: 'Noise Variance',
                result: 'Warning',
                details: `Noise analysis failed: ${error}`,
                score: 10,
            },
            noiseMap: fallbackNoise,
        };
    }
}
