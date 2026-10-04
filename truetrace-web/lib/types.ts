export interface DetectorResult {
  detector: string;
  result: 'Pass' | 'Fail' | 'Warning';
  details: string;
  score: number;
}

export interface AnalysisResult {
  results: DetectorResult[];
  finalScore: number;
  verdict?: string;
  isAiGenerated?: boolean;
  category?: 'ai_generated' | 'document_tampered' | 'manipulated_image' | 'authentic' | 'general' | string;
  confidence?: number;
  summary?: string;
  debugImages: {
    ela: string;
    noiseMap: string;
  };
}
