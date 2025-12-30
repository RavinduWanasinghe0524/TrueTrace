import sharp from 'sharp';
import { DetectorResult } from '../types';

export async function analyzeNoiseVariance(
    imageBuffer: Buffer,
    blockSize: number = 50,
    varianceThresholdRatio: number = 0.2
): Promise<{ result: DetectorResult; noiseMap: Buffer }> {
    try {
        // Convert to grayscale
        const { data, info } = await sharp(imageBuffer)
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;
        const height = info.height;

        // Apply Laplacian-like edge detection manually
        const edgeData = Buffer.alloc(data.length);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const top = (y - 1) * width + x;
                const bottom = (y + 1) * width + x;
                const left = y * width + (x - 1);
                const right = y * width + (x + 1);

                // Laplacian kernel approximation
                const value = Math.abs(
                    -1 * data[top] +
                    -1 * data[bottom] +
                    -1 * data[left] +
                    -1 * data[right] +
                    4 * data[idx]
                );

                edgeData[idx] = Math.min(255, value);
            }
        }

        // Calculate variance for blocks
        const variances: number[] = [];

        for (let y = 0; y < height - blockSize; y += blockSize) {
            for (let x = 0; x < width - blockSize; x += blockSize) {
                let sum = 0;
                let count = 0;

                // Calculate mean
                for (let by = 0; by < blockSize; by++) {
                    for (let bx = 0; bx < blockSize; bx++) {
                        const idx = (y + by) * width + (x + bx);
                        sum += edgeData[idx];
                        count++;
                    }
                }

                const mean = sum / count;

                // Calculate variance
                let variance = 0;
                for (let by = 0; by < blockSize; by++) {
                    for (let bx = 0; bx < blockSize; bx++) {
                        const idx = (y + by) * width + (x + bx);
                        variance += Math.pow(edgeData[idx] - mean, 2);
                    }
                }

                variances.push(variance / count);
            }
        }

        if (variances.length === 0) {
            const fallbackNoise = await sharp({
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
                    detector: 'Noise Variance',
                    result: 'Warning',
                    details: 'Image is too small for block analysis.',
                    score: 10,
                },
                noiseMap: fallbackNoise,
            };
        }

        const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
        const threshold = avgVariance * varianceThresholdRatio;
        const suspiciousBlocks = variances.filter(v => v < threshold).length;

        // Create noise map visualization
        const noiseMap = await sharp(edgeData, {
            raw: {
                width,
                height,
                channels: 1,
            },
        })
            .jpeg()
            .toBuffer();

        if (suspiciousBlocks > 0) {
            return {
                result: {
                    detector: 'Noise Variance',
                    result: 'Fail',
                    details: `Found ${suspiciousBlocks} block(s) with significantly lower noise variance than average. Potential splicing.`,
                    score: 85,
                },
                noiseMap,
            };
        }

        return {
            result: {
                detector: 'Noise Variance',
                result: 'Pass',
                details: 'Noise variance is consistent across the image.',
                score: 0,
            },
            noiseMap,
        };
    } catch (error) {
        const fallbackNoise = await sharp({
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
                detector: 'Noise Variance',
                result: 'Warning',
                details: `Could not perform noise variance analysis: ${error}`,
                score: 10,
            },
            noiseMap: fallbackNoise,
        };
    }
}
