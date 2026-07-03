import { analyzeMetadata } from './detectors/metadata';
import { analyzeELA } from './detectors/ela';
import { analyzeNoiseVariance } from './detectors/noise-variance';
import { analyzeWithAI } from './detectors/ai-forensics';
import { AnalysisResult } from './types';

export async function analyzeImage(imageBuffer: Buffer): Promise<AnalysisResult> {
    // Run all detectors in parallel
    const [metadataResult, elaAnalysis, noiseAnalysis, aiResult] = await Promise.all([
        analyzeMetadata(imageBuffer),
        analyzeELA(imageBuffer),
        analyzeNoiseVariance(imageBuffer),
        analyzeWithAI(imageBuffer),
    ]);

    const results = [
        metadataResult,
        elaAnalysis.result,
        noiseAnalysis.result,
        aiResult,
    ];

    // Each detector returns a "manipulation probability" score (0 = clean, 100 = clearly manipulated)
    // Weights reflect the reliability of each detector
    const weights: Record<string, number> = {
        'Metadata': 0.15,       // Weakest signal on its own
        'ELA': 0.30,            // Strong spatial signal
        'Noise Variance': 0.25, // Good for splicing
        'AI Forensics': 0.30,   // Combined multi-technique signal
    };

    const manipulationScore = results.reduce((total, result) => {
        const weight = weights[result.detector] ?? 0;
        return total + result.score * weight;
    }, 0);

    // Consensus boost: if 3+ detectors agree strongly, increase confidence
    const failCount = results.filter(r => r.result === 'Fail').length;
    const passCount = results.filter(r => r.result === 'Pass').length;

    let consensusAdjustment = 0;
    if (failCount >= 3) {
        consensusAdjustment = +8; // Push score higher (more manipulated)
    } else if (passCount >= 3) {
        consensusAdjustment = -8; // Push score lower (more authentic)
    }

    const finalManipulationScore = Math.max(0, Math.min(100,
        Math.round(manipulationScore + consensusAdjustment)
    ));

    // Convert to AUTHENTICITY score: 100 = definitely real, 0 = definitely fake
    const authenticityScore = 100 - finalManipulationScore;

    // Convert images to base64 for frontend
    const elaBase64 = `data:image/jpeg;base64,${elaAnalysis.elaImage.toString('base64')}`;
    const noiseMapBase64 = `data:image/jpeg;base64,${noiseAnalysis.noiseMap.toString('base64')}`;

    return {
        results,
        finalScore: authenticityScore,  // Now correctly: high = real, low = fake
        debugImages: {
            ela: elaBase64,
            noiseMap: noiseMapBase64,
        },
    };
}
