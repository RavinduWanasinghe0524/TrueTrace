import { analyzeMetadata } from './detectors/metadata';
import { analyzeELA } from './detectors/ela';
import { analyzeNoiseVariance } from './detectors/noise-variance';
import { AnalysisResult } from './types';

export async function analyzeImage(imageBuffer: Buffer): Promise<AnalysisResult> {
    // Run all detectors in parallel
    const [metadataResult, elaAnalysis, noiseAnalysis] = await Promise.all([
        analyzeMetadata(imageBuffer),
        analyzeELA(imageBuffer),
        analyzeNoiseVariance(imageBuffer),
    ]);

    const results = [
        metadataResult,
        elaAnalysis.result,
        noiseAnalysis.result,
    ];

    // Calculate weighted final score
    const weights = {
        Metadata: 0.2,
        ELA: 0.4,
        'Noise Variance': 0.4,
    };

    const finalScore = results.reduce((total, result) => {
        const weight = weights[result.detector as keyof typeof weights] || 0;
        return total + result.score * weight;
    }, 0);

    // Convert images to base64 for frontend
    const elaBase64 = `data:image/jpeg;base64,${elaAnalysis.elaImage.toString('base64')}`;
    const noiseMapBase64 = `data:image/jpeg;base64,${noiseAnalysis.noiseMap.toString('base64')}`;

    return {
        results,
        finalScore,
        debugImages: {
            ela: elaBase64,
            noiseMap: noiseMapBase64,
        },
    };
}
