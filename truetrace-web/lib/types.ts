export interface DetectorResult {
  detector: string;
  result: 'Pass' | 'Fail' | 'Warning';
  details: string;
  score: number;
}

export interface AnalysisResult {
  results: DetectorResult[];
  finalScore: number;
  debugImages: {
    ela: string;
    noiseMap: string;
  };
}
