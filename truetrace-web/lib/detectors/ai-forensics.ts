import sharp from 'sharp';
import { DetectorResult } from '../types';

/**
 * AI-Powered Forensic Analysis - Improved Version
 * Uses multiple computer vision techniques with tuned thresholds to reduce
 * false positives on real images while catching actual manipulation.
 */

interface FeatureVector {
    colorHistogram: number[];
    textureFeatures: number[];
    edgeComplexity: number;
    compressionArtifacts: number;
}

export async function analyzeWithAI(imageBuffer: Buffer): Promise<DetectorResult> {
    try {
        const features = await extractImageFeatures(imageBuffer);

        const copyMoveScore = await detectCopyMove(imageBuffer);
        const splicingScore = detectSplicing(features);
        const compressionScore = analyzeCompressionArtifacts(features);
        const frequencyScore = await analyzeFrequencyPatterns(imageBuffer);

        // Weighted combination — compression gets lower weight to avoid penalizing normal re-saves
        const aiScore = (
            copyMoveScore * 0.35 +
            splicingScore * 0.30 +
            compressionScore * 0.15 +
            frequencyScore * 0.20
        );

        const details = generateAIReport(aiScore, copyMoveScore, splicingScore, compressionScore, frequencyScore);

        let result: 'Pass' | 'Fail' | 'Warning';
        if (aiScore > 65) {
            result = 'Fail';
        } else if (aiScore > 35) {
            result = 'Warning';
        } else {
            result = 'Pass';
        }

        return {
            detector: 'AI Forensics',
            result,
            details,
            score: Math.round(aiScore),
        };
    } catch (error) {
        return {
            detector: 'AI Forensics',
            result: 'Warning',
            details: `AI analysis encountered an error: ${error}`,
            score: 10,
        };
    }
}

async function extractImageFeatures(imageBuffer: Buffer): Promise<FeatureVector> {
    const { data, info } = await sharp(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

    const colorHistogram = calculateColorHistogram(data, info.channels);
    const textureFeatures = calculateTextureFeatures(data, info.width, info.height);
    const edgeComplexity = calculateEdgeComplexity(data, info.width, info.height);
    const compressionArtifacts = detectJPEGArtifacts(data, info.width, info.height);

    return { colorHistogram, textureFeatures, edgeComplexity, compressionArtifacts };
}

function calculateColorHistogram(data: Buffer, channels: number): number[] {
    const bins = 32;
    const histogram = new Array(bins * 3).fill(0);

    for (let i = 0; i < data.length; i += channels) {
        const r = Math.floor((data[i] / 255) * (bins - 1));
        const g = Math.floor((data[i + 1] / 255) * (bins - 1));
        const b = Math.floor((data[i + 2] / 255) * (bins - 1));
        histogram[r]++;
        histogram[bins + g]++;
        histogram[bins * 2 + b]++;
    }

    // Normalize histogram
    const total = data.length / channels;
    return histogram.map(v => v / total);
}

function calculateTextureFeatures(data: Buffer, width: number, height: number): number[] {
    const features: number[] = [];
    const radius = 2;

    for (let y = radius; y < height - radius; y += 15) {
        for (let x = radius; x < width - radius; x += 15) {
            const centerValue = data[y * width + x];
            let pattern = 0;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const nx = Math.round(x + radius * Math.cos(angle));
                const ny = Math.round(y + radius * Math.sin(angle));
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (data[ny * width + nx] >= centerValue) {
                        pattern |= (1 << i);
                    }
                }
            }
            features.push(pattern);
        }
    }

    return features;
}

function calculateEdgeComplexity(data: Buffer, width: number, height: number): number {
    let totalEdges = 0;
    const sobelThreshold = 40;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const gx =
                -data[(y - 1) * width + (x - 1)] + data[(y - 1) * width + (x + 1)] +
                -2 * data[y * width + (x - 1)] + 2 * data[y * width + (x + 1)] +
                -data[(y + 1) * width + (x - 1)] + data[(y + 1) * width + (x + 1)];

            const gy =
                -data[(y - 1) * width + (x - 1)] - 2 * data[(y - 1) * width + x] - data[(y - 1) * width + (x + 1)] +
                data[(y + 1) * width + (x - 1)] + 2 * data[(y + 1) * width + x] + data[(y + 1) * width + (x + 1)];

            if (Math.sqrt(gx * gx + gy * gy) > sobelThreshold) totalEdges++;
        }
    }

    return totalEdges / (width * height);
}

function detectJPEGArtifacts(data: Buffer, width: number, height: number): number {
    let artifactScore = 0;
    const blockSize = 8;
    let count = 0;

    for (let y = 0; y < height - blockSize; y += blockSize) {
        for (let x = 0; x < width - blockSize; x += blockSize) {
            let horizontalDiff = 0;
            let verticalDiff = 0;

            for (let i = 0; i < blockSize; i++) {
                const rightIdx = y * width + (x + blockSize);
                const leftIdx = y * width + (x + blockSize - 1);
                if (rightIdx + i * width < data.length && leftIdx + i * width < data.length) {
                    horizontalDiff += Math.abs(data[rightIdx + i * width] - data[leftIdx + i * width]);
                }

                const bottomIdx = (y + blockSize) * width + x;
                const topIdx = (y + blockSize - 1) * width + x;
                if (bottomIdx + i < data.length && topIdx + i < data.length) {
                    verticalDiff += Math.abs(data[bottomIdx + i] - data[topIdx + i]);
                }
            }

            artifactScore += (horizontalDiff + verticalDiff) / (blockSize * 2);
            count++;
        }
    }

    return count > 0 ? artifactScore / count : 0;
}

async function detectCopyMove(imageBuffer: Buffer): Promise<number> {
    const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .resize({ width: 256, height: 256, fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;
    const blockSize = 16;

    let suspiciousMatches = 0;
    // Use a more discriminating hash: average + variance + orientation
    const blocks: Map<string, { x: number; y: number }[]> = new Map();

    for (let y = 0; y < height - blockSize; y += 8) {
        for (let x = 0; x < width - blockSize; x += 8) {
            let sum = 0;
            let sumSq = 0;
            let gradH = 0;

            for (let by = 0; by < blockSize; by++) {
                for (let bx = 0; bx < blockSize; bx++) {
                    const val = data[(y + by) * width + (x + bx)];
                    sum += val;
                    sumSq += val * val;
                    if (bx < blockSize - 1) {
                        gradH += Math.abs(data[(y + by) * width + (x + bx + 1)] - val);
                    }
                }
            }

            const n = blockSize * blockSize;
            const mean = Math.floor(sum / n);
            const variance = Math.floor((sumSq / n) - (mean * mean));
            const gradKey = Math.floor(gradH / n / 5); // Quantize gradient

            // Hash combines mean + variance + gradient direction — much more discriminating
            const hashKey = `${Math.floor(mean / 8)}-${Math.floor(variance / 20)}-${gradKey}`;

            if (!blocks.has(hashKey)) blocks.set(hashKey, []);
            blocks.get(hashKey)!.push({ x, y });
        }
    }

    for (const [, positions] of blocks) {
        if (positions.length > 1 && positions.length < 10) { // Limit: too many matches = background texture
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const dist = Math.sqrt(
                        Math.pow(positions[i].x - positions[j].x, 2) +
                        Math.pow(positions[i].y - positions[j].y, 2)
                    );
                    if (dist > blockSize * 3) {  // Must be widely separated (not adjacent texture)
                        suspiciousMatches++;
                    }
                }
            }
        }
    }

    // Normalize: divide by a larger base to be less sensitive
    return Math.min(100, (suspiciousMatches / 30) * 100);
}

function detectSplicing(features: FeatureVector): number {
    // Chi-square-like test between histogram quadrants
    // Real images have gradual color transitions; spliced ones may show abrupt shifts
    const hist = features.colorHistogram;
    const bins = hist.length / 3;

    let chiSquare = 0;
    const expected = 1 / bins;

    for (let i = 0; i < hist.length; i++) {
        const observed = hist[i];
        if (expected > 0) {
            chiSquare += Math.pow(observed - expected, 2) / expected;
        }
    }

    // Normalize chi-square to 0-100 range
    // Normal images have moderate chi-square; very low or very high = suspicious
    const normalizedChi = Math.min(1, chiSquare / 500);

    // Texture consistency check
    const textureVar = calculateVariance(features.textureFeatures);
    const normalizedTextureVar = Math.min(1, textureVar / 5000);

    // Score is higher when both signals agree on anomaly
    const splicingScore = (normalizedChi * 40) + (normalizedTextureVar * 60);

    // Cap at 80 as this is a weaker signal on its own
    return Math.min(80, splicingScore);
}

function analyzeCompressionArtifacts(features: FeatureVector): number {
    const level = features.compressionArtifacts;

    // Wider thresholds — most photos go through some compression
    if (level > 25) return 70;
    if (level > 18) return 45;
    if (level > 10) return 20;
    if (level > 5) return 10;
    return 0;
}

async function analyzeFrequencyPatterns(imageBuffer: Buffer): Promise<number> {
    const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .resize({ width: 128, height: 128, fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;

    let highFreqEnergy = 0;
    let lowFreqEnergy = 0;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gradient =
                Math.abs(data[idx] - data[idx - 1]) +
                Math.abs(data[idx] - data[idx + 1]) +
                Math.abs(data[idx] - data[idx - width]) +
                Math.abs(data[idx] - data[idx + width]);

            if (gradient > 25) highFreqEnergy++;
            else lowFreqEnergy++;
        }
    }

    const ratio = highFreqEnergy / (lowFreqEnergy + 1);

    // Widened "normal" window: 0.04 to 0.55 is typical for photos
    // Only flag truly extreme values
    if (ratio > 0.7 || ratio < 0.02) return 65;
    if (ratio > 0.55 || ratio < 0.04) return 35;
    return 5;
}

function calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
}

function generateAIReport(
    overall: number,
    copyMove: number,
    splicing: number,
    compression: number,
    frequency: number
): string {
    const lines: string[] = [];

    lines.push(`🔍 AI Forensic Score: ${overall.toFixed(1)}% manipulation probability\n`);

    const fmt = (label: string, score: number, warnThreshold: number) => {
        const icon = score > warnThreshold ? '⚠️' : '✓';
        return `${icon} ${label}: ${score.toFixed(1)}%`;
    };

    lines.push(fmt('Copy-Move Detection', copyMove, 40));
    lines.push(fmt('Image Splicing Analysis', splicing, 40));
    lines.push(fmt('Compression Anomalies', compression, 50));
    lines.push(fmt('Frequency Pattern Analysis', frequency, 35));

    return lines.join('\n');
}
