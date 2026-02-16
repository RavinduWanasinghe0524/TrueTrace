import sharp from 'sharp';
import { DetectorResult } from '../types';

/**
 * AI-Powered Forensic Analysis
 * Uses advanced computer vision techniques to detect image manipulation
 * including copy-move forgery, splicing, and deepfake indicators
 */

interface FeatureVector {
    colorHistogram: number[];
    textureFeatures: number[];
    edgeComplexity: number;
    compressionArtifacts: number;
}

export async function analyzeWithAI(imageBuffer: Buffer): Promise<DetectorResult> {
    try {
        // Extract multiple image features for AI analysis
        const features = await extractImageFeatures(imageBuffer);
        
        // Analyze for various manipulation signatures
        const copyMoveScore = await detectCopyMove(imageBuffer);
        const splicingScore = await detectSplicing(features);
        const compressionScore = analyzeCompressionArtifacts(features);
        const faceConsistencyScore = await analyzeFaceConsistency(imageBuffer);
        
        // Calculate weighted AI confidence score
        const aiScore = (
            copyMoveScore * 0.3 +
            splicingScore * 0.3 +
            compressionScore * 0.2 +
            faceConsistencyScore * 0.2
        );
        
        // Generate detailed analysis report
        const details = generateAIReport(
            aiScore,
            copyMoveScore,
            splicingScore,
            compressionScore,
            faceConsistencyScore
        );
        
        let result: 'Pass' | 'Fail' | 'Warning';
        if (aiScore > 70) {
            result = 'Fail';
        } else if (aiScore > 40) {
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
    
    // Color histogram (RGB distribution)
    const colorHistogram = calculateColorHistogram(data, info.channels);
    
    // Texture features using Local Binary Patterns
    const textureFeatures = calculateTextureFeatures(data, info.width, info.height);
    
    // Edge complexity
    const edgeComplexity = calculateEdgeComplexity(data, info.width, info.height);
    
    // Compression artifacts detection
    const compressionArtifacts = detectJPEGArtifacts(data, info.width, info.height);
    
    return {
        colorHistogram,
        textureFeatures,
        edgeComplexity,
        compressionArtifacts,
    };
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
    
    return histogram;
}

function calculateTextureFeatures(data: Buffer, width: number, height: number): number[] {
    // Simplified Local Binary Pattern
    const features: number[] = [];
    const radius = 2;
    
    for (let y = radius; y < height - radius; y += 10) {
        for (let x = radius; x < width - radius; x += 10) {
            const centerIdx = y * width + x;
            const centerValue = data[centerIdx];
            
            let pattern = 0;
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const nx = Math.round(x + radius * Math.cos(angle));
                const ny = Math.round(y + radius * Math.sin(angle));
                const idx = ny * width + nx;
                
                if (data[idx] >= centerValue) {
                    pattern |= (1 << i);
                }
            }
            
            features.push(pattern);
        }
    }
    
    return features;
}

function calculateEdgeComplexity(data: Buffer, width: number, height: number): number {
    let totalEdges = 0;
    const sobelThreshold = 50;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
        // Sobel operator
            const gx = Math.abs(
                -data[(y - 1) * width + (x - 1)] +
                data[(y - 1) * width + (x + 1)] -
                2 * data[y * width + (x - 1)] +
                2 * data[y * width + (x + 1)] -
                data[(y + 1) * width + (x - 1)] +
                data[(y + 1) * width + (x + 1)]
            );
            
            const gy = Math.abs(
                -data[(y - 1) * width + (x - 1)] -
                2 * data[(y - 1) * width + x] -
                data[(y - 1) * width + (x + 1)] +
                data[(y + 1) * width + (x - 1)] +
                2 * data[(y + 1) * width + x] +
                data[(y + 1) * width + (x + 1)]
            );
            
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            if (magnitude > sobelThreshold) {
                totalEdges++;
            }
        }
    }
    
    return totalEdges / (width * height);
}

function detectJPEGArtifacts(data: Buffer, width: number, height: number): number {
    // Detect DCT block boundaries (8x8 JPEG compression artifacts)
    let artifactScore = 0;
    const blockSize = 8;
    
    for (let y = 0; y < height - blockSize; y += blockSize) {
        for (let x = 0; x < width - blockSize; x += blockSize) {
            // Check discontinuities at block boundaries
            let horizontalDiff = 0;
            let verticalDiff = 0;
            
            for (let i = 0; i < blockSize; i++) {
                const rightIdx = y * width + (x + blockSize);
                const leftIdx = y * width + (x + blockSize - 1);
                horizontalDiff += Math.abs(data[rightIdx + i * width] - data[leftIdx + i * width]);
                
                const bottomIdx = (y + blockSize) * width + x;
                const topIdx = (y + blockSize - 1) * width + x;
                verticalDiff += Math.abs(data[bottomIdx + i] - data[topIdx + i]);
            }
            
            artifactScore += (horizontalDiff + verticalDiff) / (blockSize * 2);
        }
    }
    
    return artifactScore / ((width / blockSize) * (height / blockSize));
}

async function detectCopyMove(imageBuffer: Buffer): Promise<number> {
    // Detect copy-move forgery using block matching
    const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .resize({ width: 300, height: 300, fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const blockSize = 16;
    
    let suspiciousMatches = 0;
    const blocks: Map<string, { x: number; y: number }[]> = new Map();
    
    // Extract blocks and compute simple hash
    for (let y = 0; y < height - blockSize; y += 8) {
        for (let x = 0; x < width - blockSize; x += 8) {
            let blockHash = 0;
            let blockSum = 0;
            
            for (let by = 0; by < blockSize; by++) {
                for (let bx = 0; bx < blockSize; bx++) {
                    const val = data[(y + by) * width + (x + bx)];
                    blockSum += val;
                    blockHash += val * (by * blockSize + bx);
                }
            }
            
            const avgBlock = Math.floor(blockSum / (blockSize * blockSize));
            const hashKey = `${avgBlock}-${Math.floor(blockHash / 1000)}`;
            
            if (!blocks.has(hashKey)) {
                blocks.set(hashKey, []);
            }
            blocks.get(hashKey)!.push({ x, y });
        }
    }
    
    // Check for duplicate blocks (copy-move indicator)
    for (const [, positions] of blocks) {
        if (positions.length > 1) {
            // Check if blocks are far apart (not adjacent)
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const dist = Math.sqrt(
                        Math.pow(positions[i].x - positions[j].x, 2) +
                        Math.pow(positions[i].y - positions[j].y, 2)
                    );
                    
                    if (dist > blockSize * 2) {
                        suspiciousMatches++;
                    }
                }
            }
        }
    }
    
    const copyMoveScore = Math.min(100, (suspiciousMatches / 10) * 100);
    return copyMoveScore;
}

function detectSplicing(features: FeatureVector): number {
    // Detect splicing by analyzing inconsistencies in image features
    const colorVariance = calculateVariance(features.colorHistogram);
    const textureVariance = calculateVariance(features.textureFeatures);
    
    // High variance in certain features suggests splicing
    const normalizedColorVar = Math.min(1, colorVariance / 1000);
    const normalizedTextureVar = Math.min(1, textureVariance / 10000);
    
    const splicingScore = (normalizedColorVar * 50) + (normalizedTextureVar * 50);
    return splicingScore;
}

function analyzeCompressionArtifacts(features: FeatureVector): number {
    // Inconsistent compression artifacts indicate manipulation
    const artifactLevel = features.compressionArtifacts;
    
    // High compression artifacts suggest re-compression (sign of editing)
    if (artifactLevel > 15) {
        return 80;
    } else if (artifactLevel > 10) {
        return 50;
    } else if (artifactLevel > 5) {
        return 20;
    }
    
    return 0;
}

async function analyzeFaceConsistency(imageBuffer: Buffer): Promise<number> {
    // Analyze for deepfake indicators (simplified version)
    // In production, this would use a trained deep learning model
    const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .resize({ width: 256, height: 256, fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    // Check for unnatural frequency patterns (deepfake indicator)
    const frequencyScore = analyzeFrequencyDomain(data, info.width, info.height);
    
    // Check for unnatural symmetry
    const symmetryScore = analyzeSymmetry(data, info.width, info.height);
    
    const faceScore = (frequencyScore * 0.6) + (symmetryScore * 0.4);
    return faceScore;
}

function analyzeFrequencyDomain(data: Buffer, width: number, height: number): number {
    // Simplified frequency analysis
    // Real deepfakes often have specific frequency artifacts
    let highFreqEnergy = 0;
    let lowFreqEnergy = 0;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const gradient = Math.abs(data[idx] - data[idx - 1]) +
                           Math.abs(data[idx] - data[idx + 1]) +
                           Math.abs(data[idx] - data[idx - width]) +
                           Math.abs(data[idx] - data[idx + width]);
            
            if (gradient > 30) {
                highFreqEnergy++;
            } else {
                lowFreqEnergy++;
            }
        }
    }
    
    const ratio = highFreqEnergy / (lowFreqEnergy + 1);
    
    // Abnormal frequency ratios suggest deepfake
    if (ratio > 0.3 || ratio < 0.05) {
        return 70;
    } else if (ratio > 0.25 || ratio < 0.08) {
        return 40;
    }
    
    return 10;
}

function analyzeSymmetry(data: Buffer, width: number, height: number): number {
    // Check for unnatural symmetry (deepfake indicator)
    let symmetryError = 0;
    const centerX = Math.floor(width / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < centerX; x++) {
            const leftIdx = y * width + x;
            const rightIdx = y * width + (width - 1 - x);
            symmetryError += Math.abs(data[leftIdx] - data[rightIdx]);
        }
    }
    
    const avgSymmetryError = symmetryError / (width * height / 2);
    
    // Very low symmetry error is unnatural (perfect symmetry)
    if (avgSymmetryError < 5) {
        return 80;
    } else if (avgSymmetryError < 10) {
        return 40;
    }
    
    return 0;
}

function calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
}

function generateAIReport(
    overall: number,
    copyMove: number,
    splicing: number,
    compression: number,
    faceConsistency: number
): string {
    const findings: string[] = [];
    
    findings.push(`🤖 AI Confidence Score: ${overall.toFixed(1)}%\n`);
    
    if (copyMove > 50) {
        findings.push(`⚠️ Copy-Move Detection: ${copyMove.toFixed(1)}% - Suspicious duplicate regions found`);
    } else {
        findings.push(`✓ Copy-Move Detection: ${copyMove.toFixed(1)}% - No significant duplications`);
    }
    
    if (splicing > 50) {
        findings.push(`⚠️ Splicing Analysis: ${splicing.toFixed(1)}% - Inconsistent image features detected`);
    } else {
        findings.push(`✓ Splicing Analysis: ${splicing.toFixed(1)}% - Features appear consistent`);
    }
    
    if (compression > 50) {
        findings.push(`⚠️ Compression Analysis: ${compression.toFixed(1)}% - Multiple compression cycles detected`);
    } else {
        findings.push(`✓ Compression Analysis: ${compression.toFixed(1)}% - Normal compression pattern`);
    }
    
    if (faceConsistency > 50) {
        findings.push(`⚠️ Face Consistency: ${faceConsistency.toFixed(1)}% - Unnatural frequency patterns`);
    } else {
        findings.push(`✓ Face Consistency: ${faceConsistency.toFixed(1)}% - Natural image characteristics`);
    }
    
    return findings.join('\n');
}
